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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range || '20-1!A1:Z100', // Default to 20-1 sheet which contains guild battle data
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet.')
    }

    console.log(`📊 Fetched ${rows.length} rows from Google Sheets`)
    console.log('First few rows:', rows.slice(0, 5))

    // Parse the spreadsheet data
    const players = parseSpreadsheetData(rows)
    
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
    console.error('❌ Google Sheets fetch error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Google Sheets fetch error: ${error.message}`,
    })
  }
})

function parseSpreadsheetData(rows: any[][]): any[] {
  const players: any[] = []
  
  if (!rows || rows.length < 2) {
    console.log('Not enough rows to parse')
    return players
  }
  
  // First, identify the boss sections by looking at the header rows
  const headerRow = rows[0] || []
  const subHeaderRow = rows[1] || []
  
  console.log('Header row:', headerRow)
  console.log('Sub-header row:', subHeaderRow)
  
  // Find the column ranges for each boss
  const bossSections = findBossSections(headerRow, subHeaderRow)
  console.log('Boss sections found:', bossSections)
  
  // Skip header rows (first 2 rows contain boss names and column headers)
  const dataRows = rows.slice(2)
  
  // Find the end of player data (look for summary row or empty rows)
  let endIndex = dataRows.length
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    // Stop at summary row (contains "DAMAGE REQ" or similar)
    if (row && row.length > 0 && 
        (row[0]?.toString().includes('DAMAGE REQ') || 
         row[0]?.toString().includes('DAMAGE GOAL') ||
         row[0]?.toString().includes('Min Tickets'))) {
      endIndex = i
      break
    }
    // Stop at empty rows
    if (!row || row.length === 0 || !row[0]) {
      endIndex = i
      break
    }
  }
  
  const playerRows = dataRows.slice(0, endIndex)
  
  console.log(`Processing ${playerRows.length} player rows (stopped at row ${endIndex})`)
  
  playerRows.forEach((row, index) => {
    if (row.length < 6) return // Skip incomplete rows
    
    const rank = index + 1
    const playerName = row[1] || `Player ${rank}`
    
    // Parse data for each boss using the identified sections
    const redVelvetData = parseBossData(row, bossSections.redVelvetDragon)
    const avatarData = parseBossData(row, bossSections.avatarOfDestiny)
    const livingAbyssData = parseBossData(row, bossSections.livingAbyss)
    
    players.push({
      rank,
      playerName,
      redVelvetDragon: redVelvetData,
      avatarOfDestiny: avatarData,
      livingAbyss: livingAbyssData
    })
  })
  
  return players
}

