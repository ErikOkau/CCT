import { ref, reactive } from 'vue'
import type { BattlePlayer, BattleStats, FileValidationResult, UploadState, DatabaseFormData } from '~/types/battle'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'
import { DatabaseService } from '~/utils/databaseService'

export const useBattleAnalysis = () => {
  // Upload state
  const uploadState = reactive<UploadState>({
    isDragging: false,
    uploadedFiles: [],
    isAnalyzing: false,
    analysisComplete: false,
    filesSelected: false,
    battleData: [],
    battleStats: null,
    insights: [],
    previewData: []
  })

  // Database form state
  const databaseForm = reactive<DatabaseFormData>({
    seasonName: '20-2',
    guildName: 'Chaos Control Team',
    isSavingToDatabase: false,
    saveSuccess: false,
    saveError: ''
  })

  // File handling functions
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    uploadState.isDragging = true
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    uploadState.isDragging = false
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    uploadState.isDragging = false

    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      handleFilesUpload(files)
    }
  }

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const files = Array.from(target.files)
      handleFilesUpload(files)
    }
  }

  const handleFilesUpload = (files: File[]) => {
    // Validate files using the utility function
    const validation = BattleAnalyzer.validateImageFiles(files)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    uploadState.uploadedFiles = files
    uploadState.filesSelected = true
  }

  const analyzeBattleResult = async () => {
    if (uploadState.uploadedFiles.length === 0) return

    uploadState.isAnalyzing = true

    try {
      // Use the BattleAnalyzer to process the images
      uploadState.battleData = await BattleAnalyzer.analyzeScreenshots(uploadState.uploadedFiles)
      uploadState.battleStats = BattleAnalyzer.calculateStats(uploadState.battleData)
      uploadState.insights = BattleAnalyzer.generateInsights(uploadState.battleData)
      uploadState.previewData = uploadState.battleData.slice(0, 5) // Show first 5 for preview
      uploadState.analysisComplete = true
    } catch (error) {
      alert('Error analyzing images. Please try again.')
      console.error('Analysis error:', error)
    } finally {
      uploadState.isAnalyzing = false
    }
  }

  const resetAnalysis = () => {
    uploadState.uploadedFiles = []
    uploadState.isAnalyzing = false
    uploadState.analysisComplete = false
    uploadState.filesSelected = false
    uploadState.battleData = []
    uploadState.battleStats = null
    uploadState.insights = []
    uploadState.previewData = []
    databaseForm.saveSuccess = false
    databaseForm.saveError = ''
  }

  const saveToDatabase = async () => {
    if (!uploadState.battleData.length || !uploadState.battleStats) {
      alert('Please analyze battle results first')
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
        uploadState.battleData,
        uploadState.battleStats
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
    uploadState,
    databaseForm,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    analyzeBattleResult,
    resetAnalysis,
    saveToDatabase
  }
}
