import type { BattlePlayer } from '~/types/battle'
import type { BossField } from './guildBattleBosses'
import { sumBossDamageFromPlayers } from './guildBossSheetTotals'
import {
  bossNameToField,
  getBossForSeason,
  getHubSlotDisplayBoss,
  getSeasonDisplayName,
  hasSeasonBossSchedule,
  SHEET_PHYSICAL_BOSS_ORDER
} from './seasonConfig'

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

export function formatGuildBossDamage(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return n.toLocaleString('en-US')
}

/**
 * Three schedule slots (like the in-game hub): active bosses show sheet totals;
 * empty rotation slot shows "Not available".
 */
export function buildSeasonBossDamageVisual(
  players: BattlePlayer[],
  flight: number,
  season: number
): SeasonBossDamageVisual | null {
  if (!players.length) return null

  const totals = sumBossDamageFromPlayers(
    players,
    SHEET_PHYSICAL_BOSS_ORDER
  )

  const slots: BossDamageBar[] = []
  const activeDamages: number[] = []

  for (const position of [1, 2, 3] as const) {
    const slotBoss = getBossForSeason(flight, season, position)
    const displayBoss = slotBoss ?? getHubSlotDisplayBoss(flight, position)

    if (!slotBoss) {
      slots.push({
        slot: position,
        status: 'unavailable',
        bossKey: null,
        name: displayBoss.name,
        image: displayBoss.image,
        totalDamage: null,
        barPercent: 0
      })
      continue
    }

    const field = bossNameToField(slotBoss.name)
    const totalDamage = field ? totals[field] : 0
    activeDamages.push(totalDamage)

    slots.push({
      slot: position,
      status: 'active',
      bossKey: field,
      name: slotBoss.name,
      image: slotBoss.image,
      totalDamage,
      barPercent: 0
    })
  }

  if (!hasSeasonBossSchedule(flight, season) && slots.every(s => s.status === 'unavailable')) {
    return null
  }

  const max = Math.max(...activeDamages, 0)
  for (const row of slots) {
    if (row.status === 'active' && max > 0) {
      row.barPercent = Math.max(4, Math.round(((row.totalDamage ?? 0) / max) * 100))
    } else if (row.status === 'active') {
      row.barPercent = 4
    }
  }

  return {
    flight,
    season,
    seasonLabel: getSeasonDisplayName(flight, season),
    bosses: slots
  }
}
