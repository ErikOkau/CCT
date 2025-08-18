import { ref, reactive } from 'vue'
import type { BattlePlayer, BattleStats, FileValidationResult, UploadState, DatabaseFormData } from '~/types/battle'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'
import { DatabaseService } from '~/utils/databaseService'

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

  // Load saved data from database
  const loadSavedData = async () => {
    try {
      const analysis = await DatabaseService.getLatestBattleAnalysis(
        databaseForm.seasonName,
        databaseForm.guildName
      )
      
      if (analysis && analysis.playerData) {
        const playerData = analysis.playerData as BattlePlayer[]
        analysisState.battleData = playerData
        analysisState.battleStats = {
          totalPlayers: analysis.totalPlayers,
          highestDamage: Number(analysis.highestDamage),
          averageDamage: Number(analysis.averageDamage),
          totalBattlesDone: analysis.totalBattlesDone,
          topPerformers: playerData.slice(0, 5),
          guildScore: analysis.guildScore,
          redVelvetStats: analysis.redVelvetStats as any,
          avatarStats: analysis.avatarStats as any,
          livingAbyssStats: analysis.livingAbyssStats as any
        }
        analysisState.insights = analysis.insights || []
        analysisState.previewData = playerData.slice(0, 5)
        analysisState.analysisComplete = true
        sheetsState.fetchSuccess = true
        
        console.log('✅ Loaded saved data from database')
      }
    } catch (error) {
      console.error('❌ Error loading saved data:', error)
    }
  }

  // Save data to database (universal for all users)
  const saveDataToDatabase = async () => {
    if (!analysisState.battleData.length || !analysisState.battleStats) {
      console.error('No data to save')
      return
    }

    try {
      await DatabaseService.storeBattleAnalysis(
        databaseForm.seasonName,
        databaseForm.guildName,
        analysisState.battleData,
        analysisState.battleStats
      )
      console.log('💾 Saved data to database')
    } catch (error) {
      console.error('❌ Error saving data to database:', error)
      throw error
    }
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
    if (!analysisState.battleData.length || !analysisState.battleStats) {
      alert('Please fetch battle results first')
      return
    }

    if (!databaseForm.seasonName.trim() || !databaseForm.guildName.trim()) {
      alert('Please enter both season name and guild name')
      return
    }

    databaseForm.isSavingToDatabase = true
    databaseForm.saveSuccess = false
    databaseForm.saveError = ''

    try {
      const result = await DatabaseService.storeBattleResults(
        databaseForm.seasonName.trim(),
        databaseForm.guildName.trim(),
        analysisState.battleData,
        analysisState.battleStats
      )
      
      databaseForm.saveSuccess = true
      console.log('Saved to database:', result)
    } catch (error) {
      databaseForm.saveError = error instanceof Error ? error.message : 'Failed to save to database'
      console.error('Database save error:', error)
    } finally {
      databaseForm.isSavingToDatabase = false
    }
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
