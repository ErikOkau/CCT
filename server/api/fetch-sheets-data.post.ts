import { defineEventHandler, readBody, createError } from 'h3'
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
  console.log('Sample row structure:', playerRows[0])
  
  playerRows.forEach((row, index) => {
    if (row.length < 20) {
      console.log(`Skipping row ${index + 1}: insufficient columns (${row.length})`)
      return
    }
    
    const rank = index + 1
    
    // Parse Red Velvet Dragon data (columns A-F: 0-5)
    // Column 1 (B) contains member names, Column 2 (C) contains damage
    const redVelvetMemberName = row[1] || `Player ${rank}`
    const redVelvetDamageText = row[2] || ''
    const redVelvetDamage = parseFloat(redVelvetDamageText.replace(' Billion', '')) * 1000000000 || 0
    const redVelvetBattlesRaw = parseInt(row[4]) || 0 // Column E - "Battles Done"
    const redVelvetBattles = redVelvetBattlesRaw // Remove damage check - battles can exist even with 0 damage
    const redVelvetAvg = parseInt(row[5]) || 0 // Column F
    
    // Parse Avatar of Destiny data (columns H-M: 7-12)
    // Column 8 (I) contains member names, Column 9 (J) contains damage
    const avatarMemberName = row[8] || `Player ${rank}`
    const avatarDamageText = row[9] || ''
    const avatarDamage = parseFloat(avatarDamageText.replace(' Billion', '')) * 1000000000 || 0
    const avatarBattlesRaw = parseInt(row[10]) || 0 // Column K - "Battles Done"
    const avatarBattles = avatarBattlesRaw // Remove damage check - battles can exist even with 0 damage
    const avatarAvg = parseInt(row[11]) || 0 // Column L
    
    // Parse Living Abyss data (columns O-T: 14-19)
    // Column 15 (P) contains member names, Column 16 (Q) contains damage
    const livingAbyssMemberName = row[15] || `Player ${rank}`
    const livingAbyssDamageText = row[16] || ''
    const livingAbyssDamage = parseFloat(livingAbyssDamageText.replace(' Billion', '')) * 1000000000 || 0
    const livingAbyssBattlesRaw = parseInt(row[17]) || 0 // Column R - "Battles Done"
    const livingAbyssBattles = livingAbyssBattlesRaw // Remove damage check - battles can exist even with 0 damage
    const livingAbyssAvg = parseInt(row[18]) || 0 // Column S
    
    // Use the member name from the boss section that has actual data
    // Priority: Avatar of Destiny > Living Abyss > Red Velvet Dragon
    let playerName = avatarMemberName
    if (!avatarMemberName || avatarMemberName === `Player ${rank}` || avatarMemberName === rank.toString()) {
      playerName = livingAbyssMemberName
    }
    if (!playerName || playerName === `Player ${rank}` || playerName === rank.toString()) {
      playerName = redVelvetMemberName
    }
    
    // Additional fallback: if all names are just numbers, try to find a meaningful name
    if (playerName === rank.toString() || playerName === `Player ${rank}`) {
      // Look for any non-numeric name in the row
      for (let col = 0; col < row.length; col++) {
        const cellValue = row[col]
        if (cellValue && typeof cellValue === 'string' && 
            cellValue.length > 2 && 
            !cellValue.match(/^\d+$/) && 
            !cellValue.includes('Billion') && 
            !cellValue.includes('Battles') &&
            !cellValue.includes('avg')) {
          playerName = cellValue
          console.log(`Found alternative name for rank ${rank}: ${playerName} in column ${col}`)
          break
        }
      }
    }
    
    console.log(`Rank ${rank}: ${playerName} | RVD: ${redVelvetDamageText} | AoD: ${avatarDamageText} | LA: ${livingAbyssDamageText}`)
    
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


