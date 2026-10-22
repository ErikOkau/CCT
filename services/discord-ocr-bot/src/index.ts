import './loadEnv.ts'
import { parseGoogleSheetsCredentials } from './googleCredentials.ts'
import {
  Client,
  GatewayIntentBits,
  Partials,
  type Message
} from 'discord.js'
import { sortPlayersByBossDamage } from '../../../utils/guildBattlePlayerMerge.ts'
import { mergeOcrPlayers } from '../../../utils/guildBattleSheet.ts'
import type { BossField } from '../../../utils/guildBattleBosses.ts'
import { MAX_IMAGES, parseParticipantsImages } from './parseScreenshot.ts'
import { buildSonicInfoText, getMessageCommand, INFO_COMMANDS } from './helpText.ts'
import { createSeasonTabFromOcr, sheetTabExists } from './sheetsClient.ts'

const PREFIX = process.env.DISCORD_COMMAND_PREFIX ?? '?'
const COMMAND = 'submit_result'

try {
  const creds = parseGoogleSheetsCredentials()
  const email = String(creds.client_email ?? '')
  console.log(`✅ Google Sheets credentials OK (${email || 'service account'})`)
} catch (err: any) {
  console.error('❌ Google Sheets credentials:', err.message)
  console.error('   Fix .env then restart. Quick check: npm run test:sheets')
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
})

function parseSubmitCommand(content: string): { seasonId: string | null; dryRun: boolean; overwrite: boolean } {
  const trimmed = content.trim()
  const withoutPrefix = trimmed.startsWith(PREFIX) ? trimmed.slice(PREFIX.length).trim() : trimmed
  const [cmd, seasonId, ...flags] = withoutPrefix.split(/\s+/)
  if (cmd?.toLowerCase() !== COMMAND || !seasonId) {
    return { seasonId: null, dryRun: false, overwrite: false }
  }
  if (!/^\d+-\d+$/.test(seasonId)) {
    return { seasonId: null, dryRun: false, overwrite: false }
  }
  return {
    seasonId,
    dryRun: flags.includes('--dry-run'),
    overwrite: flags.includes('--overwrite')
  }
}

async function downloadAttachments(message: Message): Promise<Buffer[]> {
  const images = message.attachments.filter(a =>
    a.contentType?.startsWith('image/') ?? /\.(png|jpe?g|webp)$/i.test(a.name ?? '')
  )
  const buffers: Buffer[] = []
  for (const att of [...images.values()].slice(0, MAX_IMAGES)) {
    const res = await fetch(att.url)
    buffers.push(Buffer.from(await res.arrayBuffer()))
  }
  return buffers
}

function formatPreview(
  seasonId: string,
  merged: ReturnType<typeof mergeOcrPlayers>,
  warnings: string[],
  headerBosses: BossField[]
) {
  const sorted = sortPlayersByBossDamage(merged, headerBosses.length ? headerBosses : [])
  const bossNote = headerBosses.length
    ? `\nBoss columns: **${headerBosses.join(' + ')}**`
    : ''
  const lines = sorted.slice(0, 30).map(p => {
    const parts = Object.entries(p.stats)
      .filter(([, s]) => s && s.damage > 0)
      .map(([field, s]) => `${field}: ${(s!.damage / 1e9).toFixed(1)}B x${s!.battles}`)
    return `• **${p.playerName}** — ${parts.join(' | ') || 'no damage'}`
  })
  const warnBlock = warnings.length ? `\n⚠️ ${warnings.slice(0, 5).join('\n⚠️ ')}` : ''
  return `**Season \`${seasonId}\`** — ${sorted.length} players${bossNote}\n${lines.join('\n')}${warnBlock}`
}

client.on('messageCreate', async message => {
  if (message.author.bot) return

  const cmd = getMessageCommand(message.content, PREFIX)
  if (cmd && (INFO_COMMANDS as readonly string[]).includes(cmd)) {
    await message.reply(buildSonicInfoText(PREFIX))
    return
  }

  const { seasonId, dryRun, overwrite } = parseSubmitCommand(message.content)
  if (!seasonId) return

  if (message.attachments.size === 0) {
    await message.reply(
      `Attach up to **${MAX_IMAGES}** Participants screenshots (~5 members each, full table) for \`${seasonId}\`.`
    )
    return
  }

  await message.channel.send(`Processing \`${seasonId}\` (${Math.min(message.attachments.size, MAX_IMAGES)} image(s))…`)

  try {
    const buffers = await downloadAttachments(message)
    const parsed = await parseParticipantsImages(buffers, seasonId)
    const merged = sortPlayersByBossDamage(
      mergeOcrPlayers(parsed.rows),
      parsed.headerBosses
    )

    if (merged.length === 0) {
      await message.reply('No player rows detected. Try clearer screenshots or `--dry-run` to debug.')
      return
    }

    const writeSeasonId = parsed.seasonId
    const preview = formatPreview(writeSeasonId, merged, parsed.warnings, parsed.headerBosses)

    if (dryRun) {
      await message.reply(`${preview}\n\n(dry run — sheet not modified)`)
      return
    }

    const exists = await sheetTabExists(writeSeasonId)
    if (exists && !overwrite) {
      await message.reply(
        `${preview}\n\n⚠️ **Sheet \`${writeSeasonId}\` already exists.** Not writing. Add \`--overwrite\` to replace values.`
      )
      return
    }

    const result = await createSeasonTabFromOcr(writeSeasonId, merged, { overwrite })
    await message.reply(
      `${preview}\n\n✅ ${result.created ? (exists ? 'Updated' : 'Created') : 'Skipped'} tab \`${writeSeasonId}\` (${result.playerCount} OCR rows).`
    )
  } catch (err: any) {
    console.error(err)
    await message.reply(`Failed: ${err.message ?? err}`)
  }
})

client.once('clientReady', () => {
  console.log(`✅ Discord bot ready as ${client.user?.tag} (prefix "${PREFIX}")`)
})

const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
  console.error('DISCORD_BOT_TOKEN is required')
  process.exit(1)
}

client.login(token).catch(err => {
  console.error('Discord login failed:', err.message)
  process.exit(1)
})
