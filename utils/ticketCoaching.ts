import type { BattlePlayer } from '~/types/battle'
import { getBossForSeason, getPlayerTickets } from '~/utils/seasonConfig'

export function buildTicketCoachingInsights(
  players: BattlePlayer[],
  flight: number,
  season: number
): string[] {
  const lines: string[] = []
  if (!players.length) return lines

  const activeBossNames = [1, 2, 3]
    .map(slot => getBossForSeason(flight, season, slot as 1 | 2 | 3)?.name)
    .filter(Boolean) as string[]

  const targetTickets = activeBossNames.length >= 2 ? 18 : 9
  const below15 = players.filter(p => getPlayerTickets(p, flight, season) < 15).length
  const at18 = players.filter(p => getPlayerTickets(p, flight, season) >= 18).length
  const totalUsed = players.reduce((s, p) => s + getPlayerTickets(p, flight, season), 0)
  const missed = players.length * targetTickets - totalUsed

  if (activeBossNames.length) {
    lines.push(
      `🗓️ Active bosses this season: ${activeBossNames.join(' + ')} — aim for ${targetTickets}/${targetTickets} tickets (${activeBossNames.length >= 2 ? '9 per boss' : '9 on the open boss'}).`
    )
  }

  if (missed > 0) {
    lines.push(
      `🎫 Guild left ${missed} ticket${missed === 1 ? '' : 's'} on the table this season (${totalUsed} used of ${players.length * targetTickets} possible).`
    )
  }

  if (below15 > 0) {
    lines.push(`⚠️ ${below15} member${below15 === 1 ? '' : 's'} below 15/${targetTickets} tickets — nudge before the season ends.`)
  }

  if (at18 > 0 && at18 >= Math.floor(players.length * 0.6)) {
    lines.push(`✅ ${at18} members hit 18/18 — great participation.`)
  }

  lines.push(
    '📌 Guild battle cap reminder: up to **540** shared attempts per boss per round across the guild — spread tickets instead of one player dumping all 9 every day.'
  )

  return lines
}
