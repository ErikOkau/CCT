import type { BossField } from './guildBattleBosses'
import { BOSS_LABELS } from './guildBattleBosses'
import { getActiveBossFields, parseSeasonId } from './seasonConfig'

export const SHEET_TEMPLATE_TAB = '_ocr_template'

export interface OcrPlayerRow {
  playerName: string
  stats: Partial<Record<BossField, { damage: number; battles: number }>>
}

export interface ParsedScreenshot {
  seasonId: string | null
  headerBosses: BossField[]
  rows: OcrPlayerRow[]
  warnings: string[]
}

const BOSS_BLOCKS: { field: BossField; startCol: number }[] = [
  { field: 'redVelvetDragon', startCol: 0 },
  { field: 'avatarOfDestiny', startCol: 7 },
  { field: 'livingAbyss', startCol: 14 },
  { field: 'machineGod', startCol: 21 }
]

const MAX_GUILD_SIZE = 30

export function damageToBillionCell(damage: number): string {
  if (damage <= 0) return ''
  const billions = damage / 1e9
  const rounded = Math.round(billions * 10) / 10
  return `${rounded} Billion`
}

export function avgDamagePerTicketMillion(damage: number, battles: number): number {
  if (damage <= 0 || battles <= 0) return 0
  return Math.round(damage / battles / 1e6)
}

export function mergeOcrPlayers(rows: OcrPlayerRow[]): OcrPlayerRow[] {
  const map = new Map<string, OcrPlayerRow>()

  for (const row of rows) {
    const key = row.playerName.trim().toLowerCase()
    if (!key) continue

    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        playerName: row.playerName.trim(),
        stats: { ...row.stats }
      })
      continue
    }

    for (const [field, stat] of Object.entries(row.stats) as [BossField, { damage: number; battles: number }][]) {
      const prev = existing.stats[field]
      if (!prev || stat.damage > prev.damage) {
        existing.stats[field] = { ...stat }
      }
    }
  }

  return [...map.values()]
}

function rankPlayersForBoss(players: OcrPlayerRow[], field: BossField) {
  return players
    .map(p => ({
      name: p.playerName,
      damage: p.stats[field]?.damage ?? 0,
      battles: p.stats[field]?.battles ?? 0
    }))
    .filter(p => p.damage > 0)
    .sort((a, b) => b.damage - a.damage)
    .slice(0, MAX_GUILD_SIZE)
}

function emptyRow(width: number): string[] {
  return Array(width).fill('')
}

/** Build A1:AA32 grid matching the guild spreadsheet layout consumed by fetch-sheets-data. */
export function buildSeasonSheetGrid(seasonId: string, players: OcrPlayerRow[]): string[][] {
  const parsed = parseSeasonId(seasonId)
  if (!parsed) {
    throw new Error(`Invalid season id: ${seasonId}`)
  }

  const activeFields = new Set(getActiveBossFields(parsed.flight, parsed.season))
  const merged = mergeOcrPlayers(players)

  const width = 27
  const grid: string[][] = []

  const row1 = emptyRow(width)
  for (const { field, startCol } of BOSS_BLOCKS) {
    row1[startCol + 1] = BOSS_LABELS[field]
  }
  grid.push(row1)

  const row2 = emptyRow(width)
  const subHeaders = ['Rank/Status', 'Members', 'Damage', '', 'Battles Done', 'avg DMG/Ticket']
  for (const { startCol } of BOSS_BLOCKS) {
    subHeaders.forEach((label, i) => {
      row2[startCol + i] = label
    })
  }
  grid.push(row2)

  const rankings: Record<BossField, ReturnType<typeof rankPlayersForBoss>> = {
    redVelvetDragon: rankPlayersForBoss(merged, 'redVelvetDragon'),
    avatarOfDestiny: rankPlayersForBoss(merged, 'avatarOfDestiny'),
    livingAbyss: rankPlayersForBoss(merged, 'livingAbyss'),
    machineGod: rankPlayersForBoss(merged, 'machineGod')
  }

  const maxRows = Math.max(
    ...BOSS_BLOCKS.map(b => rankings[b.field].length),
    0
  )

  for (let i = 0; i < MAX_GUILD_SIZE; i++) {
    const row = emptyRow(width)
    for (const { field, startCol } of BOSS_BLOCKS) {
      const entry = rankings[field][i]
      if (!entry) continue

      const battles = entry.battles
      const damage = entry.damage
      const isActive = activeFields.has(field)

      row[startCol] = String(i + 1)
      row[startCol + 1] = entry.name
      row[startCol + 2] = isActive ? damageToBillionCell(damage) : ''
      row[startCol + 4] = isActive && damage > 0 ? String(battles) : isActive ? '0' : '9'
      row[startCol + 5] = isActive && damage > 0 ? String(avgDamagePerTicketMillion(damage, battles)) : '0'
    }
    grid.push(row)
  }

  // Pad to row 32 with footer placeholders (officers can edit REQ/GOAL later)
  while (grid.length < 31) {
    grid.push(emptyRow(width))
  }

  const footer = emptyRow(width)
  footer[0] = 'DMG REQ: — | DMG GOAL: — | Min Tickets: 9'
  footer[7] = 'DMG REQ: — | DMG GOAL: — | Min Tickets: 9'
  footer[14] = 'DMG REQ: — | DMG GOAL: — | Min Tickets: 9'
  footer[21] = 'DMG REQ: — | DMG GOAL: — | Min Tickets: 9'
  grid.push(footer)

  if (maxRows === 0) {
    grid[0][0] = grid[0][0] || 'OCR import — no damage rows detected'
  }

  return grid
}
