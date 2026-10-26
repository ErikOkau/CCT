import type { GearStatKey, ScannedStat, StatUnit } from './types'

const LABEL_TO_KEY: { re: RegExp; key: GearStatKey; unit: StatUnit }[] = [
  { re: /^cooldown/i, key: 'cooldown', unit: 'percent' },
  { re: /^cd$/i, key: 'cooldown', unit: 'percent' },
  { re: /atk\s*spd|attack\s*speed/i, key: 'atkSpd', unit: 'percent' },
  { re: /^crit/i, key: 'crit', unit: 'percent' },
  { re: /^atk$/i, key: 'atk', unit: 'percent' },
  { re: /^hp$/i, key: 'hp', unit: 'flat' },
  { re: /^def/i, key: 'def', unit: 'percent' },
  { re: /amp\s*buff|amplification/i, key: 'ampBuff', unit: 'percent' },
  { re: /debuff\s*res/i, key: 'debuffResist', unit: 'percent' },
  { re: /accuracy/i, key: 'accuracy', unit: 'percent' },
  { re: /water\s*(elemental\s*)?dmg|water\s*dmg/i, key: 'waterDmg', unit: 'percent' },
  { re: /wind\s*(elemental\s*)?dmg|wind\s*dmg/i, key: 'windDmg', unit: 'percent' },
  { re: /elec(tri(city)?)?\s*(elemental\s*)?dmg/i, key: 'elecDmg', unit: 'percent' },
  { re: /elemental\s*dmg/i, key: 'elementalDmg', unit: 'percent' }
]

export function statKeyFromLabel(label: string): GearStatKey | null {
  const text = label.trim()
  for (const row of LABEL_TO_KEY) {
    if (row.re.test(text)) return row.key
  }
  return null
}

export function unitForStatKey(key: GearStatKey): StatUnit {
  if (key === 'hp') return 'flat'
  return 'percent'
}

export function parseStatNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '' || raw === '-') return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  const text = String(raw).replace(/,/g, '').replace(/%/g, '').trim()
  const n = parseFloat(text)
  return Number.isFinite(n) ? n : null
}

export function formatStatValue(value: number | null, unit: StatUnit): string {
  if (value === null) return '—'
  if (unit === 'flat') return Math.round(value).toLocaleString('en-US')
  return `${value.toFixed(1).replace(/\.0$/, '')}%`
}

export function normalizeVisionStat(raw: {
  key?: string
  label?: string
  value?: unknown
  unit?: string
  box?: { x?: number; y?: number; w?: number; h?: number } | null
}): ScannedStat | null {
  const label = (raw.label ?? raw.key ?? '').toString().trim()
  if (!label) return null
  const statKey = statKeyFromLabel(label) ?? statKeyFromLabel(String(raw.key ?? ''))
  if (!statKey) return null
  const unit = raw.unit === 'flat' ? 'flat' : unitForStatKey(statKey)
  const value = parseStatNumber(raw.value)
  let box: ScannedStat['box'] = null
  if (raw.box && typeof raw.box.x === 'number') {
    box = {
      x: clamp01(raw.box.x),
      y: clamp01(raw.box.y ?? 0),
      w: clamp01(raw.box.w ?? 0.1),
      h: clamp01(raw.box.h ?? 0.03)
    }
  }
  return { statKey, label, value, unit, box }
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}
