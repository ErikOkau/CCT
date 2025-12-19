import { ref, reactive } from 'vue'
import type { BattlePlayer, BattleStats, FileValidationResult, UploadState, DatabaseFormData } from '~/types/battle'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'

export const useBattleAnalysis = () => {
  // Analysis state
  const analysisState = reactive({
    battleData: [] as BattlePlayer[],
    battleStats: null as BattleStats | null,
    insights: [] as string[],
    previewData: [] as BattlePlayer[],
    analysisComplete: false
  })

  // Google Sheets state
  const sheetsState = reactive({
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-1!A1:Z100',
    isFetching: false,
    fetchError: '',
    fetchSuccess: false
  })

  // Database form state
  const databaseForm = reactive<DatabaseFormData>({
    seasonName: '20-2',
    guildName: 'Chaos Control Team',
    isSavingToDatabase: false,
    saveSuccess: false,
    saveError: ''
  })

  // Database functionality removed - using Google Sheets as primary data source

  const resetAnalysis = () => {
    analysisState.battleData = []
    analysisState.battleStats = null
    analysisState.insights = []
    analysisState.previewData = []
    analysisState.analysisComplete = false
    sheetsState.fetchSuccess = false
    sheetsState.fetchError = ''
    databaseForm.saveSuccess = false
    databaseForm.saveError = ''
    
    console.log('🗑️ Reset analysis state')
  }

  const fetchFromGoogleSheets = async (season: number = 1, destinysFlight: number = 20, rangeOverride?: string) => {
    if (!sheetsState.spreadsheetId) {
      sheetsState.fetchError = 'Please enter a Spreadsheet ID'
      return
    }

    sheetsState.isFetching = true
    sheetsState.fetchError = ''
    sheetsState.fetchSuccess = false

    // Use override range if provided, otherwise use sheetsState.range
    const rangeToUse = rangeOverride || sheetsState.range

    try {
      console.log(`🔍 useBattleAnalysis: Fetching from range: ${rangeToUse}`)
      console.log(`🔍 useBattleAnalysis: Season: ${season}, Flight: ${destinysFlight}`)
      const players = await BattleAnalyzer.fetchFromGoogleSheets(sheetsState.spreadsheetId, rangeToUse)
      
      if (players.length > 0) {
        console.log(`🔍 useBattleAnalysis: About to call calculateStats with season=${season}, destinysFlight=${destinysFlight}`)
        console.log(`🔍 useBattleAnalysis: Players received:`, players.length)
        console.log(`🔍 useBattleAnalysis: Sample player data:`, players.slice(0, 2).map(p => ({
          name: p.playerName,
          rvd: p.redVelvetDragon,
          aod: p.avatarOfDestiny,
          la: p.livingAbyss,
          mg: p.machineGod
        })))
        
        analysisState.battleData = players
        analysisState.battleStats = BattleAnalyzer.calculateStats(players, season, destinysFlight)
        analysisState.insights = BattleAnalyzer.generateInsights(players, season, destinysFlight)
        analysisState.previewData = players.slice(0, 5) // Show first 5 for preview
        analysisState.analysisComplete = true
        sheetsState.fetchSuccess = true
        
        // Data loaded successfully from Google Sheets
        
        console.log('Successfully fetched players from Google Sheets:', players)
      } else {
        sheetsState.fetchError = 'No players found in Google Sheets'
      }
    } catch (error) {
      sheetsState.fetchError = error instanceof Error ? error.message : 'Failed to fetch from Google Sheets'
      console.error('Google Sheets fetch error:', error)
    } finally {
      sheetsState.isFetching = false
    }
  }

  const saveToDatabase = async () => {
    console.log('📝 Database saving not available - using Google Sheets as data source')
    alert('Database saving not available - data is managed through Google Sheets')
  }

  return {
    analysisState,
    sheetsState,
    databaseForm,
    fetchFromGoogleSheets,
    resetAnalysis,
    saveToDatabase
  }
}
