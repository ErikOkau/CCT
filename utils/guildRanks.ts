export type GuildRankRole = 'Leader' | 'Member' | 'Officer'

export const GUILD_LEADER_NAME = 'Poppy'
export const GUILD_OFFICER_NAME = 'Lisa'

/** In-game display names vary slightly; match normalized keys from the sheet. */
const LEADER_KEYS = new Set(['poppy'])
const OFFICER_KEYS = new Set(['lisa'])

export function getPlayerGuildRank(playerName: string): GuildRankRole {
  const key = playerName.normalize('NFKC').trim().toLowerCase()
  if (LEADER_KEYS.has(key)) return 'Leader'
  if (OFFICER_KEYS.has(key)) return 'Officer'
  return 'Member'
}
