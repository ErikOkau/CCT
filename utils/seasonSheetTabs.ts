import { ALL_SEASON_IDS, parseSeasonId } from './seasonConfig'

/** Seasons with no spreadsheet tab (gap after 31-3 until 34-1, etc.). */
export function seasonHasSheetTab(flight: number, season: number): boolean {
  const id = `${flight}-${season}`
  if (!ALL_SEASON_IDS.includes(id)) {
    if (flight === 20) return season >= 1 && season <= 3
    return false
  }
  if (flight === 32) return false
  if (flight === 33) return false
  if (flight === 31 && season > 3) return false
  return true
}

export function seasonIdHasSheetTab(seasonId: string): boolean {
  const parsed = parseSeasonId(seasonId)
  if (!parsed) return false
  return seasonHasSheetTab(parsed.flight, parsed.season)
}

export function listSeasonIdsWithSheetTabs(): string[] {
  return ALL_SEASON_IDS.filter(id => {
    const p = parseSeasonId(id)
    return p ? seasonHasSheetTab(p.flight, p.season) : false
  })
}
