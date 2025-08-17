import { defineEventHandler, readBody } from 'h3'
import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { spreadsheetId, range } = body

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is required.')
  }

  try {
    // Get credentials path from environment variable
    const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH
    if (!credentialsPath) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS_PATH environment variable is not set.')
    }

    // Read service account credentials
    const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'))
    
    // Initialize Google Sheets API with service account
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range || '20-1!A1:Z100', // Default to 20-1 sheet which contains guild battle data
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet.')
    }

    console.log(`📊 Fetched ${rows.length} rows from Google Sheets`)

    // Parse the spreadsheet data
    const players = parseSpreadsheetData(rows)
    
    console.log(`✅ Successfully parsed ${players.length} players from Google Sheets`)

    return {
      message: 'Google Sheets data fetched successfully!',
      data: players,
      totalPlayers: players.length
    }
  } catch (error: any) {
    console.error('❌ Google Sheets fetch error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Google Sheets fetch error: ${error.message}`,
    })
  }
})

function parseSpreadsheetData(rows: any[][]): any[] {
  const players: any[] = []
  
  // Skip header rows (first 2 rows contain boss names and column headers)
  const dataRows = rows.slice(2)
  
  // Find the end of player data (look for empty rows)
  let endIndex = dataRows.length
  for (let i = 0; i < dataRows.length; i++) {
    if (!dataRows[i] || dataRows[i].length === 0 || !dataRows[i][0]) {
      endIndex = i
      break
    }
  }
  
  const playerRows = dataRows.slice(0, endIndex)
  
  playerRows.forEach((row, index) => {
    if (row.length < 12) return // Skip incomplete rows
    
    const rank = index + 1
    const playerName = row[1] || `Player ${rank}`
    
    // Parse Red Velvet Dragon data (columns 2-4)
    const redVelvetDamage = parseFloat(row[2]) || 0
    const redVelvetBattles = parseInt(row[3]) || 0
    const redVelvetAvg = parseInt(row[4]) || 0
    
    // Parse Avatar of Destiny data (columns 6-8)
    const avatarDamage = parseFloat(row[6]) || 0
    const avatarBattles = parseInt(row[7]) || 0
    const avatarAvg = parseInt(row[8]) || 0
    
    // Parse Living Abyss data (columns 10-12)
    const livingAbyssDamage = parseFloat(row[10]) || 0
    const livingAbyssBattles = parseInt(row[11]) || 0
    const livingAbyssAvg = parseInt(row[12]) || 0
    
    players.push({
      rank,
      playerName,
      redVelvetDragon: {
        damage: redVelvetDamage,
        battles: redVelvetBattles,
        avgDamagePerTicket: redVelvetAvg
      },
      avatarOfDestiny: {
        damage: avatarDamage,
        battles: avatarBattles,
        avgDamagePerTicket: avatarAvg
      },
      livingAbyss: {
        damage: livingAbyssDamage,
        battles: livingAbyssBattles,
        avgDamagePerTicket: livingAbyssAvg
      }
    })
  })
  
  return players
}
