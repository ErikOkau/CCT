import { extractJsonObjectFromModelText } from '~/utils/guildBattleVisionParse'
import type { GearVisionResult, ScannedStat } from './types'
import { normalizeVisionStat, parseStatNumber } from './statNormalize'

export function parseGearVisionJson(text: string): GearVisionResult {
  const warnings: string[] = []
  let payload: Record<string, unknown> = {}
  try {
    payload = JSON.parse(extractJsonObjectFromModelText(text)) as Record<string, unknown>
  } catch {
    return {
      cookieName: '',
      stats: [],
      warnings: ['Vision JSON parse failed']
    }
  }

  const stats: ScannedStat[] = []
  const rawStats = payload.stats
  if (Array.isArray(rawStats)) {
    for (const row of rawStats) {
      if (!row || typeof row !== 'object') continue
      const normalized = normalizeVisionStat(row as Record<string, unknown>)
      if (normalized) stats.push(normalized)
    }
  }

  if (Array.isArray(payload.warnings)) {
    for (const w of payload.warnings) warnings.push(String(w))
  }
  if (!stats.length) warnings.push('No stat rows read — use Gear → Total tab screenshot')

  return {
    cookieName: String(payload.cookieName ?? '').trim(),
    gameMode: payload.gameMode != null ? String(payload.gameMode) : null,
    statsTab: payload.statsTab != null ? String(payload.statsTab) : null,
    tartEffect: payload.tartEffect != null ? String(payload.tartEffect) : null,
    tartValue: parseStatNumber(payload.tartValue),
    elementalType: payload.elementalType != null ? String(payload.elementalType) : null,
    elementalValue: parseStatNumber(payload.elementalValue),
    stats,
    warnings
  }
}
