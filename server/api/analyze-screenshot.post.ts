import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { imageData } = body

  if (!imageData) {
    throw new Error('No image data provided.')
  }

  try {
    // For now, return hardcoded data instead of using Google Cloud Vision API
    const hardcodedPlayers = [
      {
        rank: 1,
        playerName: 'ZephyrCat',
        playerLevel: 85,
        playerTitle: 'Legendary Warrior',
        redVelvetDragon: {
          battles: 15,
          damage: 8500000000
        },
        avatarOfDestiny: {
          battles: 12,
          damage: 4200000000
        },
        seasonTotal: {
          battles: 27,
          damage: 12700000000
        },
        guildRank: 'Leader'
      },
      {
        rank: 2,
        playerName: 'Pallysades',
        playerLevel: 82,
        playerTitle: 'Master Guardian',
        redVelvetDragon: {
          battles: 14,
          damage: 7800000000
        },
        avatarOfDestiny: {
          battles: 15,
          damage: 3800000000
        },
        seasonTotal: {
          battles: 29,
          damage: 11600000000
        },
        guildRank: 'Officer'
      },
      {
        rank: 3,
        playerName: 'Slothy24',
        playerLevel: 79,
        playerTitle: 'Elite Fighter',
        redVelvetDragon: {
          battles: 13,
          damage: 7200000000
        },
        avatarOfDestiny: {
          battles: 11,
          damage: 3500000000
        },
        seasonTotal: {
          battles: 24,
          damage: 10700000000
        },
        guildRank: 'Member'
      }
    ]

    return {
      message: 'Screenshot analyzed successfully!',
      players: hardcodedPlayers,
      rawText: 'Hardcoded data returned'
    }
  } catch (error: any) {
    console.error('❌ Screenshot analysis error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Screenshot analysis error: ${error.message}`,
    })
  }
})