function findBossSections(headerRow: any[], subHeaderRow: any[]): {
  redVelvetDragon: { start: number; end: number; damageCol: number; battlesCol: number; avgCol: number } | null
  avatarOfDestiny: { start: number; end: number; damageCol: number; battlesCol: number; avgCol: number } | null
  livingAbyss: { start: number; end: number; damageCol: number; battlesCol: number; avgCol: number } | null
} {
  const sections = {
    redVelvetDragon: null,
    avatarOfDestiny: null,
    livingAbyss: null
  }
  
  // Look for boss names in the header row
  for (let i = 0; i < headerRow.length; i++) {
    const headerText = (headerRow[i] || '').toString().toLowerCase()
    
    if (headerText.includes('red velvet dragon') || headerText.includes('red velvet')) {
      // Find the end of this section (look for next boss or end of data)
      let endCol = i + 6 // Default to 6 columns per boss section
      for (let j = i + 1; j < headerRow.length; j++) {
        const nextHeader = (headerRow[j] || '').toString().toLowerCase()
        if (nextHeader.includes('avatar of destiny') || nextHeader.includes('living abyss') || nextHeader.includes('avatar') || nextHeader.includes('living')) {
          endCol = j
          break
        }
      }
      
      // Find the specific columns within this section
      const damageCol = findColumnInSection(subHeaderRow, i, endCol, ['damage'])
      const battlesCol = findColumnInSection(subHeaderRow, i, endCol, ['battles done', 'battles'])
      const avgCol = findColumnInSection(subHeaderRow, i, endCol, ['avg dmg/ticket', 'avg', 'average'])
      
      sections.redVelvetDragon = {
        start: i,
        end: endCol,
        damageCol: damageCol !== -1 ? damageCol : i + 2, // Default to column 2 if not found
        battlesCol: battlesCol !== -1 ? battlesCol : i + 4, // Default to column 4 if not found
        avgCol: avgCol !== -1 ? avgCol : i + 5 // Default to column 5 if not found
      }
    }
    
    if (headerText.includes('avatar of destiny') || headerText.includes('avatar')) {
      // Find the end of this section
      let endCol = i + 6 // Default to 6 columns per boss section
      for (let j = i + 1; j < headerRow.length; j++) {
        const nextHeader = (headerRow[j] || '').toString().toLowerCase()
        if (nextHeader.includes('living abyss') || nextHeader.includes('living')) {
          endCol = j
          break
        }
      }
      
      // Find the specific columns within this section
      const damageCol = findColumnInSection(subHeaderRow, i, endCol, ['damage'])
      const battlesCol = findColumnInSection(subHeaderRow, i, endCol, ['battles done', 'battles'])
      const avgCol = findColumnInSection(subHeaderRow, i, endCol, ['avg dmg/ticket', 'avg', 'average'])
      
      sections.avatarOfDestiny = {
        start: i,
        end: endCol,
        damageCol: damageCol !== -1 ? damageCol : i + 2, // Default to column 2 if not found
        battlesCol: battlesCol !== -1 ? battlesCol : i + 4, // Default to column 4 if not found
        avgCol: avgCol !== -1 ? avgCol : i + 5 // Default to column 5 if not found
      }
    }
    
    if (headerText.includes('living abyss') || headerText.includes('living')) {
      // Find the end of this section (last boss, so go to end of data)
      let endCol = headerRow.length
      
      // Find the specific columns within this section
      const damageCol = findColumnInSection(subHeaderRow, i, endCol, ['damage'])
      const battlesCol = findColumnInSection(subHeaderRow, i, endCol, ['battles done', 'battles'])
      const avgCol = findColumnInSection(subHeaderRow, i, endCol, ['avg dmg/ticket', 'avg', 'average'])
      
      sections.livingAbyss = {
        start: i,
        end: endCol,
        damageCol: damageCol !== -1 ? damageCol : i + 2, // Default to column 2 if not found
        battlesCol: battlesCol !== -1 ? battlesCol : i + 4, // Default to column 4 if not found
        avgCol: avgCol !== -1 ? avgCol : i + 5 // Default to column 5 if not found
      }
    }
  }
  
  return sections
}

function findColumnInSection(subHeaderRow: any[], startCol: number, endCol: number, keywords: string[]): number {
  for (let i = startCol; i < endCol && i < subHeaderRow.length; i++) {
    const subHeaderText = (subHeaderRow[i] || '').toString().toLowerCase()
    for (const keyword of keywords) {
      if (subHeaderText.includes(keyword)) {
        return i
      }
    }
  }
  return -1
}

function parseBossData(row: any[], section: { start: number; end: number; damageCol: number; battlesCol: number; avgCol: number } | null): {
  damage: number
  battles: number
  avgDamagePerTicket: number
} {
  if (!section) {
    return { damage: 0, battles: 0, avgDamagePerTicket: 0 }
  }
  
  // Parse damage (convert from "Billion" format to actual number)
  const damageText = row[section.damageCol] || ''
  const damage = parseFloat(damageText.replace(' Billion', '')) * 1000000000 || 0
  
  // Parse battles (tickets used)
  const battlesRaw = parseInt(row[section.battlesCol]) || 0
  // If no damage recorded, battles should be 0 (player didn't actually participate)
  const battles = damage > 0 ? battlesRaw : 0
  
  // Parse average damage per ticket
  const avgDamagePerTicket = parseInt(row[section.avgCol]) || 0
  
  return {
    damage,
    battles,
    avgDamagePerTicket
  }
}


