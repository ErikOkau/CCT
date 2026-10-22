import type { BossField } from './guildBattleBosses'
import { matchBossFieldFromHeader, uiColumnOrderForFlight } from './guildBattleBosses'
import { mergeOcrPlayersUnique } from './guildBattlePlayerMerge'
import type { OcrPlayerRow } from './guildBattleSheet'

/** Discord allows many attachments; 6 × ~5 visible rows ≈ 30 members. */
export const MAX_IMAGES = 6
export const MAX_ROWS_PER_IMAGE = 8

export function parseSeasonIdFromText(text: string): string | null {
  const m = text.match(/destiny['']s\s*flight\s*(\d+)\s*[-–]\s*(\d+)/i)
    ?? text.match(/\b(\d{2,})\s*[-–]\s*(\d)\b/)
  if (!m) return null
  return `${m[1]}-${m[2]}`
}

export function parseBossHeadersFromText(headerText: string, flight: number): BossField[] {
  const lower = headerText.toLowerCase()
  const patterns: { field: BossField; re: RegExp }[] = [
    { field: 'redVelvetDragon', re: /red\s*velvet/ },
    { field: 'machineGod', re: /machine[\s-]*god|eternal\s*void/ },
    { field: 'avatarOfDestiny', re: /avatar\s*of\s*destiny/ },
    { field: 'livingAbyss', re: /living\s*abyss/ }
  ]

  const hits: { field: BossField; index: number }[] = []
  for (const { field, re } of patterns) {
    const match = lower.match(re)
    if (match?.index !== undefined) hits.push({ field, index: match.index })
  }
  hits.sort((a, b) => a.index - b.index)
  const ordered = hits.map(h => h.field).filter((f, i, arr) => arr.indexOf(f) === i)
  if (ordered.length >= 2) return ordered.slice(0, 2)

  const chunks = headerText
    .split(/\n|(?=Red Velvet|Living Abyss|Avatar|Machine)/i)
    .map(s => s.trim())
    .filter(Boolean)

  const found: BossField[] = []
  for (const chunk of chunks) {
    const field = matchBossFieldFromHeader(chunk)
    if (field && !found.includes(field)) found.push(field)
  }
  if (found.length >= 2) return found.slice(0, 2)

  const order = uiColumnOrderForFlight(flight)
  const fromOrder = order.filter(f => {
    const label =
      f === 'machineGod' ? 'machine'
      : f === 'redVelvetDragon' ? 'red'
      : f === 'livingAbyss' ? 'living'
      : 'avatar'
    return lower.includes(label)
  })
  if (fromOrder.length >= 2) return fromOrder.slice(0, 2)

  return found
}

export function parseNumericTail(text: string, bossColumnCount: number): {
  bosses: { battles: number; damage: number }[]
  warnings: string[]
} {
  const warnings: string[] = []
  if (/N\/A/i.test(text) && !/\d{1,3}(,\d{3}){2,}/.test(text)) {
    return {
      bosses: Array.from({ length: bossColumnCount }, () => ({ battles: 0, damage: 0 })),
      warnings
    }
  }

  const battleMatches = [...text.matchAll(/\bx\s*(\d{1,2})\b/gi)].map(m => parseInt(m[1], 10))
  const damageMatches = [...text.matchAll(/(\d{1,3}(?:,\d{3}){2,})/g)].map(m =>
    parseInt(m[1].replace(/,/g, ''), 10)
  )

  let bossBattles = battleMatches
  if (battleMatches.length > bossColumnCount) {
    bossBattles = battleMatches.slice(0, bossColumnCount)
  }

  while (bossBattles.length < bossColumnCount) bossBattles.push(0)

  let bossDamages = damageMatches
  if (damageMatches.length > bossColumnCount) {
    bossDamages = damageMatches.slice(0, bossColumnCount)
  }
  while (bossDamages.length < bossColumnCount) bossDamages.push(0)

  const bosses = bossBattles.slice(0, bossColumnCount).map((battles, i) => ({
    battles: bossDamages[i] > 0 ? battles : 0,
    damage: bossDamages[i] ?? 0
  }))

  if (bossColumnCount === 2 && damageMatches.length >= 2) {
    const sumBoss = bosses[0].damage + bosses[1].damage
    const total = damageMatches[damageMatches.length - 1]
    if (total > 0 && Math.abs(sumBoss - total) / total > 0.02) {
      warnings.push(`Row totals mismatch (boss sum ${sumBoss} vs OCR total ${total})`)
    }
  }

  return { bosses, warnings }
}

