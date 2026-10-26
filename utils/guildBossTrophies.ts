/**
 * Trophy math for guild bosses is participation- and level-scaled in-game.
 * There is no official public per-level table — these are **rough** community-style estimates for UI only.
 */

import type { BossField } from './guildBattleBosses'

const BASE_TROPHY_PER_LEVEL: Record<BossField, number> = {
  avatarOfDestiny: 95_000,
  livingAbyss: 110_000,
  machineGod: 105_000,
  redVelvetDragon: 90_000
}

export function estimateTrophiesForLevelGain(bossKey: BossField, levelsGained: number): number {
  if (levelsGained <= 0 || !Number.isFinite(levelsGained)) return 0
  const base = BASE_TROPHY_PER_LEVEL[bossKey] ?? 100_000
  // Slight scaling so high-level pushes feel heavier in the UI (not datamined).
  return Math.round(levelsGained * base * (1 + Math.min(levelsGained, 40) * 0.01))
}

export function estimateRoundTrophyGain(
  bosses: { bossKey: BossField; level: number | null; roundStartLevel: number | null }[]
): number {
  return bosses.reduce((sum, row) => {
    if (row.level == null || row.roundStartLevel == null) return sum
    const gained = Math.max(0, row.level - row.roundStartLevel)
    return sum + estimateTrophiesForLevelGain(row.bossKey, gained)
  }, 0)
}

export function formatGuildBossDamage(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return n.toLocaleString('en-US')
}

export const GUILD_TROPHY_ESTIMATE_DISCLAIMER =
  'Estimated trophy gain uses an approximate per-level model — check the in-game Guild Battle screen for exact totals.'
