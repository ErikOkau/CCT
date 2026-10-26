import type { BossField } from './guildBattleBosses'

/**
 * Guild bosses reset each round; level rises as cumulative guild damage clears HP bars.
 * Devsisters does not publish a full per-level HP table for current bosses (AoD / LA / MG at 200+).
 * Old community tools (e.g. 2021 Red Velvet HP arrays) stop around Lv.66 and do not match modern scaling.
 */
export const GUILD_BOSS_LEVEL_FROM_DAMAGE_NOTE =
  'Boss level and HP % cannot be derived accurately from sheet damage alone — officers should paste level / HP / round totals from the in-game Guild Battle hub (Guild Progress tab).'

/** Reserved for future datamined curves; always null today. */
export function estimateBossLevelFromRoundDamage(
  _boss: BossField,
  _cumulativeDamage: number,
  _roundStartLevel = 1
): number | null {
  return null
}

export function cumulativeDamageToClearLevels(
  _boss: BossField,
  _fromLevel: number,
  _toLevel: number
): number | null {
  return null
}
