export interface BattlePlayer {
  rank: number
  playerName: string
  playerLevel?: number
  playerTitle?: string
  redVelvetDragon: {
    battles: number
    damage: number
    avgDamagePerTicket?: number
  }
  avatarOfDestiny: {
    battles: number
    damage: number
    avgDamagePerTicket?: number
  }
  livingAbyss: {
    battles: number
    damage: number
    avgDamagePerTicket?: number
  }
  machineGod?: {
    battles: number
    damage: number
    avgDamagePerTicket?: number
  }
  guildRank?: 'Leader' | 'Member' | 'Officer'
}

export interface BattleStats {
  totalPlayers: number
  highestDamage: number
  averageDamage: number
  totalBattlesDone: number
  topPerformers: BattlePlayer[]
  guildScore: number
  ticketStats: {
    totalTicketsUsed: number
    totalTicketsMissed: number
    playersBelowMinimum: number
    averageTicketsUsed: number
    ticketsUsedByBoss: {
      redVelvet: number
      avatar: number
      livingAbyss: number
      machineGod: number
    }
  }
  redVelvetStats: {
    totalDamage: number
    averageDamage: number
    participants: number
  }
  avatarStats: {
    totalDamage: number
    averageDamage: number
    participants: number
  }
  livingAbyssStats: {
    totalDamage: number
    averageDamage: number
    participants: number
  }
  machineGodStats?: {
    totalDamage: number
    averageDamage: number
    participants: number
  }
}

export interface GoogleSheetsData {
  rank: number
  playerName: string
  redVelvetDragon: {
    damage: number
    battles: number
    avgDamagePerTicket: number
  }
  avatarOfDestiny: {
    damage: number
    battles: number
    avgDamagePerTicket: number
  }
  livingAbyss: {
    damage: number
    battles: number
    avgDamagePerTicket: number
  }
  machineGod?: {
    damage: number
    battles: number
    avgDamagePerTicket: number
  }
}

