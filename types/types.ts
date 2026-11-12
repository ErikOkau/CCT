/** Shared TypeScript types for the CCT app (single source of truth). */

// —— Guild battle / analyzer ——

export type BossField = 'redVelvetDragon' | 'avatarOfDestiny' | 'livingAbyss' | 'machineGod'

export type GuildRankRole = 'Leader' | 'Member' | 'Officer'

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
  guildRank?: GuildRankRole
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

// —— Homepage 3D boss hero ——

export type BossSlotStatus = 'active' | 'unavailable'

export type BossDamageBar = {
  slot: 1 | 2 | 3
  status: BossSlotStatus
  bossKey: BossField | null
  name: string
  image: string | null
  totalDamage: number | null
  /** Relative bar width among active bosses this season (0 if unavailable). */
  barPercent: number
}

export type SeasonBossDamageVisual = {
  flight: number
  season: number
  seasonLabel: string
  bosses: BossDamageBar[]
}

export type BossTextureSlot = 1 | 2 | 3

export type BossTextureEntry = {
  slot: BossTextureSlot
  url: string | null
  active: boolean
}

export type GuildBossSceneBundle = {
  dispose: () => void
  setBossTextures: (entries: BossTextureEntry[]) => void
  resize: () => void
}

// —— Guild boss guides ——

export type GuideSlug = 'mgev' | 'tla' | 'aod' | 'rvd'

export type GearCheckMode = GuideSlug

export type GuildGuide = {
  slug: GuideSlug
  code: string
  name: string
  short: string
  image: string
  theme: GuideSlug
  blurb: string
  parked?: boolean
}

export type FerretOption = {
  cast: string
  cd: string
}

export type MintBreakpoint = {
  mintCd: string
  ferret: FerretOption[]
}

// —— Mode guides (Cookie Alliance, Kingdom Arena) ——

export type ModeGuideSlug = 'cookie-alliance' | 'kingdom-arena'

export type ModeGuide = {
  slug: ModeGuideSlug
  code: string
  name: string
  short: string
  theme: ModeGuideSlug
  blurb: string
  image: string
  parked?: boolean
}

export type AllianceCookieBuild = {
  id: string
  name: string
  short: string
  portrait?: string
  role: string
  toppings: string
  tart: string
  beascuit: string
  stats: string
  notes?: string[]
}

export type ArenaCookieBuild = {
  id: string
  name: string
  short: string
  portrait?: string
  toppings: string
  tart: string
  beascuit: string
  stats: string
  notes?: string[]
}

export type ArenaCounterSubgroup = {
  /** e.g. "1s" — enemy skill start timing you are countering */
  title: string
  blurb?: string
  matchups: string[]
}

export type ArenaCounterSection = {
  title: string
  intro?: string
  subgroups?: ArenaCounterSubgroup[]
  matchups?: string[]
}

// —— Gear Check (vision OCR) ——

export type GearStatKey =
  | 'fireDmg'
  | 'dmgResist'
  | 'dmgResistBypass'
  | 'cooldown'
  | 'atkSpd'
  | 'crit'
  | 'atk'
  | 'hp'
  | 'def'
  | 'ampBuff'
  | 'debuffResist'
  | 'accuracy'
  | 'waterDmg'
  | 'windDmg'
  | 'elecDmg'
  | 'elementalDmg'

export type StatUnit = 'percent' | 'flat'

export type StatRequirement = {
  statKey: GearStatKey
  label: string
  min?: number
  max?: number
  unit: StatUnit
  hint?: string
  /** Minimum only — higher values still count as met (e.g. ATK SPD floors). */
  floorOnly?: boolean
}

export type GearDisplayRow = { label: string; value: string }

export type CookieBuildTarget = {
  id: string
  names: string[]
  short: string
  portrait?: string
  requirements: StatRequirement[]
  notes?: string[]
  gearRows?: GearDisplayRow[]
}

export type NormalizedBox = {
  x: number
  y: number
  w: number
  h: number
}

export type ScannedStat = {
  statKey: GearStatKey
  label: string
  value: number | null
  unit: StatUnit
  box?: NormalizedBox | null
}

export type GearVisionResult = {
  cookieName: string
  gameMode?: string | null
  statsTab?: string | null
  tartEffect?: string | null
  tartValue?: number | null
  elementalType?: string | null
  elementalValue?: number | null
  stats: ScannedStat[]
  warnings: string[]
}

export type CompareStatus = 'met' | 'close' | 'low' | 'high' | 'missing' | 'info'

export type ComparisonRow = {
  statKey: GearStatKey
  label: string
  scanned: number | null
  scannedLabel: string
  targetLabel: string
  status: CompareStatus
  gap: number | null
  box?: NormalizedBox | null
  hint?: string
}

export type GearCheckResult = {
  bossSlug: GearCheckMode
  matchedBuildId: string | null
  matchedShort: string | null
  cookieName: string
  vision: GearVisionResult
  comparisons: ComparisonRow[]
}

// —— Discord OCR bot ——

export type OcrProvider = 'openai' | 'tesseract'
