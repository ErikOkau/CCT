import { MAX_IMAGES } from './parseScreenshot.ts'
import { getOcrProvider } from './openaiVision.ts'

export const INFO_COMMANDS = ['sonic_info', 'sonic_help', 'sonic-help'] as const

export function getMessageCommand(content: string, prefix: string): string | null {
  const trimmed = content.trim()
  if (!trimmed.startsWith(prefix)) return null
  const rest = trimmed.slice(prefix.length).trim()
  const cmd = rest.split(/\s+/)[0]
  return cmd?.toLowerCase() ?? null
}

export function buildSonicInfoText(prefix: string): string {
  const ocr =
    getOcrProvider() === 'openai'
      ? `OpenAI Vision (\`${process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o'}\`)`
      : 'Tesseract (local)'

  return [
    '**Sonic-Analyzer — guild sheet import**',
    '',
    '**Import season results**',
    `\`${prefix}submit_result <season>\` + up to **${MAX_IMAGES}** Participants screenshots in the **same message**.`,
    '• Season id matches the yellow footer, e.g. \`33-2\`, \`35-1\`.',
    '• Scroll the full roster (~5 rows per shot); overlap between shots is OK.',
    '• Use the in-game **Participants** table (boss headers visible).',
    '',
    '**Flags** (any order after the season id):',
    `• \`--dry-run\` — parse & preview only; **does not** write Google Sheets.`,
    `• \`--overwrite\` — if tab \`<season>\` already exists, **replace** cell values (otherwise skip with a warning).`,
    '',
    '**Examples**',
    `\`${prefix}submit_result 33-2 --dry-run\` + images`,
    `\`${prefix}submit_result 35-1 --overwrite\` + images`,
    '',
    '**Other commands**',
    `\`${prefix}sonic_info\` — this help (\`${prefix}sonic_help\` also works)`,
    '',
    '**Tips**',
    `• OCR engine: **${ocr}** (\`CHATGPT_API\` in env → vision; else \`OCR_PROVIDER=tesseract\`).`,
    '• Always **dry-run** first and spot-check names/damage.',
    '• Duplicate names across overlapping shots are merged automatically.',
    '• Sheet layout: each boss column ranked **high → low** damage (same as manual tabs).'
  ].join('\n')
}
