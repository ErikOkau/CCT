import type { GearCheckMode } from './buildTargets'

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
}

export type GearDisplayRow = { label: string; value: string }

export type CookieBuildTarget = {
  id: string
  names: string[]
  short: string
  portrait?: string
  requirements: StatRequirement[]
  notes?: string[]
  /** Shared with boss guide cards (single source of truth). */
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
