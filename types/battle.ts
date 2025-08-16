export interface BattlePlayer {
  rank: number
  playerName: string
  playerLevel: number
  playerTitle: string
  redVelvetDragon: {
    battles: number
    damage: number
  }
  avatarOfDestiny: {
    battles: number
    damage: number
  }
  seasonTotal: {
    battles: number
    damage: number
  }
  guildRank: 'Leader' | 'Member' | 'Officer'
}

export interface BattleStats {
  totalPlayers: number
  highestDamage: number
  averageDamage: number
  totalBattlesDone: number
  topPerformers: BattlePlayer[]
  guildScore: number
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
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface DatabaseFormData {
  seasonName: string
  guildName: string
  isSavingToDatabase: boolean
  saveSuccess: boolean
  saveError: string
}

export interface UploadState {
  isDragging: boolean
  uploadedFiles: File[]
  isAnalyzing: boolean
  analysisComplete: boolean
  filesSelected: boolean
  battleData: BattlePlayer[]
  battleStats: BattleStats | null
  insights: string[]
  previewData: BattlePlayer[]
}
