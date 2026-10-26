import type { BossField } from './guildBattleBosses'
import { playerNamesSimilar } from './guildBattlePlayerMerge'
import type { OcrPlayerRow } from './guildBattleSheet'

function namesForBoss(players: OcrPlayerRow[], field: BossField): string[] {
  return players
    .filter(p => (p.stats[field]?.damage ?? 0) > 0)
    .map(p => p.playerName.trim())
    .filter(Boolean)
}

/** Warn when the same player appears under different spellings across boss columns. */
export function detectCrossBossNameTypos(
  players: OcrPlayerRow[],
  headerBosses: BossField[]
): string[] {
  const warnings: string[] = []
  const fields = headerBosses.length >= 2 ? headerBosses.slice(0, 2) : headerBosses
  if (fields.length < 2) return warnings

  const [a, b] = fields
  const namesA = namesForBoss(players, a)
  const namesB = namesForBoss(players, b)

  for (const nameA of namesA) {
    for (const nameB of namesB) {
      if (nameA.toLowerCase() === nameB.toLowerCase()) continue
      if (!playerNamesSimilar(nameA, nameB)) continue
      warnings.push(
        `Name mismatch across boss columns: **${nameA}** (${a}) vs **${nameB}** (${b}) — fix spelling in sheet or re-OCR.`
      )
    }
  }

  return warnings.slice(0, 8)
}
