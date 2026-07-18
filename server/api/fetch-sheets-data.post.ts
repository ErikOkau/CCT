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

const MAX_GUILD_SIZE = 30
const NON_PLAYER_NAME_PATTERN = /^(damage\s*(req|goal)?|min\s*tickets?|total|average|avg|leader|guild\s*leader|member|officer|#|rank)$/i

function parseDamageCell(value: unknown): number {
  const text = (value ?? '').toString().replace(/,/g, '').replace(' Billion', '').trim()
  if (!text) return 0
  const parsed = parseFloat(text)
  return Number.isFinite(parsed) ? parsed * 1000000000 : 0
}

function normalizePlayerName(value: unknown): string | null {
  if (value == null) return null
  const name = value.toString().replace(/\s+/g, ' ').trim()
  if (!name) return null
  // Skip ranks/numbers that landed in a name column, and summary/role labels
  if (/^\d+(\.\d+)?$/.test(name)) return null
  if (NON_PLAYER_NAME_PATTERN.test(name)) return null
  return name
}

function playerKey(name: string): string {
  return name.toLowerCase()
}

/** Rank columns for RVD / AoD / Living Abyss / Machine God sections. */
const BOSS_RANK_COLUMNS = [0, 7, 14, 21]

function isRankedMemberRow(row: any[]): boolean {
  if (!row || row.length === 0) return false

  // Ignore known summary rows even if they have stray numbers
  const firstCell = row[0]?.toString() ?? ''
  if (
    firstCell.includes('DAMAGE REQ') ||
    firstCell.includes('DAMAGE GOAL') ||
    firstCell.includes('Min Tickets')
  ) {
    return false
  }

  return BOSS_RANK_COLUMNS.some((col) => {
    const rank = parseInt(row[col]?.toString().trim(), 10)
    return Number.isInteger(rank) && rank >= 1 && rank <= MAX_GUILD_SIZE
  })
}

function parseSpreadsheetData(rows: any[][]): any[] {
  const players: any[] = []

  // Skip header rows (first 2 rows contain boss names and column headers)
  const dataRows = rows.slice(2)

  // Only keep true member ranking rows (rank 1..30 in any boss section).
  // This avoids counting summary/leader-note rows as an extra "player".
  const playerRows = dataRows.filter(isRankedMemberRow)

  console.log(`🔍 Processing ${playerRows.length} ranked player rows (max guild size ${MAX_GUILD_SIZE})`)
  console.log('🔍 Sample row structure:', playerRows[0])
  console.log('🔍 First few rows:', playerRows.slice(0, 3))

  // Merge boss-section leaderboards by normalized name (trim + case-insensitive)
  const playerMap: { [key: string]: any } = {}

  playerRows.forEach((row, index) => {
    if (row.length < 20) {
      console.log(`Skipping row ${index + 1}: insufficient columns (${row.length})`)
      return
    }

    // Parse Red Velvet Dragon data (columns A-F: 0-5)
    const redVelvetDamage = parseDamageCell(row[2])
    const redVelvetBattlesRaw = parseInt(row[4]) || 0
    const redVelvetBattles = redVelvetDamage > 0 ? redVelvetBattlesRaw : 0
    const redVelvetAvg = parseInt(row[5]) || 0

    // Parse Avatar of Destiny data (columns H-M: 7-12)
    const avatarDamage = parseDamageCell(row[9])
    const avatarBattlesRaw = parseInt(row[11]) || 0
    const avatarBattles = avatarDamage > 0 ? avatarBattlesRaw : 0
    const avatarAvg = parseInt(row[12]) || 0

    // Parse Living Abyss data (columns O-T: 14-19)
    const livingAbyssDamage = parseDamageCell(row[16])
    const livingAbyssBattlesRaw = parseInt(row[18]) || 0
    const livingAbyssBattles = livingAbyssDamage > 0 ? livingAbyssBattlesRaw : 0
    const livingAbyssAvg = parseInt(row[19]) || 0

    // Parse Machine God data (columns V-AA: 21-26)
    const machineGodDamage = parseDamageCell(row[23])
    const machineGodBattlesRaw = parseInt(row[25]) || 0
    const machineGodBattles = machineGodDamage > 0 ? machineGodBattlesRaw : 0
    const machineGodAvg = parseInt(row[26]) || 0

    const bossSections = [
      { name: normalizePlayerName(row[1]), damage: redVelvetDamage, battles: redVelvetBattles, avg: redVelvetAvg, type: 'redVelvetDragon' },
      { name: normalizePlayerName(row[8]), damage: avatarDamage, battles: avatarBattles, avg: avatarAvg, type: 'avatarOfDestiny' },
      { name: normalizePlayerName(row[15]), damage: livingAbyssDamage, battles: livingAbyssBattles, avg: livingAbyssAvg, type: 'livingAbyss' },
      { name: normalizePlayerName(row[22]), damage: machineGodDamage, battles: machineGodBattles, avg: machineGodAvg, type: 'machineGod' }
    ]

    if (index < 3) {
      console.log(`🔍 Row ${index + 1} boss sections:`, bossSections.map(boss => ({
        type: boss.type,
        name: boss.name,
        damage: boss.damage,
        battles: boss.battles
      })))
    }

    bossSections.forEach(boss => {
      if (!boss.name || boss.damage <= 0) return

      const key = playerKey(boss.name)
      if (!playerMap[key]) {
        playerMap[key] = {
          playerName: boss.name,
          redVelvetDragon: { damage: 0, battles: 0, avgDamagePerTicket: 0 },
          avatarOfDestiny: { damage: 0, battles: 0, avgDamagePerTicket: 0 },
          livingAbyss: { damage: 0, battles: 0, avgDamagePerTicket: 0 },
          machineGod: { damage: 0, battles: 0, avgDamagePerTicket: 0 }
        }
      }

      const player = playerMap[key]
      // Keep a stable display name; prefer the first non-empty casing we saw
      if (!player.playerName) player.playerName = boss.name

      player[boss.type] = {
        damage: boss.damage,
        battles: boss.battles,
        avgDamagePerTicket: boss.avg
      }

      console.log(`Added ${boss.name} to ${boss.type}: ${boss.damage} damage, ${boss.battles} battles`)
    })
  })

  // Convert object to array and assign ranks by total damage
  for (const key in playerMap) {
    players.push(playerMap[key])
  }

  players.sort((a, b) => {
    const totalA = a.redVelvetDragon.damage + a.avatarOfDestiny.damage + a.livingAbyss.damage + (a.machineGod?.damage || 0)
    const totalB = b.redVelvetDragon.damage + b.avatarOfDestiny.damage + b.livingAbyss.damage + (b.machineGod?.damage || 0)
    return totalB - totalA
  })
  players.forEach((player, index) => {
    player.rank = index + 1
  })

  console.log(`🔍 Parsed ${players.length} unique players from spreadsheet`)
  if (players.length > MAX_GUILD_SIZE) {
    console.warn(`⚠️ Player count ${players.length} exceeds guild cap ${MAX_GUILD_SIZE}. Names:`, players.map(p => p.playerName))
  }

  return players
}


