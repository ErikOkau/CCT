import type { GearStatKey, NormalizedBox } from './types'

/** Fallback regions on Gear → Total (1080p-ish); value column right side. */
export const TOTAL_TAB_STAT_REGIONS: Partial<Record<GearStatKey, NormalizedBox>> = {
  cooldown: { x: 0.52, y: 0.38, w: 0.2, h: 0.028 },
  atkSpd: { x: 0.52, y: 0.42, w: 0.2, h: 0.028 },
  crit: { x: 0.52, y: 0.46, w: 0.2, h: 0.028 },
  atk: { x: 0.52, y: 0.5, w: 0.2, h: 0.028 },
  hp: { x: 0.52, y: 0.54, w: 0.2, h: 0.028 },
  waterDmg: { x: 0.52, y: 0.62, w: 0.2, h: 0.028 },
  windDmg: { x: 0.52, y: 0.62, w: 0.2, h: 0.028 }
}

export function fallbackBoxForStat(statKey: GearStatKey): NormalizedBox | null {
  return TOTAL_TAB_STAT_REGIONS[statKey] ?? null
}
