import type { BattlePlayer, BossField } from '~/types/types'
import { getPlayerBossStat } from './seasonConfig'

/** Sum per-boss damage from the current season spreadsheet tab (all members). */
export function sumBossDamageFromPlayers(
  players: BattlePlayer[],
  activeFields: BossField[]
): Record<BossField, number> {
  const totals: Record<BossField, number> = {
    redVelvetDragon: 0,
    avatarOfDestiny: 0,
    livingAbyss: 0,
    machineGod: 0
  }

  for (const player of players) {
    for (const field of activeFields) {
      totals[field] += getPlayerBossStat(player, field, 'damage')
    }
  }

  return totals
}
