import type { BattlePlayer } from '~/types/battle'
import type { BossField } from './guildBattleBosses'
import { sumBossDamageFromPlayers } from './guildBossSheetTotals'
import { getSeasonDisplayName, getSeasonTableBossColumns } from './seasonConfig'

export type BossDamageBar = {
  bossKey: BossField
  name: string
  image: string
  totalDamage: number
  /** Relative bar width (0–100) vs the highest boss total this season. */
  barPercent: number
}

export type SeasonBossDamageVisual = {
  flight: number
  season: number
  seasonLabel: string
  bosses: BossDamageBar[]
}

export function formatGuildBossDamage(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return n.toLocaleString('en-US')
}

/** Guild totals per active boss from the season sheet tab already loaded in the analyzer. */
export function buildSeasonBossDamageVisual(
  players: BattlePlayer[],
  flight: number,
  season: number
): SeasonBossDamageVisual | null {
  if (!players.length) return null

  const columns = getSeasonTableBossColumns(flight, season)
  if (!columns.length) return null

  const fields = columns.map(c => c.field)
  const totals = sumBossDamageFromPlayers(players, fields)
  const max = Math.max(...fields.map(f => totals[f]), 0)
  if (max <= 0) return null

  const bosses: BossDamageBar[] = columns.map(col => {
    const totalDamage = totals[col.field]
    return {
      bossKey: col.field,
      name: col.name,
      image: col.image,
      totalDamage,
      barPercent: max > 0 ? Math.round((totalDamage / max) * 100) : 0
    }
  })

  return {
    flight,
    season,
    seasonLabel: getSeasonDisplayName(flight, season),
    bosses
  }
}
