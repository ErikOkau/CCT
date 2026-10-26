import type { BattlePlayer } from '~/types/battle'
import { BOSS_LABELS, type BossField } from './guildBattleBosses'
import type { BossProgressRow, GuildBossProgress } from './guildBossProgressSheet'
import { sumBossDamageFromPlayers } from './guildBossSheetTotals'
import { getActiveBossFields } from './seasonConfig'

const BOSS_IMAGES: Record<BossField, string> = {
  avatarOfDestiny: '/img/Avatar_of_destiny_guild_battle_ready.webp',
  livingAbyss: '/img/Living_Licorice_Abyss.webp',
  machineGod: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp',
  redVelvetDragon: '/img/Red_Velvet_Dragon.webp'
}

function defaultBossRow(field: BossField, status: BossProgressRow['status']): BossProgressRow {
  return {
    bossKey: field,
    name: BOSS_LABELS[field],
    level: null,
    hpPercent: null,
    totalDamage: null,
    status,
    roundStartLevel: null,
    image: BOSS_IMAGES[field]
  }
}

/**
 * Merge optional **Guild Progress** tab (level, HP %, trophies) with season-tab damage sums.
 * Sheet damage = sum of member boss columns for the loaded flight/season tab.
 */
export function mergeGuildBossProgress(
  tabProgress: GuildBossProgress | null,
  players: BattlePlayer[],
  flight: number,
  season: number
): GuildBossProgress | null {
  const activeFields = getActiveBossFields(flight, season)
  const totals = sumBossDamageFromPlayers(players, activeFields)
  const hasSheetDamage = activeFields.some(f => totals[f] > 0)

  if (!tabProgress && !hasSheetDamage) return null

  const flightOut = tabProgress?.flight ?? flight
  const seasonOut = tabProgress?.season ?? season

  const tabBosses = tabProgress?.bosses ?? []
  const tabByField = new Map(tabBosses.map(b => [b.bossKey, b]))

  const mergedActive: BossProgressRow[] = activeFields.map(field => {
    const fromTab = tabByField.get(field)
    const sheetDmg = totals[field] > 0 ? totals[field] : null
    const tabDmg = fromTab?.totalDamage ?? null
    return {
      ...(fromTab ?? defaultBossRow(field, 'active')),
      bossKey: field,
      name: BOSS_LABELS[field],
      image: BOSS_IMAGES[field],
      status: fromTab?.status === 'inactive' ? 'inactive' : 'active',
      totalDamage: sheetDmg ?? tabDmg,
      sheetDamage: sheetDmg,
      hubDamage: tabDmg && sheetDmg !== tabDmg ? tabDmg : null
    }
  })

  const extras = tabBosses.filter(b => !activeFields.includes(b.bossKey))

  return {
    flight: flightOut,
    season: seasonOut,
    round: tabProgress?.round ?? null,
    guildTrophies: tabProgress?.guildTrophies ?? null,
    guildRank: tabProgress?.guildRank ?? null,
    roundTrophyBaseline: tabProgress?.roundTrophyBaseline ?? null,
    updatedLabel: tabProgress?.updatedLabel ?? null,
    bosses: [...mergedActive, ...extras]
  }
}
