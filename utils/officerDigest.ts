import type { BattlePlayer, BattleStats } from '~/types/battle'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'
import { getPlayerTickets, getPlayerTotalDamage } from '~/utils/seasonConfig'
import { buildTicketCoachingInsights } from '~/utils/ticketCoaching'

export function buildOfficerDigestMarkdown(
  players: BattlePlayer[],
  stats: BattleStats | null,
  flight: number,
  season: number
): string {
  const seasonLabel = `${flight}-${season}`
  const lines: string[] = [`# CCT officer digest — ${seasonLabel}`, '']

  if (stats) {
    lines.push(
      `- Players: **${stats.totalPlayers}**`,
      `- Guild season damage: **${BattleAnalyzer.formatDamage(stats.guildScore)}**`,
      `- Avg tickets/member: **${stats.ticketStats.averageTicketsUsed}/18**`,
      `- Below 15 tickets: **${stats.ticketStats.playersBelowMinimum}**`,
      ''
    )
  }

  for (const tip of buildTicketCoachingInsights(players, flight, season)) {
    lines.push(`- ${tip.replace(/\*\*/g, '')}`)
  }

  lines.push('', '## Lowest ticket use (needs ping)')
  const sorted = [...players].sort(
    (a, b) => getPlayerTickets(a, flight, season) - getPlayerTickets(b, flight, season)
  )
  for (const p of sorted.slice(0, 8)) {
    const t = getPlayerTickets(p, flight, season)
    if (t >= 18) break
    lines.push(`- ${p.playerName}: **${t}/18**`)
  }

  lines.push('', '## Top 5 season damage')
  for (const p of players.slice(0, 5)) {
    lines.push(
      `- ${p.playerName}: **${BattleAnalyzer.formatDamage(getPlayerTotalDamage(p, flight, season))}** (${getPlayerTickets(p, flight, season)}/18)`
    )
  }

  return lines.join('\n')
}
