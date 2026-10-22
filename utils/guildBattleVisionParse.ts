import type { BossField } from './guildBattleBosses'
import { matchBossFieldFromHeader } from './guildBattleBosses'
import type { OcrPlayerRow } from './guildBattleSheet'
import { filterAndDedupeOcrRows } from './guildBattleOcrParse'

const BOSS_FIELDS: BossField[] = [
  'redVelvetDragon',
  'avatarOfDestiny',
  'livingAbyss',
  'machineGod'
]

export interface VisionExtractPayload {
  seasonId?: string | null
  bossColumns?: string[]
  players?: {
    playerName?: string
    stats?: {
      boss?: string
      damage?: number | string
      battles?: number | string
    }[]
  }[]
}

function coerceBossField(raw: string | undefined): BossField | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if ((BOSS_FIELDS as string[]).includes(trimmed)) return trimmed as BossField
  return matchBossFieldFromHeader(trimmed)
}

function parseDamage(raw: number | string | undefined): number {
  if (raw === undefined || raw === null || raw === '') return 0
  if (typeof raw === 'number') {
    if (raw > 0 && raw < 1_000_000) return Math.round(raw * 1e9)
    return Math.round(raw)
  }
  const s = String(raw).trim()
  if (/^n\/a$/i.test(s)) return 0
  const digits = s.replace(/,/g, '').replace(/\s/g, '')
  if (!digits) return 0
  const n = Number(digits)
  if (!Number.isFinite(n)) return 0
  if (n > 0 && n < 1_000_000) return Math.round(n * 1e9)
  return Math.round(n)
}

function parseBattles(raw: number | string | undefined, hasDamage: boolean): number {
  if (!hasDamage) return 0
  if (typeof raw === 'number') return raw > 0 ? Math.round(raw) : 9
  const s = String(raw ?? '').trim()
  const m = s.match(/\d+/)
  if (m) return parseInt(m[0], 10)
  return 9
}

export function extractJsonObjectFromModelText(text: string): string {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence?.[1]) return fence[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

export function visionPayloadToParsed(
  payload: VisionExtractPayload,
  options?: { seasonIdHint?: string; flightHint?: number }
): {
  seasonId: string | null
  headerBosses: BossField[]
  rows: OcrPlayerRow[]
  warnings: string[]
} {
  const warnings: string[] = []
  const bossColumnsRaw = payload.bossColumns ?? []
  const headerBosses: BossField[] = []
  for (const col of bossColumnsRaw) {
    const f = coerceBossField(col)
    if (f && !headerBosses.includes(f)) headerBosses.push(f)
  }

  const rows: OcrPlayerRow[] = []
  for (const p of payload.players ?? []) {
    const name = (p.playerName ?? '').trim()
    if (!name) continue

    const stats: OcrPlayerRow['stats'] = {}
    for (const st of p.stats ?? []) {
      const bossField = coerceBossField(st.boss)
      if (!bossField) continue
      const damage = parseDamage(st.damage)
      const battles = parseBattles(st.battles, damage > 0)
      if (damage > 0 || battles > 0) {
        stats[bossField] = { damage, battles }
      }
    }

    if (Object.keys(stats).length === 0 && (p.stats ?? []).length >= 2 && headerBosses.length >= 2) {
      const list = p.stats ?? []
      for (let i = 0; i < Math.min(2, list.length); i++) {
        const field = headerBosses[i]
        if (!field) continue
        const damage = parseDamage(list[i]?.damage)
        const battles = parseBattles(list[i]?.battles, damage > 0)
        if (damage > 0) stats[field] = { damage, battles }
      }
    }

    rows.push({ playerName: name, stats })
  }

  let seasonId = payload.seasonId?.trim() ?? null
  if (!seasonId && options?.seasonIdHint) seasonId = options.seasonIdHint

  if (headerBosses.length < 2 && options?.seasonIdHint) {
    warnings.push('Boss columns unclear in vision JSON — falling back may happen upstream')
  }

  return {
    seasonId,
    headerBosses: headerBosses.slice(0, 2),
    rows: filterAndDedupeOcrRows(rows),
    warnings
  }
}

export function parseVisionModelJson(
  text: string,
  options?: { seasonIdHint?: string; flightHint?: number }
): ReturnType<typeof visionPayloadToParsed> {
  const warnings: string[] = []
  let payload: VisionExtractPayload
  try {
    payload = JSON.parse(extractJsonObjectFromModelText(text)) as VisionExtractPayload
  } catch {
    warnings.push('Vision model returned invalid JSON')
    return {
      seasonId: options?.seasonIdHint ?? null,
      headerBosses: [],
      rows: [],
      warnings
    }
  }
  const parsed = visionPayloadToParsed(payload, options)
  parsed.warnings.unshift(...warnings)
  return parsed
}

export function buildVisionExtractionPrompt(seasonIdHint?: string): string {
  const hint = seasonIdHint
    ? `The Discord command season is \`${seasonIdHint}\` — use it if the footer pill is unclear.`
    : 'Read the yellow footer pill (e.g. "Destiny\'s Flight 33-2") for seasonId.'

  return `You are extracting Cookie Run: Kingdom guild battle **Participants** table data from a screenshot.

${hint}

Return ONLY valid JSON (no markdown) with this shape:
{
  "seasonId": "33-2",
  "bossColumns": ["redVelvetDragon", "livingAbyss"],
  "players": [
    {
      "playerName": "ExactUsername",
      "stats": [
        { "boss": "redVelvetDragon", "damage": 245001284351, "battles": 9 },
        { "boss": "livingAbyss", "damage": 304766990577, "battles": 9 }
      ]
    }
  ]
}

Rules:
- \`bossColumns\`: left-to-right boss damage columns only (not Season Total). Use these exact keys when possible: redVelvetDragon, livingAbyss, avatarOfDestiny, machineGod — match the header text.
- \`playerName\`: the bold username under the title — NOT the colorful title line above it.
- \`damage\`: full integer as shown (commas in UI are thousands separators). Do NOT convert to billions. Use 0 for N/A or missing.
- \`battles\`: number after "x" above damage (usually 9). Use 0 if no damage.
- Include every player row visible in the table (typically ~5).
- Preserve special characters in names (Japanese, ü, etc.).
- Do not invent players or numbers.`
}
