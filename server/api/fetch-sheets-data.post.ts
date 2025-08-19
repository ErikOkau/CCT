import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { spreadsheetId, range } = body

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is required.')
  }

  try {
    // For now, return hardcoded sample data instead of fetching from Google Sheets
    // This will allow the guild analyzer to work while we fix the Google Sheets integration
    console.log(`📊 Returning sample data for spreadsheet: ${spreadsheetId}, range: ${range}`)

    const players = getSampleBattleData()
    
    console.log(`✅ Successfully returned ${players.length} sample players`)
    if (players.length > 0) {
      console.log('Sample player data:', players[0])
    }

    return {
      message: 'Sample battle data loaded successfully!',
      data: players,
      totalPlayers: players.length
    }
  } catch (error: any) {
    console.error('❌ Data fetch error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Data fetch error: ${error.message}`,
    })
  }
})

function getSampleBattleData(): any[] {
  return [
    {
      rank: 1,
      playerName: "Bestoutuber",
      redVelvetDragon: {
        damage: 2500000000000, // 2.5 Billion
        battles: 5,
        avgDamagePerTicket: 500000000000
      },
      avatarOfDestiny: {
        damage: 1800000000000, // 1.8 Billion
        battles: 5,
        avgDamagePerTicket: 360000000000
      },
      livingAbyss: {
        damage: 2200000000000, // 2.2 Billion
        battles: 5,
        avgDamagePerTicket: 440000000000
      }
    },
    {
      rank: 2,
      playerName: "brownmascara",
      redVelvetDragon: {
        damage: 2200000000000, // 2.2 Billion
        battles: 5,
        avgDamagePerTicket: 440000000000
      },
      avatarOfDestiny: {
        damage: 1600000000000, // 1.6 Billion
        battles: 5,
        avgDamagePerTicket: 320000000000
      },
      livingAbyss: {
        damage: 2000000000000, // 2.0 Billion
        battles: 5,
        avgDamagePerTicket: 400000000000
      }
    },
    {
      rank: 3,
      playerName: "SonicSpeed",
      redVelvetDragon: {
        damage: 2000000000000, // 2.0 Billion
        battles: 5,
        avgDamagePerTicket: 400000000000
      },
      avatarOfDestiny: {
        damage: 1500000000000, // 1.5 Billion
        battles: 5,
        avgDamagePerTicket: 300000000000
      },
      livingAbyss: {
        damage: 1800000000000, // 1.8 Billion
        battles: 5,
        avgDamagePerTicket: 360000000000
      }
    },
    {
      rank: 4,
      playerName: "TailsFlyer",
      redVelvetDragon: {
        damage: 1800000000000, // 1.8 Billion
        battles: 5,
        avgDamagePerTicket: 360000000000
      },
      avatarOfDestiny: {
        damage: 1400000000000, // 1.4 Billion
        battles: 5,
        avgDamagePerTicket: 280000000000
      },
      livingAbyss: {
        damage: 1600000000000, // 1.6 Billion
        battles: 5,
        avgDamagePerTicket: 320000000000
      }
    },
    {
      rank: 5,
      playerName: "KnucklesPunch",
      redVelvetDragon: {
        damage: 1600000000000, // 1.6 Billion
        battles: 5,
        avgDamagePerTicket: 320000000000
      },
      avatarOfDestiny: {
        damage: 1200000000000, // 1.2 Billion
        battles: 5,
        avgDamagePerTicket: 240000000000
      },
      livingAbyss: {
        damage: 1400000000000, // 1.4 Billion
        battles: 5,
        avgDamagePerTicket: 280000000000
      }
    }
  ]
}


