import { prisma } from './prisma'
import type { BattlePlayer, BattleStats } from '~/types/battle'

export interface GuildData {
  name: string
  description?: string
}

export interface SeasonData {
  name: string
  startDate: Date
  endDate?: Date
}

export class DatabaseService {
  /**
   * Create or get a season
   */
  static async getOrCreateSeason(seasonData: SeasonData) {
    return await prisma.season.upsert({
      where: { name: seasonData.name },
      update: {},
      create: {
        name: seasonData.name,
        startDate: seasonData.startDate,
        endDate: seasonData.endDate,
        isActive: true
      }
    })
  }

  /**
   * Create or get a guild
   */
  static async getOrCreateGuild(guildData: GuildData) {
    return await prisma.guild.upsert({
      where: { name: guildData.name },
      update: {},
      create: {
        name: guildData.name,
        description: guildData.description
      }
    })
  }

  /**
   * Store battle analysis data (universal for all users)
   */
  static async storeBattleAnalysis(
    seasonName: string,
    guildName: string,
    players: BattlePlayer[],
    stats: BattleStats
  ) {
    try {
      // Get or create season and guild
      const season = await this.getOrCreateSeason({
        name: seasonName,
        startDate: new Date()
      })

      const guild = await this.getOrCreateGuild({
        name: guildName
      })

      // Store battle analysis
      const analysis = await prisma.battleAnalysis.upsert({
        where: {
          seasonId_guildId: {
            seasonId: season.id,
            guildId: guild.id
          }
        },
        update: {
          totalPlayers: stats.totalPlayers,
          highestDamage: BigInt(stats.highestDamage),
          averageDamage: BigInt(stats.averageDamage),
          totalBattlesDone: stats.totalBattlesDone,
          guildScore: stats.guildScore,
          redVelvetStats: stats.redVelvetStats,
          avatarStats: stats.avatarStats,
          livingAbyssStats: stats.livingAbyssStats,
          insights: stats.insights,
          playerData: players,
          analysisDate: new Date()
        },
        create: {
          seasonId: season.id,
          guildId: guild.id,
          totalPlayers: stats.totalPlayers,
          highestDamage: BigInt(stats.highestDamage),
          averageDamage: BigInt(stats.averageDamage),
          totalBattlesDone: stats.totalBattlesDone,
          guildScore: stats.guildScore,
          redVelvetStats: stats.redVelvetStats,
          avatarStats: stats.avatarStats,
          livingAbyssStats: stats.livingAbyssStats,
          insights: stats.insights,
          playerData: players
        }
      })

      return analysis
    } catch (error) {
      console.error('Error storing battle analysis:', error)
      throw error
    }
  }

  /**
   * Get latest battle analysis for a guild and season
   */
  static async getLatestBattleAnalysis(seasonName: string, guildName: string) {
    try {
      const season = await prisma.season.findUnique({
        where: { name: seasonName }
      })

      const guild = await prisma.guild.findUnique({
        where: { name: guildName }
      })

      if (!season || !guild) {
        return null
      }

      const analysis = await prisma.battleAnalysis.findFirst({
        where: {
          seasonId: season.id,
          guildId: guild.id
        },
        orderBy: {
          analysisDate: 'desc'
        }
      })

      return analysis
    } catch (error) {
      console.error('Error getting battle analysis:', error)
      return null
    }
  }

  /**
   * Clear all battle analysis data (admin only)
   */
  static async clearAllBattleAnalysis() {
    try {
      await prisma.battleAnalysis.deleteMany({})
      return { success: true, message: 'All battle analysis data cleared' }
    } catch (error) {
      console.error('Error clearing battle analysis:', error)
      throw error
    }
  }

