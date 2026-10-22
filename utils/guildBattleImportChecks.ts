import type { BossField } from './guildBattleBosses'
import { seasonDamageForFields } from './guildBattlePlayerMerge'
import type { OcrPlayerRow } from './guildBattleSheet'

export const GUILD_ROSTER_CAP = 30

export interface CoverageReport {
  headline: string
  detail: string
  warnings: string[]
}

export function buildCoverageReport(
  playerCount: number,
  imageCount: number,
  maxGuild = GUILD_ROSTER_CAP,
  uiParticipantCount?: number | null,
  noDamageCount = 0
): CoverageReport {
  const warnings: string[] = []
  const ui =
    uiParticipantCount != null && uiParticipantCount > 0
      ? Math.min(maxGuild, uiParticipantCount)
      : null

  const headline = ui
    ? `**Coverage:** **${playerCount}** parsed · in-game badge **${ui}** · ${imageCount} screenshot(s)`
    : `**Coverage:** ${playerCount}/${maxGuild} players · ${imageCount} screenshot(s)`

  let detail: string
  const missingFromUi = ui != null && playerCount < ui ? ui - playerCount : 0
  const extraVsUi = ui != null && playerCount > ui ? playerCount - ui : 0

  if (missingFromUi > 0) {
    detail = `**Missing ~${missingFromUi}** member(s) vs **Participants ${ui}** badge.`
    warnings.push(
      `Parsed **${playerCount}** but UI shows **${ui}** — check short names and scroll coverage.`
    )
  } else if (extraVsUi > 0) {
    const noDmgNote =
      noDamageCount > 0
        ? ` Includes **${noDamageCount}** with no damage (still listed — e.g. Niraj).`
        : ''
    detail =
      `**${extraVsUi}** more name(s) than the **${ui}** badge — badge often counts active fighters only;` +
      ` zero-damage rows still appear in the table.${noDmgNote}`
    if (extraVsUi > 1) {
      warnings.push('More than one extra name vs badge — scan the list for a possible **duplicate** from overlapping screenshots.')
    }
  } else if (ui != null && playerCount >= ui - 1 && imageCount >= 5) {
    detail = `Roster matches **Participants ${ui}** badge (incl. no-damage rows).`
  } else if (playerCount >= maxGuild - 2 && ui == null) {
    detail = 'Roster looks **complete** (≈ full guild).'
  } else if (playerCount >= 20) {
    detail = 'Roster is **partial** — check for a missing scroll section (~5–6 members).'
    if (imageCount < 6) {
      warnings.push(
        `Only **${imageCount}/6** images used — add screenshots (or reply-merge) to cover the full Participants list.`
      )
    } else {
      warnings.push(
        '**6 images** but under 28 players — likely a **gap** between scroll shots (e.g. mid-list not captured).'
      )
    }
  } else {
    detail = 'Roster is **low** — many members missing; add more overlapping screenshots.'
    warnings.push(
      `Parsed **${playerCount}** players; expect up to **${maxGuild}**. Scroll the entire Participants list in ~5-row shots.`
    )
  }

  const roughExpected = Math.min(maxGuild, Math.max(0, imageCount * 5 - 2))
  if (imageCount > 0 && playerCount + 4 < roughExpected) {
    warnings.push(
      `Expected ~**${roughExpected}** names from ${imageCount} image(s) but got **${playerCount}** — OCR may have skipped rows; re-shoot blurry panels.`
    )
  }

  return { headline, detail, warnings }
}

export function runSanityChecks(
  players: OcrPlayerRow[],
  headerBosses: BossField[]
): string[] {
  const warnings: string[] = []
  const bosses = headerBosses.length >= 2 ? headerBosses.slice(0, 2) : headerBosses

  for (const p of players) {
    for (const field of bosses) {
      const s = p.stats[field]
      if (!s || s.damage <= 0) continue
      if (s.battles !== 9 && s.battles !== 18) {
        warnings.push(
          `**${p.playerName}** — ${field}: **${s.battles}** battles (expected **9** per boss column).`
        )
      }
    }

    if (bosses.length >= 2) {
      const [b1, b2] = bosses
      const d1 = p.stats[b1]?.damage ?? 0
      const d2 = p.stats[b2]?.damage ?? 0
      const has1 = d1 > 0
      const has2 = d2 > 0
      if (has1 && !has2 && (p.stats[b2]?.battles ?? 0) > 0) {
        warnings.push(`**${p.playerName}** — damage on ${b1} only but ${b2} shows battles > 0.`)
      }
      if (!has1 && has2 && (p.stats[b1]?.battles ?? 0) > 0) {
        warnings.push(`**${p.playerName}** — damage on ${b2} only but ${b1} shows battles > 0.`)
      }
      if (has1 && has2) {
        const sum = d1 + d2
        const ratio = Math.max(d1, d2) / Math.min(d1, d2)
        if (ratio > 8) {
          warnings.push(
            `**${p.playerName}** — large boss imbalance (${(d1 / 1e9).toFixed(1)}B vs ${(d2 / 1e9).toFixed(1)}B); verify screenshot.`
          )
        }
        if (sum > 0 && (d1 === 0) !== (d2 === 0)) {
          /* single-boss player — ok */
        }
      }
    }
  }

  const totals = players
    .map(p => seasonDamageForFields(p, bosses))
    .filter(t => t > 0)
    .sort((a, b) => a - b)

  if (totals.length >= 8) {
    const median = totals[Math.floor(totals.length / 2)]!
    const threshold = median * 5
    for (const p of players) {
      const t = seasonDamageForFields(p, bosses)
      if (t > threshold) {
        warnings.push(
          `**${p.playerName}** — season damage **${(t / 1e9).toFixed(1)}B** is far above median (~${(median / 1e9).toFixed(1)}B); double-check OCR.`
        )
      }
    }
  }

  return warnings.slice(0, 12)
}
