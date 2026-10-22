export type BossField = 'redVelvetDragon' | 'avatarOfDestiny' | 'livingAbyss' | 'machineGod'

export const BOSS_LABELS: Record<BossField, string> = {
  redVelvetDragon: 'Red Velvet Dragon',
  avatarOfDestiny: 'Avatar of Destiny',
  livingAbyss: 'Living Abyss',
  machineGod: 'Machine-God of the Eternal Void'
}

/** In-game Participants header order from DF 34+ (only active bosses shown; MG before AoD when both up). */
export const AOD_ERA_UI_COLUMN_ORDER: BossField[] = [
  'machineGod',
  'avatarOfDestiny',
  'livingAbyss'
]

/** Pre-DF 34 pool: RVD / MG / LA — typical left-to-right when Living Abyss is second column after RVD. */
export const RVD_ERA_UI_COLUMN_ORDER: BossField[] = [
  'redVelvetDragon',
  'livingAbyss',
  'machineGod'
]

const HEADER_PATTERNS: { field: BossField; re: RegExp }[] = [
  { field: 'machineGod', re: /machine[\s-]*god|m\s*god|eternal\s*void/i },
  { field: 'avatarOfDestiny', re: /avatar\s*of\s*destiny|\baod\b/i },
  { field: 'livingAbyss', re: /living\s*abyss|\bla\b/i },
  { field: 'redVelvetDragon', re: /red\s*velvet|\brvd\b/i }
]

export function matchBossFieldFromHeader(text: string): BossField | null {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return null
  for (const { field, re } of HEADER_PATTERNS) {
    if (re.test(normalized)) return field
  }
  return null
}

export function uiColumnOrderForFlight(flight: number): BossField[] {
  return flight >= 34 ? AOD_ERA_UI_COLUMN_ORDER : RVD_ERA_UI_COLUMN_ORDER
}

/** Active bosses in the order they appear left-to-right in the Participants UI. */
export function getActiveBossUiColumnOrder(
  activeFields: BossField[],
  flight: number
): BossField[] {
  const active = new Set(activeFields)
  return uiColumnOrderForFlight(flight).filter(f => active.has(f))
}
