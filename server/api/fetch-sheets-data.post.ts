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
    
    // Parse Red Velvet Dragon data (columns A-F: 0-5)
    // Column 2 (C) contains damage in "Billion" format
    const redVelvetDamageText = row[2] || ''
<<<<<<< HEAD
    const redVelvetDamage = parseFloat(redVelvetDamageText.replace(' Billion', '')) * 1000000000 || 0 // Convert to actual number
    const redVelvetBattlesRaw = parseInt(row[4]) || 0 // Column E - "Battles Done" = tickets used
    // If no damage recorded, battles should be 0 (player didn't actually participate)
    const redVelvetBattles = redVelvetDamage > 0 ? redVelvetBattlesRaw : 0
=======
    const redVelvetDamage = parseFloat(redVelvetDamageText.replace(' Billion', '')) || 0
    const redVelvetBattles = parseInt(row[4]) || 0 // Column E
>>>>>>> c43adee1ac259c3d0f50f12006f95c620807650b
    const redVelvetAvg = parseInt(row[5]) || 0 // Column F
    
    // Parse Avatar of Destiny data (columns H-M: 7-12)
    const avatarDamageText = row[9] || '' // Column J
<<<<<<< HEAD
    const avatarDamage = parseFloat(avatarDamageText.replace(' Billion', '')) * 1000000000 || 0 // Convert to actual number
    const avatarBattlesRaw = parseInt(row[11]) || 0 // Column L - "Battles Done" = tickets used
    // If no damage recorded, battles should be 0 (player didn't actually participate)
    const avatarBattles = avatarDamage > 0 ? avatarBattlesRaw : 0
=======
    const avatarDamage = parseFloat(avatarDamageText.replace(' Billion', '')) || 0
    const avatarBattles = parseInt(row[11]) || 0 // Column L
>>>>>>> c43adee1ac259c3d0f50f12006f95c620807650b
    const avatarAvg = parseInt(row[12]) || 0 // Column M
    
    // Parse Living Abyss data (columns O-T: 14-19)
    const livingAbyssDamageText = row[16] || '' // Column Q
<<<<<<< HEAD
    const livingAbyssDamage = parseFloat(livingAbyssDamageText.replace(' Billion', '')) * 1000000000 || 0 // Convert to actual number
    const livingAbyssBattlesRaw = parseInt(row[18]) || 0 // Column S - "Battles Done" = tickets used
    // If no damage recorded, battles should be 0 (player didn't actually participate)
    const livingAbyssBattles = livingAbyssDamage > 0 ? livingAbyssBattlesRaw : 0
=======
    const livingAbyssDamage = parseFloat(livingAbyssDamageText.replace(' Billion', '')) || 0
    const livingAbyssBattles = parseInt(row[18]) || 0 // Column S
>>>>>>> c43adee1ac259c3d0f50f12006f95c620807650b
    const livingAbyssAvg = parseInt(row[19]) || 0 // Column T
    
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
