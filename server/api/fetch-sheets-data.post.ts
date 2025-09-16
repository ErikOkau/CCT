import { defineEventHandler, readBody, createError, setHeader } from 'h3'
import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  // Set cache control headers to prevent caching
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  
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
  
  // Create an object to store all unique players and their data
  const playerMap: { [key: string]: any } = {}
  
  playerRows.forEach((row, index) => {
    if (row.length < 20) {
      console.log(`Skipping row ${index + 1}: insufficient columns (${row.length})`)
      return
    }
    
    // Parse Red Velvet Dragon data (columns A-F: 0-5)
    const redVelvetMemberName = row[1]
    const redVelvetDamageText = row[2] || ''
    const redVelvetDamage = parseFloat(redVelvetDamageText.replace(' Billion', '')) * 1000000000 || 0
    const redVelvetBattlesRaw = parseInt(row[4]) || 0
    const redVelvetBattles = redVelvetDamage > 0 ? redVelvetBattlesRaw : 0
    const redVelvetAvg = parseInt(row[5]) || 0
    
    // Parse Avatar of Destiny data (columns H-M: 7-12)
    const avatarMemberName = row[8]
    const avatarDamageText = row[9] || ''
    const avatarDamage = parseFloat(avatarDamageText.replace(' Billion', '')) * 1000000000 || 0
    const avatarBattlesRaw = parseInt(row[11]) || 0
    const avatarBattles = avatarDamage > 0 ? avatarBattlesRaw : 0
    const avatarAvg = parseInt(row[12]) || 0
    
    // Parse Living Abyss data (columns O-T: 14-19)
    const livingAbyssMemberName = row[15]
    const livingAbyssDamageText = row[16] || ''
    const livingAbyssDamage = parseFloat(livingAbyssDamageText.replace(' Billion', '')) * 1000000000 || 0
    const livingAbyssBattlesRaw = parseInt(row[18]) || 0
    const livingAbyssBattles = livingAbyssDamage > 0 ? livingAbyssBattlesRaw : 0
    const livingAbyssAvg = parseInt(row[19]) || 0
    
    // Parse Machine God data (columns V-AA: 21-26)
    const machineGodMemberName = row[22]
    const machineGodDamageText = row[23] || ''
    const machineGodDamage = parseFloat(machineGodDamageText.replace(' Billion', '')) * 1000000000 || 0
    const machineGodBattlesRaw = parseInt(row[25]) || 0
    const machineGodBattles = machineGodDamage > 0 ? machineGodBattlesRaw : 0
    const machineGodAvg = parseInt(row[26]) || 0
    
    // Process each boss section independently
    const bossSections = [
      { name: redVelvetMemberName, damage: redVelvetDamage, battles: redVelvetBattles, avg: redVelvetAvg, type: 'redVelvetDragon' },
      { name: avatarMemberName, damage: avatarDamage, battles: avatarBattles, avg: avatarAvg, type: 'avatarOfDestiny' },
      { name: livingAbyssMemberName, damage: livingAbyssDamage, battles: livingAbyssBattles, avg: livingAbyssAvg, type: 'livingAbyss' },
      { name: machineGodMemberName, damage: machineGodDamage, battles: machineGodBattles, avg: machineGodAvg, type: 'machineGod' }
    ]
    
    bossSections.forEach(boss => {
      if (boss.name && boss.name.trim() && boss.damage > 0) {
        if (!playerMap[boss.name]) {
          playerMap[boss.name] = {
            playerName: boss.name,
            redVelvetDragon: { damage: 0, battles: 0, avgDamagePerTicket: 0 },
            avatarOfDestiny: { damage: 0, battles: 0, avgDamagePerTicket: 0 },
            livingAbyss: { damage: 0, battles: 0, avgDamagePerTicket: 0 },
            machineGod: { damage: 0, battles: 0, avgDamagePerTicket: 0 }
          }
        }
        
        const player = playerMap[boss.name]
        player[boss.type] = {
          damage: boss.damage,
          battles: boss.battles,
          avgDamagePerTicket: boss.avg
        }
        
        console.log(`Added ${boss.name} to ${boss.type}: ${boss.damage} damage, ${boss.battles} battles`)
        
        // Special debugging for Machine God data
        if (boss.type === 'machineGod') {
          console.log(`🔍 Machine God data for ${boss.name}:`, {
            damage: boss.damage,
            battles: boss.battles,
            avg: boss.avg
          })
        }
      }
    })
  })
  
  // Convert object to array and assign ranks
  let rank = 1
  for (const playerName in playerMap) {
    const player = playerMap[playerName]
    player.rank = rank++
    players.push(player)
  }
  
  // Debug: Check Machine God data in final result
  const playersWithMG = players.filter(p => p.machineGod && p.machineGod.battles > 0)
  console.log(`🔍 Final result: ${playersWithMG.length} players with Machine God battles`)
  if (playersWithMG.length > 0) {
    console.log('Sample Machine God players:', playersWithMG.slice(0, 3).map(p => ({
      name: p.playerName,
      mgBattles: p.machineGod.battles,
      mgDamage: p.machineGod.damage
    })))
  }
  
  return players
}