const SKIP_NAME = new Set([
  'member', 'leader', 'officer', 'player', 'rank', 'season', 'total', 'participants',
  'red', 'velvet', 'dragon', 'living', 'abyss', 'avatar', 'destiny', 'machine', 'god',
  'ment', 'mente', 'ember', 'party', 'animal', 'anime', 'gold', 'cream', 'blessed',
  'transcendent', 'conqueror', 'star', 'blade', 'collector', 'neighbor', 'gnome',
  'swe', 'sire', 'swwe', 'mmb', 'rae', 'mve', 'olive', 'sve', 'ame', 'eae', 'line', 'gi', 'sn',
  'srmrne', 'ammbye', 'ammrne', 'memeer', 'owe', 'ras', 'xupax', 'acceleranti', 'ment', 'enh'
])

export function isPlausiblePlayerName(name: string): boolean {
  const n = name.trim()
  if (n.length < 2 || n.length > 22) return false
  if (/^\d+$/.test(n)) return false
  if (SKIP_NAME.has(n.toLowerCase())) return false

  // CRK allows very short usernames (e.g. hi, XP, salt)
  if (n.length <= 3) {
    return /[\p{L}\p{N}]/u.test(n)
  }

  if (n.length >= 5 && /^[A-Z]{5,6}$/.test(n)) return false
  if (/^[A-Za-z]\d{6,}/.test(n)) return false
  if (/^[Xx][A-Za-z0-9]{4,}[Xx]$/.test(n) && (n.match(/[\u3040-\u30ff]/g)?.length ?? 0) === 0) {
    if (!/[\u3040-\u30ff\u4e00-\u9fff]/.test(n)) return false
  }
  if ((n.match(/[a-zA-Z]/g)?.length ?? 0) < 2 && !/[\u3040-\u30ff\u4e00-\u9fff]/.test(n)) return false
  if (n.length >= 6 && n === n.toUpperCase() && !/[\u3040-\u30ff\u4e00-\u9fff]/.test(n)) return false
  return true
}

export function extractUsernameFromBlob(text: string): string | null {
  const cjk = text.match(/[A-Za-z0-9]*[\u3040-\u30ff\u4e00-\u9fff]+[A-Za-z0-9\u3040-\u30ff\u4e00-\u9fff]*/g)
  if (cjk?.length) {
    const hit = cjk.find(s => s.length >= 2 && isPlausiblePlayerName(s))
    if (hit) return hit
  }

  const camel = text.match(/\b([A-Za-z][a-z0-9]{1,18}(?:[A-Z][a-z0-9]+)+)\b/g)
  if (camel?.length) {
    const hit = camel.filter(isPlausiblePlayerName).sort((a, b) => b.length - a.length)[0]
    if (hit) return hit
  }

  const lower = text.match(/\b([a-z][a-z0-9_]{2,18})\b/g)
  if (lower?.length) {
    const hit = lower.filter(isPlausiblePlayerName).sort((a, b) => b.length - a.length)[0]
    if (hit) return hit
  }

  const tokens = text.match(/[A-Za-z][A-Za-z0-9_]{2,22}/g) ?? []
  const candidates = tokens.filter(t => isPlausiblePlayerName(t))
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => b.length - a.length)[0]
}

function plausibleBossDamage(n: number): boolean {
  return n >= 40_000_000_000 && n <= 600_000_000_000
}

function plausibleSeasonTotal(n: number): boolean {
  return n >= 80_000_000_000 && n <= 1_200_000_000_000
}

function collectDamageInReadingOrder(text: string): number[] {
  const ordered: number[] = []
  const seen = new Set<number>()

  const push = (n: number) => {
    if (!plausibleBossDamage(n) && !plausibleSeasonTotal(n)) return
    if (seen.has(n)) return
    seen.add(n)
    ordered.push(n)
  }

  for (const m of text.matchAll(/(\d{1,3}(?:,\d{3}){2,})/g)) {
    push(parseInt(m[1].replace(/,/g, ''), 10))
  }

  for (const m of text.matchAll(/(\d{10,14})/g)) {
    const raw = m[1]
    if (raw.length <= 12) {
      push(parseInt(raw, 10))
      continue
    }
    for (const len of [12, 11]) {
      for (let start = 0; start + len <= raw.length; start++) {
        push(parseInt(raw.slice(start, start + len), 10))
      }
    }
  }

  return ordered
}

