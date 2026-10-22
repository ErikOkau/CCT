import { AttachmentBuilder, type Message } from 'discord.js'
import type { buildCoverageReport } from '../../../utils/guildBattleImportChecks.ts'
import type { mergeOcrPlayers } from '../../../utils/guildBattleSheet.ts'
import type { BossField } from '../../../utils/guildBattleBosses.ts'
import { sortPlayersByBossDamage } from '../../../utils/guildBattlePlayerMerge.ts'

/** Discord message content hard limit */
export const DISCORD_CONTENT_MAX = 2000
const SAFE_CONTENT_MAX = 1850

export interface PreviewBundle {
  markdownBody: string
  plainDocument: string
  playerCount: number
}

function stripMarkdown(s: string): string {
  return s.replace(/\*\*/g, '').replace(/`/g, '')
}

export function buildPreviewBundle(
  seasonId: string,
  merged: ReturnType<typeof mergeOcrPlayers>,
  warnings: string[],
  headerBosses: BossField[],
  coverage: ReturnType<typeof buildCoverageReport>,
  imageCount: number
): PreviewBundle {
  const sorted = sortPlayersByBossDamage(merged, headerBosses.length ? headerBosses : [])
  const bossNote = headerBosses.length
    ? `\nBoss columns: ${headerBosses.join(' + ')}`
    : ''

  const playerLinesMd = sorted.map(p => {
    const parts = Object.entries(p.stats)
      .filter(([, s]) => s && s.damage > 0)
      .map(([field, s]) => `${field}: ${(s!.damage / 1e9).toFixed(1)}B x${s!.battles}`)
    return `• **${p.playerName}** — ${parts.join(' | ') || 'no damage'}`
  })

  const playerLinesPlain = sorted.map(p => {
    const parts = Object.entries(p.stats)
      .filter(([, s]) => s && s.damage > 0)
      .map(([field, s]) => `${field}: ${(s!.damage / 1e9).toFixed(1)}B x${s!.battles}`)
    return `- ${p.playerName} — ${parts.join(' | ') || 'no damage'}`
  })

  const warnBlock = warnings.length ? `\n⚠️ ${warnings.join('\n⚠️ ')}` : ''

  const headerMd =
    `**Season \`${seasonId}\`**${bossNote}\n` +
    `${coverage.headline}\n${coverage.detail}\n` +
    `_${imageCount} image(s) in this run_\n`

  const markdownBody = headerMd + playerLinesMd.join('\n') + warnBlock

  const plainDocument = [
    `Season ${seasonId}${stripMarkdown(bossNote)}`,
    stripMarkdown(coverage.headline),
    stripMarkdown(coverage.detail),
    `${imageCount} image(s) in this run`,
    '',
    `Players (${sorted.length}):`,
    ...playerLinesPlain,
    '',
    warnings.length ? 'Warnings:' : '',
    ...warnings.map(w => stripMarkdown(w))
  ]
    .filter((line, i, arr) => line !== '' || arr[i - 1] !== '')
    .join('\n')

  return {
    markdownBody,
    plainDocument,
    playerCount: sorted.length
  }
}

export function chunkDiscordText(text: string, max = SAFE_CONTENT_MAX): string[] {
  if (text.length <= max) return [text]
  const chunks: string[] = []
  let rest = text
  while (rest.length > 0) {
    if (rest.length <= max) {
      chunks.push(rest)
      break
    }
    let cut = rest.lastIndexOf('\n', max)
    if (cut < Math.floor(max * 0.4)) cut = max
    chunks.push(rest.slice(0, cut))
    rest = rest.slice(cut).trimStart()
  }
  return chunks
}

/** Reply with preview; uses .txt attachment when roster + warnings exceed Discord limit. */
export async function replyWithPreview(
  message: Message,
  bundle: PreviewBundle,
  footer: string,
  seasonId: string
): Promise<void> {
  const full = bundle.markdownBody + footer

  if (full.length <= SAFE_CONTENT_MAX) {
    await message.reply(full)
    return
  }

  const warnPreview =
    bundle.markdownBody.includes('⚠️')
      ? '\n⚠️ _Some warnings omitted here — see attached file._'
      : ''

  const shortContent =
    `**Season \`${seasonId}\`** — **${bundle.playerCount}** players parsed.\n` +
    `_Full roster & warnings attached (\`${seasonId}-preview.txt\`)._${warnPreview}${footer}`

  if (shortContent.length <= SAFE_CONTENT_MAX) {
    const file = new AttachmentBuilder(Buffer.from(bundle.plainDocument, 'utf8'), {
      name: `${seasonId}-preview.txt`
    })
    await message.reply({ content: shortContent, files: [file] })
    return
  }

  const file = new AttachmentBuilder(Buffer.from(bundle.plainDocument, 'utf8'), {
    name: `${seasonId}-preview.txt`
  })
  const footerChunks = chunkDiscordText(footer, SAFE_CONTENT_MAX - 120)
  await message.reply({
    content:
      `**Season \`${seasonId}\`** — **${bundle.playerCount}** players.\n` +
      `📎 Full details: \`${seasonId}-preview.txt\`\n${footerChunks[0] ?? ''}`,
    files: [file]
  })
  for (let i = 1; i < footerChunks.length; i++) {
    await message.channel.send(footerChunks[i]!)
  }
}
