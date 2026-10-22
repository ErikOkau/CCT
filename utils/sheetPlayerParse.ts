import type { BossField } from './guildBattleBosses'
import { matchBossFieldFromHeader } from './guildBattleBosses'
import { playerNamesSimilar } from './guildBattlePlayerMerge'

export const SHEET_MAX_GUILD_SIZE = 30
/** Width of guild sheet grid (A through AA). Rows from the API may be shorter. */
export const SHEET_PARSE_WIDTH = 27

const NON_PLAYER_NAME_PATTERN =
  /^(damage\s*(req|goal)?|min\s*tickets?|total|average|avg|leader|guild\s*leader|member|officer|#|rank)$/i

export interface SheetBossSlice {
  field: BossField
  rankCol: number
  nameCol: number
  damageCol: number
  battlesCol: number
  avgCol: number
}

export const SHEET_BOSS_SLICES: SheetBossSlice[] = [
  {
    field: 'redVelvetDragon',
    rankCol: 0,
    nameCol: 1,
    damageCol: 2,
    battlesCol: 4,
    avgCol: 5
  },
  {
    field: 'avatarOfDestiny',
    rankCol: 7,
    nameCol: 8,
    damageCol: 9,
    battlesCol: 11,
    avgCol: 12
  },
  {
    field: 'livingAbyss',
    rankCol: 14,
    nameCol: 15,
    damageCol: 16,
    battlesCol: 18,
    avgCol: 19
  },
  {
    field: 'machineGod',
    rankCol: 21,
    nameCol: 22,
    damageCol: 23,
    battlesCol: 25,
    avgCol: 26
  }
]

export function parseDamageCell(value: unknown, nextCell?: unknown): number {
  let text = (value ?? '').toString().replace(/,/g, '').trim()
  const next = (nextCell ?? '').toString().trim()
  if (text && /^billion$/i.test(next) && !/billion/i.test(text)) {
    text = `${text} Billion`
  }
  text = text.replace(/\s*Billion\s*/i, '').trim()
  if (!text) return 0
  const parsed = parseFloat(text)
  return Number.isFinite(parsed) ? parsed * 1_000_000_000 : 0
}

export function normalizeSheetPlayerName(value: unknown): string | null {
  if (value == null) return null
  let name = value
    .toString()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
  if (!name) return null
  if (/^\d+(\.\d+)?$/.test(name)) return null
  if (NON_PLAYER_NAME_PATTERN.test(name)) return null
  name = name.replace(/\s*(?:\(?(?:leader|officer|member)\)?)\s*$/i, '').trim()
  if (!name || NON_PLAYER_NAME_PATTERN.test(name)) return null
  return name
}

export function sheetPlayerKey(name: string): string {
  return normalizeSheetPlayerName(name)?.toLowerCase() ?? name.trim().toLowerCase()
}

function pickDisplayName(existing: string, incoming: string): string {
  const a = existing.trim()
  const b = incoming.trim()
  if (a.length !== b.length) return a.length > b.length ? a : b
  return a
}

/** Match LA/MG rows when the sheet has the same player under a slightly different name. */
function resolvePlayerMapKey(
  playerMap: Map<string, ParsedSheetPlayer>,
  name: string
): string {
  const key = sheetPlayerKey(name)
  if (playerMap.has(key)) return key
  for (const player of playerMap.values()) {
    if (playerNamesSimilar(player.playerName, name)) {
      return sheetPlayerKey(player.playerName)
    }
  }
  return key
}

function emptyBossStats() {
  return { damage: 0, battles: 0, avgDamagePerTicket: 0 }
}

function mergeBossStat(
  existing: { damage: number; battles: number; avgDamagePerTicket: number },
  incoming: { damage: number; battles: number; avgDamagePerTicket: number }
) {
  if (incoming.damage > existing.damage) {
    return { ...incoming }
  }
  if (incoming.damage === existing.damage && incoming.battles > existing.battles) {
    return { ...incoming }
  }
  return existing
}

export function isSheetFooterRow(row: unknown[]): boolean {
  if (!row || row.length === 0) return false
  const firstCell = row[0]?.toString() ?? ''
  return (
    firstCell.includes('DAMAGE REQ') ||
    firstCell.includes('DAMAGE GOAL') ||
    firstCell.includes('Min Tickets')
  )
}

/** Boss names from sheet row 1 (each block’s “Members” header sits under the boss title). */
export function detectActiveBossFieldsFromSheetHeader(rows: unknown[][]): BossField[] {
  const header = rows[0] ?? []
  const found: BossField[] = []
  for (const slice of SHEET_BOSS_SLICES) {
    const titleCell = (header[slice.nameCol] ?? header[slice.rankCol + 1] ?? '')
      .toString()
      .trim()
    if (!titleCell) continue
    const field = matchBossFieldFromHeader(titleCell)
    if (field && !found.includes(field)) found.push(field)
  }
  return found
}

function normalizeSheetRow(row: unknown[]): unknown[] {
  if (!row?.length) return Array(SHEET_PARSE_WIDTH).fill('')
  if (row.length >= SHEET_PARSE_WIDTH) return row
  return [...row, ...Array(SHEET_PARSE_WIDTH - row.length).fill('')]
}

function rankInSliceValid(row: unknown[], slice: SheetBossSlice): boolean {
  const rankRaw = row[slice.rankCol]?.toString().trim() ?? ''
  if (!rankRaw) return true
  const rank = parseInt(rankRaw, 10)
  if (!Number.isInteger(rank)) return true
  return rank >= 1 && rank <= SHEET_MAX_GUILD_SIZE
}

function ingestSliceCell(
  playerMap: Map<string, ParsedSheetPlayer>,
  slice: SheetBossSlice,
  row: unknown[]
) {
  row = normalizeSheetRow(row)
  if (!rankInSliceValid(row, slice)) return

  const name = normalizeSheetPlayerName(row[slice.nameCol])
  if (!name) return

  const damage = parseDamageCell(row[slice.damageCol], row[slice.damageCol + 1])
  const battlesRaw = parseInt(row[slice.battlesCol]?.toString() ?? '', 10) || 0
  const battles = damage > 0 ? battlesRaw : 0
  const avg = parseInt(row[slice.avgCol]?.toString() ?? '', 10) || 0
  if (damage <= 0 && battles <= 0) return

  const key = resolvePlayerMapKey(playerMap, name)
  let player = playerMap.get(key)
  if (!player) {
    player = {
      playerName: name,
      redVelvetDragon: emptyBossStats(),
      avatarOfDestiny: emptyBossStats(),
      livingAbyss: emptyBossStats(),
      machineGod: emptyBossStats()
    }
    playerMap.set(key, player)
  } else if (!playerNamesSimilar(player.playerName, name)) {
    player.playerName = pickDisplayName(player.playerName, name)
  }

  player[slice.field] = mergeBossStat(player[slice.field], {
    damage,
    battles,
    avgDamagePerTicket: avg
  })
}

export interface ParsedSheetPlayer {
  playerName: string
  redVelvetDragon: ReturnType<typeof emptyBossStats>
  avatarOfDestiny: ReturnType<typeof emptyBossStats>
  livingAbyss: ReturnType<typeof emptyBossStats>
  machineGod: ReturnType<typeof emptyBossStats>
}

export function parseSpreadsheetRowsToPlayers(
  rows: unknown[][],
  _options?: { flight?: number; season?: number }
): ParsedSheetPlayer[] {
  // Always read every boss block; inactive bosses are cleared after fetch via zeroInactiveBossStats.
  const slices = SHEET_BOSS_SLICES

  const dataRows = rows.slice(2).filter(r => r && !isSheetFooterRow(r))
  const playerMap = new Map<string, ParsedSheetPlayer>()

  // Each boss column is its own damage ranking — the same player can appear on different rows.
  for (const slice of slices) {
    for (const row of dataRows) {
      ingestSliceCell(playerMap, slice, row)
    }
  }

  const players = [...playerMap.values()]
  players.sort((a, b) => {
    const total = (p: ParsedSheetPlayer) =>
      p.redVelvetDragon.damage +
      p.avatarOfDestiny.damage +
      p.livingAbyss.damage +
      p.machineGod.damage
    return total(b) - total(a)
  })

  return players.slice(0, SHEET_MAX_GUILD_SIZE)
}
