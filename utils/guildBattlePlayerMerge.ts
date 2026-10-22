import type { BossField } from './guildBattleBosses'
import type { OcrPlayerRow } from './guildBattleSheet'

const BOSS_FIELDS: BossField[] = [
  'redVelvetDragon',
  'avatarOfDestiny',
  'livingAbyss',
  'machineGod'
]

/** NFKC + lowercase for merge keys; Latin only for fuzzy compare helper. */
export function normalizePlayerMergeKey(name: string): string {
  return name.normalize('NFKC').trim().toLowerCase()
}

/** Collapse small kana so いゃ / いや variants often match. */
export function normalizePlayerMergeKeyLoose(name: string): string {
  let s = normalizePlayerMergeKey(name)
  s = s.replace(/[ゃゅょぁぃぅぇぉっ]/g, '')
  s = s.replace(/[ャュョァィゥェォッ]/g, '')
  return s
}

export function playerStatsFingerprint(row: OcrPlayerRow): string {
  return BOSS_FIELDS.map(f => {
    const s = row.stats[f]
    if (!s) return `${f}:0:0`
    return `${f}:${s.damage}:${s.battles}`
  }).join('|')
}

export function seasonDamageForFields(
  row: OcrPlayerRow,
  fields?: BossField[]
): number {
  const use = fields?.length ? fields : BOSS_FIELDS
  return use.reduce((sum, f) => sum + (row.stats[f]?.damage ?? 0), 0)
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    prev = cur
  }
  return prev[n]!
}

export function playerNamesSimilar(a: string, b: string): boolean {
  const ka = normalizePlayerMergeKey(a)
  const kb = normalizePlayerMergeKey(b)
  if (ka === kb) return true

  const la = normalizePlayerMergeKeyLoose(a)
  const lb = normalizePlayerMergeKeyLoose(b)
  if (la === lb) return true

  const minLen = Math.min(la.length, lb.length)
  if (minLen >= 4 && levenshtein(la, lb) <= 2) return true

  return false
}

function pickDisplayName(a: string, b: string): string {
  const ta = a.trim()
  const tb = b.trim()
  if (ta.length !== tb.length) return ta.length > tb.length ? ta : tb
  return ta
}

function mergeStats(
  target: OcrPlayerRow['stats'],
  incoming: OcrPlayerRow['stats']
): OcrPlayerRow['stats'] {
  const out = { ...target }
  for (const [field, stat] of Object.entries(incoming) as [BossField, { damage: number; battles: number }][]) {
    const prev = out[field]
    if (!prev || stat.damage > prev.damage) {
      out[field] = { ...stat }
    } else if (prev && stat.damage === prev.damage && stat.battles > prev.battles) {
      out[field] = { ...stat }
    }
  }
  return out
}

function rowsShouldMerge(a: OcrPlayerRow, b: OcrPlayerRow): boolean {
  if (playerNamesSimilar(a.playerName, b.playerName)) return true
  const fpA = playerStatsFingerprint(a)
  const fpB = playerStatsFingerprint(b)
  if (fpA !== fpB) return false
  const totalA = seasonDamageForFields(a)
  const totalB = seasonDamageForFields(b)
  if (totalA <= 0 || totalB <= 0) return false
  return levenshtein(
    normalizePlayerMergeKeyLoose(a.playerName),
    normalizePlayerMergeKeyLoose(b.playerName)
  ) <= 3
}

/** One row per player; merges overlap duplicates (e.g. kana variants on scroll overlap). */
export function mergeOcrPlayersUnique(rows: OcrPlayerRow[]): OcrPlayerRow[] {
  const merged: OcrPlayerRow[] = []

  for (const row of rows) {
    const name = row.playerName.trim()
    if (!name) continue

    let idx = merged.findIndex(
      existing =>
        normalizePlayerMergeKey(existing.playerName) === normalizePlayerMergeKey(name)
    )
    if (idx < 0) {
      idx = merged.findIndex(existing => rowsShouldMerge(existing, row))
    }

    if (idx < 0) {
      merged.push({ playerName: name, stats: { ...row.stats } })
      continue
    }

    const existing = merged[idx]!
    merged[idx] = {
      playerName: pickDisplayName(existing.playerName, name),
      stats: mergeStats(existing.stats, row.stats)
    }
  }

  return merged
}

export function sortPlayersByBossDamage(
  players: OcrPlayerRow[],
  bossFields: BossField[]
): OcrPlayerRow[] {
  return [...players].sort((a, b) => {
    const da = seasonDamageForFields(a, bossFields)
    const db = seasonDamageForFields(b, bossFields)
    if (db !== da) return db - da
    return a.playerName.localeCompare(b.playerName)
  })
}

export function dedupeWarnings(warnings: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of warnings) {
    const key = w.trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  return out
}