/** Boss damages in left-to-right column order when possible. */
export function extractDamageValues(text: string, count: number): number[] {
  const ordered = collectDamageInReadingOrder(text)
  if (ordered.length === 0) return Array(count).fill(0)

  if (count === 2 && ordered.length >= 3) {
    const total = ordered[ordered.length - 1]
    if (plausibleSeasonTotal(total)) {
      const a = ordered[0]
      const b = ordered[1]
      if (plausibleBossDamage(a) && plausibleBossDamage(b)) {
        const err = Math.abs(a + b - total) / total
        if (err <= 0.05) return [a, b]
      }
    }
    let best: { a: number; b: number; score: number } | null = null
    for (let i = 0; i < ordered.length; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        const a = ordered[i]
        const b = ordered[j]
        if (!plausibleBossDamage(a) || !plausibleBossDamage(b)) continue
        for (const total of ordered) {
          if (!plausibleSeasonTotal(total)) continue
          const err = Math.abs(a + b - total) / total
          if (err <= 0.05 && (!best || err < best.score)) best = { a, b, score: err }
        }
      }
    }
    if (best) return [best.a, best.b]
  }

  const bosses = ordered.filter(plausibleBossDamage)
  if (bosses.length >= count) return bosses.slice(0, count)
  return ordered.slice(0, count)
}

function isTicketLine(line: string): boolean {
  if (/x\s*9[\s\S]*x\s*9/i.test(line)) return true
  if (/x\s*9[\s\S]*x\s*1\d/i.test(line)) return true
  if (/x\s*9/i.test(line) && /N\/A/i.test(line)) return true
  return false
}

function buildRowFromBlob(
  blob: string,
  headerBosses: BossField[],
  bossColumnCount: number
): OcrPlayerRow | null {
  const playerName = extractUsernameFromBlob(blob)
  if (!playerName || !isPlausiblePlayerName(playerName)) return null

  const tail = parseNumericTail(blob, bossColumnCount)
  let damages = extractDamageValues(blob, bossColumnCount)
  if (damages.every(d => d === 0)) {
    damages = tail.bosses.map(b => b.damage)
  }

  const stats: Partial<Record<BossField, { damage: number; battles: number }>> = {}
  headerBosses.forEach((field, idx) => {
    const damage = damages[idx] ?? 0
    const battles = damage > 0 ? (tail.bosses[idx]?.battles || 9) : 0
    stats[field] = { damage, battles }
  })

  if (Object.values(stats).every(s => !s?.damage)) return null
  return { playerName, stats }
}

/** Parse one full-table OCR dump (more reliable than per-row crops on CRK fonts). */
export function parseParticipantsFullText(
  text: string,
  headerBosses: BossField[]
): { rows: OcrPlayerRow[]; warnings: string[] } {
  const warnings: string[] = []
  const rows: OcrPlayerRow[] = []
  const bossColumnCount = Math.max(headerBosses.length, 2)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const seenKeys = new Set<string>()

  const pushRow = (row: OcrPlayerRow | null) => {
    if (!row) return
    const key = row.playerName.toLowerCase()
    if (seenKeys.has(key)) return
    seenKeys.add(key)
    rows.push(row)
  }

  for (let i = 0; i < lines.length; i++) {
    if (!isTicketLine(lines[i])) continue

    const blob = lines.slice(i, i + 4).join(' ')
    const nameLine = lines[i + 1] ?? ''
    const row =
      buildRowFromBlob(nameLine, headerBosses, bossColumnCount)
      ?? buildRowFromBlob(blob, headerBosses, bossColumnCount)
    pushRow(row)
  }

  // Secondary pass: lines with 2+ comma damages and a username (missed ticket lines)
  for (const line of lines) {
    if (isTicketLine(line)) continue
    const commaCount = (line.match(/\d{1,3}(?:,\d{3}){2,}/g) ?? []).length
    if (commaCount < 2) continue
    pushRow(buildRowFromBlob(line, headerBosses, bossColumnCount))
  }

  return { rows, warnings }
}

export function filterAndDedupeOcrRows(rows: OcrPlayerRow[]): OcrPlayerRow[] {
  const plausible = rows.filter(r => isPlausiblePlayerName(r.playerName))
  return mergeOcrPlayersUnique(plausible)
}

export function parsePlayerNameFromCell(text: string): string | null {
  const lines = text
    .split('\n')
    .map(l => l.replace(/[^\p{L}\p{N}\s_.\-']/gu, '').trim())
    .filter(l => l.length >= 2)

  const skip = /^(player|member|leader|rank|season|total|red|velvet|living|abyss|avatar|machine|god|participants)$/i
  const candidates = lines.filter(l => !skip.test(l) && !/^x\d+$/i.test(l) && !/^\d+$/.test(l))

  if (candidates.length === 0) return null
  return candidates[candidates.length - 1] ?? null
}
