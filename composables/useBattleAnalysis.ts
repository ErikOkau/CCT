import { reactive } from 'vue'
import type { BattlePlayer, BattleStats } from '~/types/battle'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'
import { getLatestFlightAndSeason, getSeasonSheetRange, SPREADSHEET_ID } from '~/utils/seasonConfig'

const latestSeason = getLatestFlightAndSeason()

export const useBattleAnalysis = () => {
  const analysisState = reactive({
    battleData: [] as BattlePlayer[],
    battleStats: null as BattleStats | null,
    insights: [] as string[],
    previewData: [] as BattlePlayer[],
    analysisComplete: false
  })

  const sheetsState = reactive({
    spreadsheetId: SPREADSHEET_ID,
    range: getSeasonSheetRange(latestSeason.flight, latestSeason.season),
    isFetching: false,
    fetchError: '',
    fetchSuccess: false
  })

  const resetAnalysis = () => {
    analysisState.battleData = []
    analysisState.battleStats = null
    analysisState.insights = []
    analysisState.previewData = []
    analysisState.analysisComplete = false
    sheetsState.fetchSuccess = false
    sheetsState.fetchError = ''
  }

  const fetchFromGoogleSheets = async (season?: number, flight?: number, range?: string) => {
    sheetsState.isFetching = true
    sheetsState.fetchError = ''
    sheetsState.fetchSuccess = false

    try {
      const spreadsheetId = sheetsState.spreadsheetId
      const fetchRange = range || sheetsState.range

      const seasonNum = season ?? latestSeason.season
      const flightNum = flight ?? latestSeason.flight

      const battlePlayers = await BattleAnalyzer.fetchFromGoogleSheets(
        spreadsheetId,
        fetchRange,
        flightNum,
        seasonNum
      )

      analysisState.battleData = battlePlayers
      analysisState.battleStats = BattleAnalyzer.calculateStats(battlePlayers, seasonNum, flightNum)
      analysisState.insights = BattleAnalyzer.generateInsights(battlePlayers, seasonNum, flightNum)
      analysisState.analysisComplete = true
      sheetsState.fetchSuccess = true
    } catch (error) {
      sheetsState.fetchError = error instanceof Error ? error.message : 'Failed to fetch from Google Sheets'
      console.error('Google Sheets fetch error:', error)
      analysisState.analysisComplete = false
    } finally {
      sheetsState.isFetching = false
    }
  }

  return {
    analysisState,
    sheetsState,
    fetchFromGoogleSheets,
    resetAnalysis
  }
}
