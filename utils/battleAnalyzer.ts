import type { BattlePlayer, BattleStats, GoogleSheetsData } from '~/types/battle'

export class BattleAnalyzer {
  // OCR Configuration
  private static readonly OCR_CONFIG = {
    minPlayersForSuccess: 2,
    maxPlayers: 50,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
  }

  /**
   * Fetch data from Google Sheets and convert to BattlePlayer format
   */
  static async fetchFromGoogleSheets(spreadsheetId: string, range?: string): Promise<BattlePlayer[]> {
    console.log(`📊 Fetching data from Google Sheets: ${spreadsheetId}`)

    try {
      const response = await fetch('/api/fetch-sheets-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId,
          range: range || 'A1:Z100'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheets data: ${response.status}`)
      }

      const result = await response.json()
      const sheetsData: GoogleSheetsData[] = result.data

      // Convert Google Sheets data to BattlePlayer format
      const battlePlayers = this.convertSheetsDataToBattlePlayers(sheetsData)

      // Sort by total damage across all bosses (highest first)
      battlePlayers.sort((a, b) => {
        const totalDamageA = a.redVelvetDragon.damage + a.avatarOfDestiny.damage + a.livingAbyss.damage
        const totalDamageB = b.redVelvetDragon.damage + b.avatarOfDestiny.damage + b.livingAbyss.damage
        return totalDamageB - totalDamageA
      })

      // Update ranks
      battlePlayers.forEach((player, index) => {
        player.rank = index + 1
      })

      console.log(`✅ Successfully converted ${battlePlayers.length} players from Google Sheets`)
      return battlePlayers

    } catch (error) {
      console.error('❌ Error fetching from Google Sheets:', error)
      throw error
    }
  }

  /**
   * Convert Google Sheets data to BattlePlayer format
   */
  private static convertSheetsDataToBattlePlayers(sheetsData: GoogleSheetsData[]): BattlePlayer[] {
    return sheetsData.map(sheetPlayer => ({
      rank: sheetPlayer.rank,
      playerName: sheetPlayer.playerName,
      playerLevel: undefined, // Not available in sheets data
      playerTitle: undefined, // Not available in sheets data
      redVelvetDragon: {
        battles: sheetPlayer.redVelvetDragon.battles,
        damage: sheetPlayer.redVelvetDragon.damage, // Already in actual damage format
        avgDamagePerTicket: sheetPlayer.redVelvetDragon.avgDamagePerTicket
      },
      avatarOfDestiny: {
        battles: sheetPlayer.avatarOfDestiny.battles,
        damage: sheetPlayer.avatarOfDestiny.damage, // Already in actual damage format
        avgDamagePerTicket: sheetPlayer.avatarOfDestiny.avgDamagePerTicket
      },
      livingAbyss: {
        battles: sheetPlayer.livingAbyss.battles,
        damage: sheetPlayer.livingAbyss.damage, // Already in actual damage format
        avgDamagePerTicket: sheetPlayer.livingAbyss.avgDamagePerTicket
      },
      guildRank: 'Member' // Default value
    }))
  }



  /**
   * Calculate battle statistics from player data
   */
  static calculateStats(players: BattlePlayer[]): BattleStats {
    const totalPlayers = players.length
    const highestDamage = Math.max(...players.map(p => p.redVelvetDragon.damage + p.avatarOfDestiny.damage + p.livingAbyss.damage))
    const averageDamage = Math.round(players.reduce((sum, p) => sum + p.redVelvetDragon.damage + p.avatarOfDestiny.damage + p.livingAbyss.damage, 0) / totalPlayers)
    const totalBattlesDone = players.reduce((sum, p) => sum + p.redVelvetDragon.battles + p.avatarOfDestiny.battles + p.livingAbyss.battles, 0)
    const topPerformers = players.slice(0, 5)
    const guildScore = players.reduce((sum, p) => sum + p.redVelvetDragon.damage + p.avatarOfDestiny.damage + p.livingAbyss.damage, 0)

    // Ticket calculations - Season 20-1 only has Red Velvet Dragon and Living Abyss
    const MAX_TICKETS_PER_SEASON = 18 // 9 tickets per boss, 2 bosses active
    const MIN_REQUIRED_TICKETS = 15
    
    // Only count tickets for bosses that are actually in Season 20-1
    const totalTicketsUsed = players.reduce((sum, p) => {
      return sum + p.redVelvetDragon.battles + p.livingAbyss.battles // Avatar of Destiny not in Season 20-1
    }, 0)
    
    const totalTicketsMissed = (totalPlayers * MAX_TICKETS_PER_SEASON) - totalTicketsUsed
    const playersBelowMinimum = players.filter(p => {
      const playerTickets = p.redVelvetDragon.battles + p.livingAbyss.battles // Avatar of Destiny not in Season 20-1
      return playerTickets < MIN_REQUIRED_TICKETS
    }).length
    
    const averageTicketsUsed = totalPlayers > 0 ? Math.round(totalTicketsUsed / totalPlayers) : 0
    
    const ticketsUsedByBoss = {
      redVelvet: players.reduce((sum, p) => sum + p.redVelvetDragon.battles, 0),
      avatar: 0, // Avatar of Destiny not in Season 20-1
      livingAbyss: players.reduce((sum, p) => sum + p.livingAbyss.battles, 0)
    }

    // Red Velvet Dragon stats
    const redVelvetPlayers = players.filter(p => p.redVelvetDragon.damage > 0)
    const redVelvetStats = {
      totalDamage: redVelvetPlayers.reduce((sum, p) => sum + p.redVelvetDragon.damage, 0),
      averageDamage: redVelvetPlayers.length > 0 ? Math.round(redVelvetPlayers.reduce((sum, p) => sum + p.redVelvetDragon.damage, 0) / redVelvetPlayers.length) : 0,
      participants: redVelvetPlayers.length
    }

    // Avatar of Destiny stats
    const avatarPlayers = players.filter(p => p.avatarOfDestiny.damage > 0)
    const avatarStats = {
      totalDamage: avatarPlayers.reduce((sum, p) => sum + p.avatarOfDestiny.damage, 0),
      averageDamage: avatarPlayers.length > 0 ? Math.round(avatarPlayers.reduce((sum, p) => sum + p.avatarOfDestiny.damage, 0) / avatarPlayers.length) : 0,
      participants: avatarPlayers.length
    }

    // Living Abyss stats
    const livingAbyssPlayers = players.filter(p => p.livingAbyss.damage > 0)
    const livingAbyssStats = {
      totalDamage: livingAbyssPlayers.reduce((sum, p) => sum + p.livingAbyss.damage, 0),
      averageDamage: livingAbyssPlayers.length > 0 ? Math.round(livingAbyssPlayers.reduce((sum, p) => sum + p.livingAbyss.damage, 0) / livingAbyssPlayers.length) : 0,
      participants: livingAbyssPlayers.length
    }

    return {
      totalPlayers,
      highestDamage,
      averageDamage,
      totalBattlesDone,
      topPerformers,
      guildScore,
      ticketStats: {
        totalTicketsUsed,
        totalTicketsMissed,
        playersBelowMinimum,
        averageTicketsUsed,
        ticketsUsedByBoss
      },
      redVelvetStats,
      avatarStats,
      livingAbyssStats
    }
  }

  /**
   * Generate insights from battle data
   */
  static generateInsights(players: BattlePlayer[]): string[] {
    const insights: string[] = []

    if (players.length === 0) return insights

    // Top performer insights
    const topPlayer = players[0]
    const topPlayerTotalDamage = topPlayer.redVelvetDragon.damage + topPlayer.avatarOfDestiny.damage + topPlayer.livingAbyss.damage
    insights.push(`🏆 ${topPlayer.playerName} achieved the highest total damage with ${this.formatDamage(topPlayerTotalDamage)}`)

    // Battle participation insights
    const activePlayers = players.filter(p => p.redVelvetDragon.battles > 0 || p.avatarOfDestiny.battles > 0 || p.livingAbyss.battles > 0).length
    insights.push(`⚔️ ${activePlayers} out of ${players.length} players participated in battles this season`)

    // Ticket usage insights - Season 20-1 only has Red Velvet Dragon and Living Abyss
    const MAX_TICKETS_PER_SEASON = 18
    const MIN_REQUIRED_TICKETS = 15
    const totalTicketsUsed = players.reduce((sum, p) => sum + p.redVelvetDragon.battles + p.livingAbyss.battles, 0) // Avatar of Destiny not in Season 20-1
    const totalTicketsMissed = (players.length * MAX_TICKETS_PER_SEASON) - totalTicketsUsed
    const playersBelowMinimum = players.filter(p => {
      const playerTickets = p.redVelvetDragon.battles + p.livingAbyss.battles // Avatar of Destiny not in Season 20-1
      return playerTickets < MIN_REQUIRED_TICKETS
    }).length

    insights.push(`🎫 Total tickets used: ${totalTicketsUsed}/${players.length * MAX_TICKETS_PER_SEASON} (${totalTicketsMissed} missed)`)
    
    if (playersBelowMinimum > 0) {
      insights.push(`⚠️ ${playersBelowMinimum} players used fewer than ${MIN_REQUIRED_TICKETS} tickets (minimum requirement)`)
    } else {
      insights.push(`✅ All players met the minimum ${MIN_REQUIRED_TICKETS} ticket requirement`)
    }

    // Average level insights (if available)
    const playersWithLevel = players.filter(p => p.playerLevel !== undefined)
    if (playersWithLevel.length > 0) {
      const avgLevel = Math.round(playersWithLevel.reduce((sum, p) => sum + (p.playerLevel || 0), 0) / playersWithLevel.length)
      insights.push(`📊 Average player level: ${avgLevel}`)
    }

    // Guild rank distribution (if available)
    const playersWithRank = players.filter(p => p.guildRank !== undefined)
    if (playersWithRank.length > 0) {
      const leaders = playersWithRank.filter(p => p.guildRank === 'Leader').length
      const officers = playersWithRank.filter(p => p.guildRank === 'Officer').length
      const members = playersWithRank.filter(p => p.guildRank === 'Member').length
      insights.push(`👥 Guild structure: ${leaders} Leader, ${officers} Officers, ${members} Members`)
    }

    // Performance thresholds
    const highPerformers = players.filter(p => {
      const totalDamage = p.redVelvetDragon.damage + p.avatarOfDestiny.damage + p.livingAbyss.damage
      return totalDamage >= 10000000000 // 10B+
    }).length
    if (highPerformers > 0) {
      insights.push(`🌟 ${highPerformers} players achieved 10B+ total damage`)
    }

    return insights
  }

  /**
   * Format damage numbers for display
   */
  static formatDamage(damage: number): string {
    if (damage >= 1000000000000) {
      return `${(damage / 1000000000000).toFixed(1)}T`
    } else if (damage >= 1000000000) {
      return `${(damage / 1000000000).toFixed(1)}B`
    } else if (damage >= 1000000) {
      return `${(damage / 1000000).toFixed(1)}M`
    } else if (damage >= 1000) {
      return `${(damage / 1000).toFixed(1)}K`
    }
    return damage.toString()
  }

  /**
   * Get CSS class for rank badge
   */
  static getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'rank-gold'
    if (rank === 2) return 'rank-silver'
    if (rank === 3) return 'rank-bronze'
    return 'rank-normal'
  }



  /**
   * Get CSS class for guild rank badge
   */
  static getGuildRankBadgeClass(rank: string): string {
    switch (rank) {
      case 'Leader': return 'guild-leader'
      case 'Officer': return 'guild-officer'
      case 'Member': return 'guild-member'
      default: return 'guild-member'
    }
  }

  /**
   * Check if player meets boss requirements
   */
  static checkBossRequirements(player: BattlePlayer): {
    redVelvet: boolean
    avatar: boolean
    livingAbyss: boolean
  } {
    return {
      redVelvet: player.redVelvetDragon.damage >= 6000000000, // 6B
      avatar: player.avatarOfDestiny.damage >= 3500000000, // 3.5B
      livingAbyss: player.livingAbyss.damage >= 12000000000 // 12B
    }
  }

  /**
   * Calculate efficiency score (damage per battle)
   */
  static getEfficiencyScore(player: BattlePlayer): number {
    const totalBattles = player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles
    if (totalBattles === 0) return 0
    
    const totalDamage = player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage
    const avgDamagePerBattle = totalDamage / totalBattles
    return Math.round(avgDamagePerBattle / 1000000000) // Return in billions
  }
}