  /**
   * Store battle results for a guild in a specific season
   */
  static async storeBattleResults(
    seasonName: string,
    guildName: string,
    players: BattlePlayer[],
    stats: BattleStats
  ) {
    // Get or create season and guild
    const season = await this.getOrCreateSeason({
      name: seasonName,
      startDate: new Date()
    })

    const guild = await this.getOrCreateGuild({
      name: guildName
    })

    // Calculate total damage and battles
    const totalDamage = players.reduce((sum, player) => sum + player.seasonTotal.damage, 0)
    const totalBattles = players.reduce((sum, player) => sum + player.seasonTotal.battles, 0)

    // Store guild result
    const guildResult = await prisma.guildResult.upsert({
      where: {
        seasonId_guildId: {
          seasonId: season.id,
          guildId: guild.id
        }
      },
      update: {
        totalDamage: BigInt(totalDamage),
        totalBattles,
        participantCount: players.length,
        score: stats.guildScore
      },
      create: {
        seasonId: season.id,
        guildId: guild.id,
        totalDamage: BigInt(totalDamage),
        totalBattles,
        participantCount: players.length,
        score: stats.guildScore
      }
    })

    // Store individual player results
    for (const player of players) {
      // Create or update player
      const dbPlayer = await prisma.player.upsert({
        where: {
          name_guildId: {
            name: player.playerName,
            guildId: guild.id
          }
        },
        update: {
          level: player.playerLevel,
          title: player.playerTitle,
          guildRank: this.mapGuildRank(player.guildRank)
        },
        create: {
          name: player.playerName,
          level: player.playerLevel,
          title: player.playerTitle,
          guildRank: this.mapGuildRank(player.guildRank),
          guildId: guild.id
        }
      })

      // Store Red Velvet Dragon results
      if (player.redVelvetDragon.battles > 0) {
        await prisma.battleResult.upsert({
          where: {
            seasonId_playerId_battleType: {
              seasonId: season.id,
              playerId: dbPlayer.id,
              battleType: 'RED_VELVET_DRAGON'
            }
          },
          update: {
            battles: player.redVelvetDragon.battles,
            damage: BigInt(player.redVelvetDragon.damage),
            rank: player.rank
          },
          create: {
            seasonId: season.id,
            playerId: dbPlayer.id,
            battleType: 'RED_VELVET_DRAGON',
            battles: player.redVelvetDragon.battles,
            damage: BigInt(player.redVelvetDragon.damage),
            rank: player.rank
          }
        })
      }

      // Store Avatar of Destiny results
      if (player.avatarOfDestiny.battles > 0) {
        await prisma.battleResult.upsert({
          where: {
            seasonId_playerId_battleType: {
              seasonId: season.id,
              playerId: dbPlayer.id,
              battleType: 'AVATAR_OF_DESTINY'
            }
          },
          update: {
            battles: player.avatarOfDestiny.battles,
            damage: BigInt(player.avatarOfDestiny.damage),
            rank: player.rank
          },
          create: {
            seasonId: season.id,
            playerId: dbPlayer.id,
            battleType: 'AVATAR_OF_DESTINY',
            battles: player.avatarOfDestiny.battles,
            damage: BigInt(player.avatarOfDestiny.damage),
            rank: player.rank
          }
        })
      }
    }

    // Store battle analysis
    await prisma.battleAnalysis.create({
      data: {
        seasonId: season.id,
        guildId: guild.id,
        totalPlayers: stats.totalPlayers,
        highestDamage: BigInt(stats.highestDamage),
        averageDamage: BigInt(stats.averageDamage),
        totalBattlesDone: stats.totalBattlesDone,
        guildScore: stats.guildScore,
        redVelvetStats: stats.redVelvetStats,
        avatarStats: stats.avatarStats,
        insights: stats.topPerformers.map((p: BattlePlayer) => `${p.playerName}: ${p.seasonTotal.damage.toLocaleString()} damage`)
      }
    })

    return {
      season,
      guild,
      guildResult,
      playersStored: players.length
    }
  }

  /**
   * Get guild results for a specific season
   */
  static async getGuildResults(seasonName: string, guildName: string) {
    const season = await prisma.season.findUnique({
      where: { name: seasonName }
    })

    if (!season) {
      throw new Error(`Season ${seasonName} not found`)
    }

    const guild = await prisma.guild.findUnique({
      where: { name: guildName }
    })

    if (!guild) {
      throw new Error(`Guild ${guildName} not found`)
    }

    const guildResult = await prisma.guildResult.findUnique({
      where: {
        seasonId_guildId: {
          seasonId: season.id,
          guildId: guild.id
        }
      }
    })

    const players = await prisma.player.findMany({
      where: { guildId: guild.id },
      include: {
        battleResults: {
          where: { seasonId: season.id }
        }
      }
    })

    const battleAnalysis = await prisma.battleAnalysis.findFirst({
      where: {
        seasonId: season.id,
        guildId: guild.id
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      season,
      guild,
      guildResult,
      players,
      battleAnalysis
    }
  }

  /**
   * Get all seasons
   */
  static async getSeasons() {
    return await prisma.season.findMany({
      orderBy: { startDate: 'desc' }
    })
  }

  /**
   * Get all guilds
   */
  static async getGuilds() {
    return await prisma.guild.findMany({
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Map guild rank string to enum
   */
  private static mapGuildRank(rank: string) {
    switch (rank.toLowerCase()) {
      case 'leader':
        return 'LEADER'
      case 'officer':
        return 'OFFICER'
      case 'admin':
        return 'ADMIN'
      default:
        return 'MEMBER'
    }
  }
}
