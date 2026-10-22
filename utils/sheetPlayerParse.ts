import type { BossField } from './guildBattleBosses'
import { getActiveBossFields } from './seasonConfig'

export const SHEET_MAX_GUILD_SIZE = 30

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

export function parseDamageCell(value: unknown): number {
  const text = (value ?? '').toString().replace(/,/g, '').replace(' Billion', '').trim()
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

export function isRankedMemberRow(row: unknown[]): boolean {
  if (!row || row.length === 0) return false
  const firstCell = row[0]?.toString() ?? ''
  if (
    firstCell.includes('DAMAGE REQ') ||
    firstCell.includes('DAMAGE GOAL') ||
    firstCell.includes('Min Tickets')
  ) {
    return false
  }
  return SHEET_BOSS_SLICES.some(({ rankCol, nameCol, damageCol }) => {
    const rank = parseInt(row[rankCol]?.toString().trim(), 10)
    const hasRank =
      Number.isInteger(rank) && rank >= 1 && rank <= SHEET_MAX_GUILD_SIZE + 2
    const hasMember =
      !!normalizeSheetPlayerName(row[nameCol]) || parseDamageCell(row[damageCol]) > 0
    return hasRank && hasMember
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
  options?: { flight?: number; season?: number }
): ParsedSheetPlayer[] {
  const activeFields =
    options?.flight != null && options?.season != null
      ? new Set(getActiveBossFields(options.flight, options.season))
      : null

  const slices = activeFields
    ? SHEET_BOSS_SLICES.filter(s => activeFields.has(s.field))
    : SHEET_BOSS_SLICES

  const dataRows = rows.slice(2)
  const playerRows = dataRows.filter(isRankedMemberRow)
  const playerMap = new Map<string, ParsedSheetPlayer>()

  for (const row of playerRows) {
    if (row.length < 20) continue

    for (const slice of slices) {
      const name = normalizeSheetPlayerName(row[slice.nameCol])
      if (!name) continue

      const damage = parseDamageCell(row[slice.damageCol])
      const battlesRaw = parseInt(row[slice.battlesCol]?.toString() ?? '', 10) || 0
      const battles = damage > 0 ? battlesRaw : 0
      const avg = parseInt(row[slice.avgCol]?.toString() ?? '', 10) || 0
      if (damage <= 0 && battles <= 0) continue

      const key = sheetPlayerKey(name)
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
      } else if (name.length > player.playerName.length) {
        player.playerName = name
      }

      const field = slice.field
      player[field] = mergeBossStat(player[field], {
        damage,
        battles,
        avgDamagePerTicket: avg
      })
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
