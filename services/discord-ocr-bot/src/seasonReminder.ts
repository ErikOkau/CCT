import type { Client, TextChannel } from 'discord.js'
import { getBossForSeason, getLatestFlightAndSeason } from '../../../utils/seasonConfig.ts'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function startSeasonReminderLoop(client: Client) {
  const channelId = process.env.DISCORD_REMINDER_CHANNEL_ID?.trim()
  if (!channelId) return

  const send = async () => {
    try {
      const ch = await client.channels.fetch(channelId)
      if (!ch || !('send' in ch)) return
      const latest = getLatestFlightAndSeason()
      const prefix = process.env.DISCORD_COMMAND_PREFIX ?? '?'
      const bosses = [1, 2, 3]
        .map(slot => getBossForSeason(latest.flight, latest.season, slot)?.name)
        .filter(Boolean)
      const bossLine = bosses.length ? `\nActive bosses: **${bosses.join(' + ')}**` : ''
      await (ch as TextChannel).send(
        `📋 **Guild sheet reminder** — current season **${latest.flight}-${latest.season}**.${bossLine}\n` +
          `Update tab **Guild Progress** from the in-game hub, then run \`${prefix}submit_result ${latest.flight}-${latest.season} --dry-run\` with battle screenshots before writing.`
      )
    } catch (err: any) {
      console.warn('Season reminder failed:', err.message)
    }
  }

  setTimeout(send, 60_000)
  setInterval(send, WEEK_MS)
  console.log('📅 Weekly season reminder enabled')
}
