import { defineEventHandler, readBody, createError, setHeader } from 'h3'
import { google } from 'googleapis'
import { parseSeasonId } from '../../utils/seasonConfig'
import { parseSpreadsheetRowsToPlayers } from '../../utils/sheetPlayerParse'

export default defineEventHandler(async (event) => {
  // Set cache control headers to prevent caching
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  
  const body = await readBody(event)
  const { spreadsheetId, range, raw } = body

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is required.')
  }

  // Helper function to properly format sheet names that might need quoting
  const formatRange = (rangeStr: string): string => {
    if (!rangeStr) return '20-1!A1:Z100'
    
    // Extract sheet name and range parts
    const parts = rangeStr.split('!')
    if (parts.length !== 2) return rangeStr
    
    const sheetName = parts[0]
    const cellRange = parts[1]
    
    // If sheet name starts with a number, contains special characters, or has spaces, quote it
    // Google Sheets API requires single quotes for sheet names with spaces or special characters
    if (/^\d/.test(sheetName) || sheetName.includes('-') || sheetName.includes(' ')) {
      // Only add quotes if not already quoted
      const quotedSheetName = sheetName.startsWith("'") && sheetName.endsWith("'") 
        ? sheetName 
        : `'${sheetName}'`
      return `${quotedSheetName}!${cellRange}`
    }
    
    return rangeStr
  }
  
  const formattedRange = formatRange(range || '20-1!A1:Z100')
  console.log(`📊 Original range: ${range || '20-1!A1:Z100'}, Formatted range: ${formattedRange}`)

  try {
    // Get credentials from environment variable
    const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsJson) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set.')
    }

    // Parse service account credentials
    const credentials = JSON.parse(credentialsJson)
    
    // Initialize Google Sheets API with service account
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // Fetch data from Google Sheets
    let response
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: formattedRange,
      })
    } catch (sheetsError: any) {
      // Handle Google Sheets API specific errors
      const errorCode = sheetsError.code || sheetsError.response?.status
      const errorMessage = sheetsError.message || sheetsError.response?.data?.error?.message || 'Unknown error'
      
      if (errorCode === 400) {
        throw new Error(`Invalid range or sheet not found: "${formattedRange}". ${errorMessage}. Please check if the sheet exists in the spreadsheet.`)
      } else if (errorCode === 404) {
        throw new Error(`Spreadsheet or sheet not found: "${formattedRange}". ${errorMessage}. Please check the spreadsheet ID and sheet name.`)
      } else if (errorCode === 403) {
        throw new Error(`Access denied. ${errorMessage}. Please ensure the service account has access to the spreadsheet.`)
      }
      // Re-throw with more context
      throw new Error(`Google Sheets API error: ${errorMessage}`)
    }

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      throw new Error(`No data found in the spreadsheet range: ${formattedRange}. The sheet might be empty or the range is incorrect.`)
    }

    console.log(`📊 Fetched ${rows.length} rows from Google Sheets`)
    console.log('First few rows:', rows.slice(0, 5))

    // If raw flag is set, return raw rows instead of parsed data
    if (raw) {
      return {
        message: 'Google Sheets data fetched successfully!',
        data: rows,
        values: rows,
        totalRows: rows.length
      }
    }

    // Parse the spreadsheet data
    const sheetName = (range ?? '20-1!A1:Z100').split('!')[0]?.replace(/^'|'$/g, '') ?? ''
    const seasonParsed = parseSeasonId(sheetName)
    const players = parseSpreadsheetRowsToPlayers(rows, seasonParsed ?? undefined).map((p, index) => ({
      ...p,
      rank: index + 1
    }))
    
    console.log(`✅ Successfully parsed ${players.length} players from Google Sheets`)
    if (players.length > 0) {
      console.log('Sample player data:', players[0])
    }

    return {
      message: 'Google Sheets data fetched successfully!',
      data: players,
      totalPlayers: players.length
    }
  } catch (error: any) {
    console.error('❌ Google Sheets fetch error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack
    })
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to fetch Google Sheets data'
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
      // Check if it's a sheet not found error
      if (error.message.includes('sheet not found') || error.message.includes('Invalid range')) {
        statusCode = 404
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to Google Sheets API. Please check your internet connection.'
      statusCode = 503
    } else if (error.code === 403 || error.response?.status === 403) {
      errorMessage = 'Access denied. Please check Google Sheets credentials and permissions.'
      statusCode = 403
    } else if (error.code === 404 || error.response?.status === 404) {
      errorMessage = 'Spreadsheet or sheet not found. Please check the spreadsheet ID and sheet name.'
      statusCode = 404
    } else if (error.code === 400 || error.response?.status === 400) {
      errorMessage = `Invalid request: ${error.response?.data?.error?.message || error.message || 'Invalid range or sheet name'}`
      statusCode = 400
    }
    
    throw createError({
      statusCode,
      statusMessage: `Google Sheets fetch error: ${errorMessage}`,
      data: {
        originalError: error.message,
        code: error.code,
        range: formattedRange || range || '20-1!A1:Z100'
      }
    })
  }
})

