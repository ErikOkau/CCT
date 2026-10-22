import './loadEnv.ts'
import { parseGoogleSheetsCredentials } from './googleCredentials.ts'
import {
  Client,
  GatewayIntentBits,
  Partials,
  type Message
} from 'discord.js'
import { dedupeWarnings, sortPlayersByBossDamage } from '../../../utils/guildBattlePlayerMerge.ts'
import { buildPreviewBundle, chunkDiscordText, replyWithPreview } from './discordReply.ts'
import { mergeOcrPlayers } from '../../../utils/guildBattleSheet.ts'
import { collectParticipantImages, maxImagesLabel } from './collectAttachments.ts'
import { parseParticipantsImages } from './parseScreenshot.ts'
import {
  buildCoverageReport,
  runSanityChecks
} from '../../../utils/guildBattleImportChecks.ts'
import {
  hasDryRunApproval,
  isRequireDryRunFirstEnabled,
  markDryRunApproved
} from './dryRunConfirmStore.ts'
import { buildSonicInfoText, getMessageCommand, INFO_COMMANDS, STATUS_COMMANDS } from './helpText.ts'
import { memberCanRunImport } from './roleGate.ts'
import { buildSonicStatusText } from './sonicStatus.ts'
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

async function downloadAttachments(message: Message): Promise<{
  buffers: Buffer[]
  mergedFromReply: boolean
  totalSelected: number
  skippedNonImages: number
}> {
  const { attachments, mergedFromReply, skippedNonImages } = await collectParticipantImages(message)
  const buffers: Buffer[] = []
  for (const att of attachments) {
    const res = await fetch(att.url)
    buffers.push(Buffer.from(await res.arrayBuffer()))
  }
  return {
    buffers,
    mergedFromReply,
    totalSelected: attachments.length,
    skippedNonImages
  }
}

client.on('messageCreate', async message => {
  if (message.author.bot) return

  const cmd = getMessageCommand(message.content, PREFIX)
  if (cmd && (INFO_COMMANDS as readonly string[]).includes(cmd)) {
    const info = buildSonicInfoText(PREFIX)
    const chunks = chunkDiscordText(info)
    await message.reply(chunks[0]!)
    for (let i = 1; i < chunks.length; i++) await message.channel.send(chunks[i]!)
    return
  }
  if (cmd && (STATUS_COMMANDS as readonly string[]).includes(cmd)) {
    await message.reply(buildSonicStatusText(message.guild?.id))
    return
  }

  const { seasonId, dryRun, overwrite } = parseSubmitCommand(message.content)
  if (!seasonId) return

  const access = await memberCanRunImport(message)
  if (!access.ok) {
    await message.reply(access.reason ?? 'Not allowed.')
    return
  }

  if (message.attachments.size === 0 && !message.reference?.messageId) {
    await message.reply(
      `Attach up to **${maxImagesLabel()}** Participants screenshots (~5 members each, full table) for \`${seasonId}\`.\n` +
        `Tip: Discord sometimes limits one upload batch — send **6 in one message**, or **reply** to your earlier message with more images (same author, up to **${maxImagesLabel()}** total).`
    )
    return
  }

  try {
    const { buffers, mergedFromReply, totalSelected, skippedNonImages } =
      await downloadAttachments(message)

    if (buffers.length === 0) {
      await message.reply(
        'No image attachments detected. Use PNG/JPEG screenshots (not PDF). If you attached files, try re-uploading as images.'
      )
      return
    }

    await message.channel.send(
      `Processing \`${seasonId}\` (${totalSelected} image(s)${mergedFromReply ? ', including reply' : ''})…`
    )

    const parsed = await parseParticipantsImages(buffers, seasonId)
    if (mergedFromReply) {
      parsed.warnings.push('Merged screenshots from your replied message (same author).')
    }
    if (skippedNonImages > 0) {
      parsed.warnings.push(`Ignored ${skippedNonImages} non-image attachment(s).`)
    }
    if (message.attachments.size > maxImagesLabel()) {
      parsed.warnings.push(`Only the first **${maxImagesLabel()}** images are processed.`)
    }
    const merged = sortPlayersByBossDamage(
      mergeOcrPlayers(parsed.rows),
      parsed.headerBosses
    )

    if (merged.length === 0) {
      await message.reply('No player rows detected. Try clearer screenshots or `--dry-run` to debug.')
      return
    }

    const writeSeasonId = parsed.seasonId ?? seasonId
    const noDamageCount = merged.filter(
      p => !Object.values(p.stats).some(s => s && s.damage > 0)
    ).length
    const coverage = buildCoverageReport(
      merged.length,
      totalSelected,
      undefined,
      parsed.uiParticipantCount,
      noDamageCount
    )
    parsed.warnings.push(...coverage.warnings)
    parsed.warnings.push(...runSanityChecks(merged, parsed.headerBosses))
    parsed.warnings = dedupeWarnings(parsed.warnings)

    const bundle = buildPreviewBundle(
      writeSeasonId,
      merged,
      parsed.warnings,
      parsed.headerBosses,
      coverage,
      totalSelected
    )

    const guildId = message.guild?.id ?? 'dm'

    if (dryRun) {
      markDryRunApproved(guildId, writeSeasonId, {
        playerCount: merged.length,
        imageCount: totalSelected,
        userId: message.author.id
      })
      const approveNote = isRequireDryRunFirstEnabled()
        ? '\n\n✅ **Dry-run recorded** — you can write this season without `--dry-run` (same server).'
        : '\n\n(dry run — sheet not modified)'
      await replyWithPreview(message, bundle, approveNote, writeSeasonId)
      return
    }

    if (isRequireDryRunFirstEnabled() && !hasDryRunApproval(guildId, writeSeasonId)) {
      await replyWithPreview(
        message,
        bundle,
        `\n\n⛔ **Sheet not modified.** Run \`${PREFIX}submit_result ${writeSeasonId} --dry-run\` with the same screenshots first, then submit again without \`--dry-run\`.\n` +
          `(\`${PREFIX}sonic_status\` · disable with \`REQUIRE_DRY_RUN_FIRST=0\` in env.)`,
        writeSeasonId
      )
      return
    }

    const exists = await sheetTabExists(writeSeasonId)
    if (exists && !overwrite) {
      await replyWithPreview(
        message,
        bundle,
        `\n\n⚠️ **Sheet \`${writeSeasonId}\` already exists.** Not writing. Add \`--overwrite\` to replace values.`,
        writeSeasonId
      )
      return
    }

    const result = await createSeasonTabFromOcr(writeSeasonId, merged, { overwrite })
    await replyWithPreview(
      message,
      bundle,
      `\n\n✅ ${result.created ? (exists ? 'Updated' : 'Created') : 'Skipped'} tab \`${writeSeasonId}\` (${result.playerCount} OCR rows).`,
      writeSeasonId
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
