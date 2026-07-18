import type { BattlePlayer } from '~/types/battle'

export const SPREADSHEET_ID = '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs'

const BOSSES = {
  rvd: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
  aod: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
  la: { name: 'Living Abyss', image: '/img/Living_Licorice_Abyss.webp' },
  mg: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
} as const

type BossSlot = (typeof BOSSES)[keyof typeof BOSSES] | null
type SeasonBossGrid = Record<1 | 2 | 3, BossSlot>
type FlightBossSchedule = Record<number, SeasonBossGrid>

const SCHEDULE_3: FlightBossSchedule = {
  1: { 1: null, 2: BOSSES.aod, 3: BOSSES.mg },
  2: { 1: BOSSES.rvd, 2: null, 3: BOSSES.mg },
  3: { 1: BOSSES.rvd, 2: BOSSES.aod, 3: null }
}

const SCHEDULE_4: FlightBossSchedule = {
  1: { 1: BOSSES.rvd, 2: BOSSES.aod, 3: null },
  2: { 1: null, 2: BOSSES.aod, 3: BOSSES.mg },
  3: { 1: BOSSES.rvd, 2: null, 3: BOSSES.mg },
  4: { 1: BOSSES.rvd, 2: BOSSES.aod, 3: null }
}

export const FLIGHT_SEASONS: Record<number, number[]> = {
  20: [1, 2, 3],
  21: [1, 2, 3, 4],
  23: [1, 2, 3, 4],
  24: [1, 2, 3],
  25: [2, 3, 4],
  26: [1, 2, 3],
  27: [1, 2, 3],
  28: [1, 2, 3, 4],
  29: [1],
  30: [1, 2, 3, 4],
  31: [1, 2, 3]
}

const THREE_SEASON_FLIGHTS = new Set([24, 26, 27, 29, 31])
const FOUR_SEASON_FLIGHTS = new Set([21, 23, 25, 28, 30])

export const bossSchedules: Record<number, FlightBossSchedule> = {
  20: {
    1: { 1: BOSSES.rvd, 2: null, 3: BOSSES.la },
    2: { 1: BOSSES.rvd, 2: BOSSES.aod, 3: null },
    3: { 1: null, 2: BOSSES.aod, 3: BOSSES.la }
  },
  21: SCHEDULE_4,
  23: SCHEDULE_4,
  24: SCHEDULE_3,
  25: SCHEDULE_4,
  26: SCHEDULE_3,
  27: SCHEDULE_3,
  28: SCHEDULE_4,
  29: { 1: SCHEDULE_3[1] },
  30: SCHEDULE_4,
  31: SCHEDULE_3
}

export const ALL_SEASON_IDS = [
  '17-1', '17-2', '17-3', '17-4', '18-1',
  '20-1', '20-2', '20-3',
  '21-1', '21-2', '21-3', '21-4',
  '23-1', '23-2', '23-3', '23-4',
  '24-1', '24-2', '24-3',
  '25-2', '25-3', '25-4',
  '26-1', '26-2', '26-3',
  '27-1', '27-2', '27-3',
  '28-1', '28-2', '28-3', '28-4',
  '29-1',
  '30-1', '30-2', '30-3', '30-4',
  '31-1', '31-2', '31-3'
]

export const allSeasons = ALL_SEASON_IDS.map(id => ({
  id,
  name: `Season ${id}`,
  hasData: true
}))

export type BossField = 'redVelvetDragon' | 'avatarOfDestiny' | 'livingAbyss' | 'machineGod'

const BOSS_FIELD_BY_SLOT: Record<1 | 2 | 3, BossField[]> = {
  1: ['redVelvetDragon'],
  2: ['avatarOfDestiny'],
  3: ['livingAbyss', 'machineGod']
}

export function getAvailableFlights(): number[] {
  return Object.keys(bossSchedules).map(Number).sort((a, b) => a - b)
}

export function getFlightSeasons(flight: number): number[] {
  return FLIGHT_SEASONS[flight] ?? Object.keys(bossSchedules[flight] ?? {}).map(Number).sort((a, b) => a - b)
}

