import { parseGoogleSheetsCredentials } from './googleCredentials.ts'
import { getOcrProvider } from './openaiVision.ts'
import {
  isRequireDryRunFirstEnabled,
  listDryRunApprovalsForGuild
} from './dryRunConfirmStore.ts'
import { roleGateDescription } from './roleGate.ts'

const startedAt = Date.now()

export function buildSonicStatusText(guildId?: string | null): string {
  let sheetsStatus = '❌ not configured'
  try {
    const creds = parseGoogleSheetsCredentials()
    const email = String(creds.client_email ?? 'service account')
    sheetsStatus = `✅ ${email}`
  } catch {
    sheetsStatus = '❌ credentials error (see bot logs)'
  }

  const ocr =
    getOcrProvider() === 'openai'
      ? `OpenAI \`${process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o'}\``
      : 'Tesseract (local)'

  const dryRunPolicy = isRequireDryRunFirstEnabled()
    ? '**On** — run `--dry-run` once per season before writing'
    : '**Off** (`REQUIRE_DRY_RUN_FIRST=0`)'

  const lines = [
    '**Sonic-Analyzer status**',
    '',
    `• Uptime: **${formatUptime(Date.now() - startedAt)}**`,
    `• Google Sheets: ${sheetsStatus}`,
    `• OCR: ${ocr}`,
    `• Dry-run before write: ${dryRunPolicy}`,
    `• Import access: ${roleGateDescription()}`
  ]

  if (guildId) {
    const approvals = listDryRunApprovalsForGuild(guildId)
    if (approvals.length === 0) {
      lines.push('• Dry-run approvals (this server): _none yet_')
    } else {
      const recent = approvals.slice(0, 5).map(a => `\`${a.seasonId}\` (${a.approval.playerCount}p)`)
      lines.push(`• Dry-run approvals (this server): ${recent.join(', ')}`)
    }
  }

  return lines.join('\n')
}

function formatUptime(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
