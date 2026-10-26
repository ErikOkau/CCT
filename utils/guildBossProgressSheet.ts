import type { BossField } from './guildBattleBosses'

export type BossProgressStatus = 'active' | 'next' | 'inactive'

export type BossProgressRow = {
  bossKey: BossField
  name: string
  level: number | null
  hpPercent: number | null
  totalDamage: number | null
  status: BossProgressStatus
  roundStartLevel: number | null
  image: string
  /** Filled when merged with season tab sums */
  sheetDamage?: number | null
  /** In-game hub total from Guild Progress tab (if different from sheet) */
  hubDamage?: number | null
}

export type GuildBossProgress = {
  flight: number | null
  season: number | null
  round: number | null
  guildTrophies: number | null
  guildRank: number | null
  roundTrophyBaseline: number | null
  updatedLabel: string | null
  bosses: BossProgressRow[]
}

const BOSS_IMAGES: Record<BossField, string> = {
  avatarOfDestiny: '/img/Avatar_of_destiny_guild_battle_ready.webp',
  livingAbyss: '/img/Living_Licorice_Abyss.webp',
  machineGod: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp',
  redVelvetDragon: '/img/Red_Velvet_Dragon.webp'
}

const NAME_TO_FIELD: Record<string, BossField> = {
  'avatar of destiny': 'avatarOfDestiny',
  aod: 'avatarOfDestiny',
  'living abyss': 'livingAbyss',
  la: 'livingAbyss',
  'machine-god of the eternal void': 'machineGod',
  'machine-god': 'machineGod',
  machinegod: 'machineGod',
  mg: 'machineGod',
  mgev: 'machineGod',
  'red velvet dragon': 'redVelvetDragon',
  rvd: 'redVelvetDragon'
}

function parseNum(raw: string | undefined): number | null {
  if (raw == null) return null
  const cleaned = String(raw).replace(/,/g, '').replace(/%/g, '').trim()
  if (!cleaned || cleaned === '—' || cleaned === '-') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function parseStatus(raw: string | undefined): BossProgressStatus {
  const s = (raw || 'active').trim().toLowerCase()
  if (s.startsWith('next')) return 'next'
  if (s.startsWith('inact') || s === 'off') return 'inactive'
  return 'active'
}

function metaKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_')
}

function bossFieldFromName(name: string): BossField | null {
  const key = name.trim().toLowerCase()
  return NAME_TO_FIELD[key] ?? null
}

const DISPLAY_NAMES: Record<BossField, string> = {
  avatarOfDestiny: 'Avatar of Destiny',
  livingAbyss: 'Living Abyss',
  machineGod: 'Machine-God of the Eternal Void',
  redVelvetDragon: 'Red Velvet Dragon'
}

/**
 * Expected Google Sheet tab **Guild Progress** (officers paste from the in-game Guild Battle hub):
 *
 * | A (key/boss) | B | C | D | E |
 * | flight | 36 | | | |
 * | season | 1 | | | |
 * | round | 1 | | | |
 * | guild_trophies | 31184640 | | | |
 * | guild_rank | 107 | | | |
 * | round_trophy_baseline | 30500000 | optional | | |
 * | updated | 2026-10-22 | optional | | |
 * | Boss | Level | HP % | Total DMG | Status |
 * | Avatar of Destiny | 219 | 15 | 730726572935 | active |
 */
export function parseGuildBossProgressRows(values: string[][] | null | undefined): GuildBossProgress | null {
  if (!values?.length) return null

  const progress: GuildBossProgress = {
    flight: null,
    season: null,
    round: null,
    guildTrophies: null,
    guildRank: null,
    roundTrophyBaseline: null,
    updatedLabel: null,
    bosses: []
  }

  let headerRow = -1
  for (let i = 0; i < values.length; i++) {
    const row = values[i] || []
    const a = (row[0] || '').trim()
    const b = row[1]
    const key = metaKey(a)

    if (key === 'boss' && (row[1] || '').toLowerCase().includes('level')) {
      headerRow = i
      continue
    }

    if (['flight', 'season', 'round', 'guild_trophies', 'guild_rank', 'round_trophy_baseline', 'updated'].includes(key)) {
      if (key === 'flight') progress.flight = parseNum(b)
      else if (key === 'season') progress.season = parseNum(b)
      else if (key === 'round') progress.round = parseNum(b)
      else if (key === 'guild_trophies') progress.guildTrophies = parseNum(b)
      else if (key === 'guild_rank') progress.guildRank = parseNum(b)
      else if (key === 'round_trophy_baseline') progress.roundTrophyBaseline = parseNum(b)
      else if (key === 'updated') progress.updatedLabel = String(b || '').trim() || null
      continue
    }

    const field = bossFieldFromName(a)
    if (field) {
      const level = parseNum(row[1])
      const hp = parseNum(row[2])
      const dmg = parseNum(row[3])
      const status = parseStatus(row[4])
      const roundStart = parseNum(row[5])
      progress.bosses.push({
        bossKey: field,
        name: DISPLAY_NAMES[field],
        level,
        hpPercent: hp,
        totalDamage: dmg,
        status,
        roundStartLevel: roundStart,
        image: BOSS_IMAGES[field]
      })
    }
  }

  if (headerRow >= 0) {
    for (let i = headerRow + 1; i < values.length; i++) {
      const row = values[i] || []
      const nameCell = (row[0] || '').trim()
      if (!nameCell) continue
      const field = bossFieldFromName(nameCell)
      if (!field) continue
      if (progress.bosses.some(b => b.bossKey === field)) continue
      progress.bosses.push({
        bossKey: field,
        name: DISPLAY_NAMES[field],
        level: parseNum(row[1]),
        hpPercent: parseNum(row[2]),
        totalDamage: parseNum(row[3]),
        status: parseStatus(row[4]),
        roundStartLevel: parseNum(row[5]),
        image: BOSS_IMAGES[field]
      })
    }
  }

  const hasMeta =
    progress.flight != null ||
    progress.guildTrophies != null ||
    progress.bosses.length > 0

  return hasMeta ? progress : null
}

export const GUILD_PROGRESS_SHEET_RANGE = 'Guild Progress!A1:F24'