export function getLatestFlightAndSeason(): { flight: number; season: number } {
  const flights = getAvailableFlights()
  const flight = flights[flights.length - 1]
  const seasons = getFlightSeasons(flight)
  return { flight, season: seasons[seasons.length - 1] }
}

export function usesMachineGodFlight(flight: number): boolean {
  return flight !== 20
}

export function hasSeasonData(flight: number, season: number): boolean {
  return getFlightSeasons(flight).includes(season)
}

export function getSeasonDisplayName(flight: number, season: number): string {
  if (flight === 20) return `20-${season}`
  return `${flight}-${season}`
}

export function getSeasonSheetRange(flight: number, season: number): string {
  return `${flight}-${season}!A1:Z100`
}

export function parseSeasonId(seasonId: string): { flight: number; season: number } | null {
  const parts = seasonId.split('-')
  if (parts.length !== 2) return null

  const flight = parseInt(parts[0], 10)
  const season = parseInt(parts[1], 10)
  if (Number.isNaN(flight) || Number.isNaN(season)) return null

  return { flight, season }
}

export function getSeasonSpreadsheetConfig(flight: number, season: number) {
  if (!hasSeasonData(flight, season)) {
    return null
  }

  return {
    hasData: true,
    spreadsheetId: SPREADSHEET_ID,
    range: getSeasonSheetRange(flight, season)
  }
}

export function getBossForSeason(flight: number, season: number, position: number) {
  const flightSchedule = bossSchedules[flight]
  if (!flightSchedule) return null

  const seasonSchedule = flightSchedule[season]
  if (!seasonSchedule) return null

  return seasonSchedule[position as 1 | 2 | 3] ?? null
}

export function isBossActiveInSeason(bossName: string, flight: number, season: number): boolean {
  for (let position = 1; position <= 3; position++) {
    const boss = getBossForSeason(flight, season, position)
    if (boss?.name === bossName) {
      return true
    }
  }
  return false
}

export function getActiveBossFields(flight: number, season: number): BossField[] {
  const fields: BossField[] = []

  for (let position = 1; position <= 3; position++) {
    const boss = getBossForSeason(flight, season, position)
    if (!boss) continue

    for (const field of BOSS_FIELD_BY_SLOT[position as 1 | 2 | 3]) {
      if (field === 'livingAbyss' && boss.name === BOSSES.la.name) {
        fields.push(field)
      } else if (field === 'machineGod' && boss.name === BOSSES.mg.name) {
        fields.push(field)
      } else if (field === 'redVelvetDragon' && boss.name === BOSSES.rvd.name) {
        fields.push(field)
      } else if (field === 'avatarOfDestiny' && boss.name === BOSSES.aod.name) {
        fields.push(field)
      }
    }
  }

  if (fields.length > 0) {
    return fields
  }

  if (flight === 20) {
    if (season === 1) return ['redVelvetDragon', 'livingAbyss']
    if (season === 2) return ['redVelvetDragon', 'avatarOfDestiny']
    if (season === 3) return ['avatarOfDestiny', 'livingAbyss']
  }

  if (THREE_SEASON_FLIGHTS.has(flight)) {
    return getActiveBossFieldsFromGrid(SCHEDULE_3[season])
  }

  if (FOUR_SEASON_FLIGHTS.has(flight)) {
    return getActiveBossFieldsFromGrid(SCHEDULE_4[season])
  }

  return ['avatarOfDestiny', 'livingAbyss']
}

function getActiveBossFieldsFromGrid(grid?: SeasonBossGrid): BossField[] {
  if (!grid) return ['avatarOfDestiny', 'livingAbyss']

  const fields: BossField[] = []
  for (let position = 1; position <= 3; position++) {
    const boss = grid[position as 1 | 2 | 3]
    if (!boss) continue

    if (boss.name === BOSSES.rvd.name) fields.push('redVelvetDragon')
    if (boss.name === BOSSES.aod.name) fields.push('avatarOfDestiny')
    if (boss.name === BOSSES.la.name) fields.push('livingAbyss')
    if (boss.name === BOSSES.mg.name) fields.push('machineGod')
  }

  return fields.length > 0 ? fields : ['avatarOfDestiny', 'livingAbyss']
}

