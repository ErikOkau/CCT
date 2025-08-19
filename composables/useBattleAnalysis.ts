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

  // Load saved data from database (temporarily disabled for Supabase migration)
  const loadSavedData = async () => {
    // TODO: Implement Supabase data loading
    console.log('📝 Database loading temporarily disabled for Supabase migration')
  }

  // Save data to database (temporarily disabled for Supabase migration)
  const saveDataToDatabase = async () => {
    // TODO: Implement Supabase data saving
    console.log('📝 Database saving temporarily disabled for Supabase migration')
  }

  // Load saved data when composable is initialized
  loadSavedData()

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

  const fetchFromGoogleSheets = async () => {
    if (!sheetsState.spreadsheetId) {
      sheetsState.fetchError = 'Please enter a Spreadsheet ID'
      return
    }

    sheetsState.isFetching = true
    sheetsState.fetchError = ''
    sheetsState.fetchSuccess = false

    try {
      const players = await BattleAnalyzer.fetchFromGoogleSheets(sheetsState.spreadsheetId, sheetsState.range)
      
      if (players.length > 0) {
        analysisState.battleData = players
        analysisState.battleStats = BattleAnalyzer.calculateStats(players)
        analysisState.insights = BattleAnalyzer.generateInsights(players)
        analysisState.previewData = players.slice(0, 5) // Show first 5 for preview
        analysisState.analysisComplete = true
        sheetsState.fetchSuccess = true
        
        // Save to database automatically
        await saveDataToDatabase()
        
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
    // TODO: Implement Supabase data saving
    console.log('📝 Database saving temporarily disabled for Supabase migration')
    alert('Database saving is temporarily disabled during Supabase migration')
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
