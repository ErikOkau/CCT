import type { ComparisonRow, GearCheckResult } from './types'

export function buildGearFixList(result: GearCheckResult): string {
  const lines: string[] = []
  const who = result.matchedShort || result.cookieName || 'Cookie'
  lines.push(`**${who}** (${result.bossSlug.toUpperCase()} gear check)`)

  for (const row of result.comparisons) {
    if (row.status === 'met') continue
    if (row.status === 'info') continue
    const action =
      row.status === 'missing'
        ? `add **${row.label}** (target ${row.targetLabel})`
        : `${row.label} **${row.scannedLabel}** → need **${row.targetLabel}**`
    lines.push(`• ${action}`)
  }

  if (lines.length === 1) lines.push('• All checked stats look good ✅')
  return lines.join('\n')
}