function getBossValue(player: BattlePlayer, field: BossField, key: 'battles' | 'damage'): number {
  const value = player[field]?.[key]
  return typeof value === 'number' ? value : 0
}

export function getThirdBossField(flight: number, season: number): BossField {
  const slot3Boss = getBossForSeason(flight, season, 3)
  if (slot3Boss?.name === BOSSES.mg.name) return 'machineGod'
  if (slot3Boss?.name === BOSSES.la.name) return 'livingAbyss'
  return usesMachineGodFlight(flight) ? 'machineGod' : 'livingAbyss'
}

export function getThirdBossDisplayName(flight: number, season: number): string {
  const slot3Boss = getBossForSeason(flight, season, 3)
  if (slot3Boss) return slot3Boss.name
  return usesMachineGodFlight(flight) ? BOSSES.mg.name : BOSSES.la.name
}

export function getThirdBossImage(flight: number, season: number): string {
  const slot3Boss = getBossForSeason(flight, season, 3)
  if (slot3Boss) return slot3Boss.image
  return usesMachineGodFlight(flight) ? BOSSES.mg.image : BOSSES.la.image
}

export function getPlayerBossStat(
  player: BattlePlayer,
  field: BossField,
  key: 'battles' | 'damage'
): number {
  return getBossValue(player, field, key)
}

export function getPlayerThirdBossStat(
  player: BattlePlayer,
  flight: number,
  season: number,
  key: 'battles' | 'damage'
): number {
  return getBossValue(player, getThirdBossField(flight, season), key)
}

export function isLatestSeason(flight: number, season: number): boolean {
  const latest = getLatestFlightAndSeason()
  return flight === latest.flight && season === latest.season
}

export function getPlayerTickets(player: BattlePlayer, flight: number, season: number): number {
  return getActiveBossFields(flight, season).reduce(
    (sum, field) => sum + getBossValue(player, field, 'battles'),
    0
  )
}

export function getPlayerTotalDamage(player: BattlePlayer, flight: number, season: number): number {
  return getActiveBossFields(flight, season).reduce(
    (sum, field) => sum + getBossValue(player, field, 'damage'),
    0
  )
}

export function getPlayerTotalBattles(player: BattlePlayer, flight: number, season: number): number {
  return getPlayerTickets(player, flight, season)
}

export function getPlayerTotalDamageBySeasonId(player: BattlePlayer, seasonId: string): number {
  const parsed = parseSeasonId(seasonId)
  if (!parsed) {
    return player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage + (player.machineGod?.damage || 0)
  }

  return getPlayerTotalDamage(player, parsed.flight, parsed.season)
}

export function getPlayerTotalBattlesBySeasonId(player: BattlePlayer, seasonId: string): number {
  const parsed = parseSeasonId(seasonId)
  if (!parsed) {
    return player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles + (player.machineGod?.battles || 0)
  }

  return getPlayerTotalBattles(player, parsed.flight, parsed.season)
}

export function getTicketStats(players: BattlePlayer[], flight: number, season: number) {
  const MIN_REQUIRED_TICKETS = 15
  const activeFields = getActiveBossFields(flight, season)

  const totalTicketsUsed = players.reduce((sum, player) => sum + getPlayerTickets(player, flight, season), 0)
  const playersBelowMinimum = players.filter(player => getPlayerTickets(player, flight, season) < MIN_REQUIRED_TICKETS).length

  return {
    totalTicketsUsed,
    playersBelowMinimum,
    ticketsUsedByBoss: {
      redVelvet: activeFields.includes('redVelvetDragon')
        ? players.reduce((sum, player) => sum + player.redVelvetDragon.battles, 0)
        : 0,
      avatar: activeFields.includes('avatarOfDestiny')
        ? players.reduce((sum, player) => sum + player.avatarOfDestiny.battles, 0)
        : 0,
      livingAbyss: activeFields.includes('livingAbyss')
        ? players.reduce((sum, player) => sum + player.livingAbyss.battles, 0)
        : 0,
      machineGod: activeFields.includes('machineGod')
        ? players.reduce((sum, player) => sum + (player.machineGod?.battles || 0), 0)
        : 0
    }
  }
}
