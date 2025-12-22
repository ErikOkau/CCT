<script setup lang="ts">
import { ref } from 'vue'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'
import type { BattlePlayer } from '~/types/battle'

// 13uDLh7GciSYBO_S4KpXvVY8JTQQlqAb2m_7DEAB-wYo
const spreadsheetId = ref('1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs')
const range = ref('20-1!A1:Z100') // Sheet 20-1 contains the guild battle data
const parsedPlayers = ref<BattlePlayer[]>([])
const error = ref('')
const processing = ref(false)
const processingMessage = ref('')

// Screenshot upload and ChatGPT integration
const uploadedImages = ref<Array<{ file: File; preview: string; id: string; processed: boolean; csvData?: string; error?: string }>>([])
const csvData = ref<string>('')
const isProcessingScreenshot = ref(false)
const screenshotError = ref('')
const sortBy = ref<'name' | 'date' | 'status'>('name')
const filterStatus = ref<'all' | 'processed' | 'unprocessed' | 'error'>('all')

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    Array.from(target.files).forEach(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedImages.value.push({
          file,
          preview: e.target?.result as string,
          id,
          processed: false
        })
      }
      reader.readAsDataURL(file)
    })
    csvData.value = ''
    screenshotError.value = ''
    // Reset input
    target.value = ''
  }
}

const processScreenshotWithChatGPT = async (imageId: string) => {
  const imageIndex = uploadedImages.value.findIndex(img => img.id === imageId)
  if (imageIndex === -1) {
    screenshotError.value = 'Image not found'
    return
  }

  const image = uploadedImages.value[imageIndex]
  uploadedImages.value[imageIndex].processed = true
  isProcessingScreenshot.value = true
  screenshotError.value = ''

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(image.file)
    
    // Call our server API
    const response = await $fetch<{ success: boolean; csvData: string }>('/api/process-screenshot', {
      method: 'POST',
      body: {
        imageData: base64Image
      }
    })

    if (response.success) {
      uploadedImages.value[imageIndex].csvData = response.csvData
    } else {
      throw new Error('Failed to process screenshot')
    }

  } catch (err: any) {
    console.error('Error processing screenshot:', err)
    uploadedImages.value[imageIndex].error = `Error processing screenshot: ${err.message}`
  } finally {
    isProcessingScreenshot.value = false
  }
}

const processAllScreenshots = async () => {
  const unprocessedImages = uploadedImages.value.filter(img => !img.processed)
  
  for (const image of unprocessedImages) {
    await processScreenshotWithChatGPT(image.id)
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

const removeImage = (imageId: string) => {
  const index = uploadedImages.value.findIndex(img => img.id === imageId)
  if (index !== -1) {
    uploadedImages.value.splice(index, 1)
  }
}

const clearAllImages = () => {
  uploadedImages.value = []
}

const downloadTableCSV = () => {
  const processedImages = uploadedImages.value.filter(img => img.csvData)
  
  if (processedImages.length === 0) return
  
     // Parse all CSV data and combine into a single dataset
   const allPlayers: Array<{
     playerName: string
     firstBossDamage: number
     firstBossDamageText: string
     secondBossDamage: number
     secondBossDamageText: string
     seasonTotalDamage: number
     seasonTotalDamageText: string
   }> = []
  
  processedImages.forEach(image => {
    console.log(`Raw CSV data from ${image.file.name}:`, image.csvData)
    const csvLines = cleanCSVData(image.csvData!).split('\n')
    console.log(`Cleaned CSV lines:`, csvLines)
    
         // Parse the new 4-row format more robustly
     let firstBossPlayers: Array<{ playerName: string; damage: number; damageText: string }> = []
     let secondBossPlayers: Array<{ playerName: string; damage: number; damageText: string }> = []
     let seasonTotalPlayers: Array<{ playerName: string; damage: number; damageText: string }> = []
    
    // Find the sections by looking for "PlayerName" headers
    let currentSection = 0 // 0 = first boss, 1 = second boss, 2 = season total
    
    for (let i = 0; i < csvLines.length; i++) {
      const line = csvLines[i].trim()
      
      // Skip empty lines
      if (!line) continue
      
      const columns = line.split(',')
      if (columns.length >= 2) {
        const firstColumn = columns[0]?.trim() || ''
        const secondColumn = columns[1]?.trim() || ''
        
        // Check if this is a header line
        if (firstColumn === 'PlayerName' || firstColumn === 'Player Name') {
          currentSection++
          continue
        }
        
                 // Check if this is a data line (player name + damage)
         if (firstColumn && firstColumn !== 'PlayerName' && secondColumn) {
           // Parse damage value, preserving exact format
           const damageText = secondColumn
           const damage = parseFloat(damageText.replace(/,/g, '')) || 0
           
           if (damage > 0) { // Only add players with actual damage
             if (currentSection === 1) {
               // First boss section
               firstBossPlayers.push({ playerName: firstColumn, damage, damageText })
             } else if (currentSection === 2) {
               // Second boss section
               secondBossPlayers.push({ playerName: firstColumn, damage, damageText })
             } else if (currentSection === 3) {
               // Season total section
               seasonTotalPlayers.push({ playerName: firstColumn, damage, damageText })
             }
           }
         }
      }
    }
    
         // Debug logging
     console.log(`Parsed ${image.file.name}:`, {
       firstBoss: firstBossPlayers.length,
       secondBoss: secondBossPlayers.length,
       seasonTotal: seasonTotalPlayers.length,
       firstBossSample: firstBossPlayers.slice(0, 2).map(p => ({ name: p.playerName, damage: p.damage, damageText: p.damageText })),
       secondBossSample: secondBossPlayers.slice(0, 2).map(p => ({ name: p.playerName, damage: p.damage, damageText: p.damageText })),
       seasonTotalSample: seasonTotalPlayers.slice(0, 2).map(p => ({ name: p.playerName, damage: p.damage, damageText: p.damageText }))
     })
    
    // Validate that we got data from all three sections
    if (firstBossPlayers.length === 0 || secondBossPlayers.length === 0 || seasonTotalPlayers.length === 0) {
      console.warn(`Warning: Missing data from ${image.file.name}:`, {
        firstBoss: firstBossPlayers.length,
        secondBoss: secondBossPlayers.length,
        seasonTotal: seasonTotalPlayers.length
      })
    }
    
    // Combine all unique players
    const allPlayerNames = new Set([
      ...firstBossPlayers.map(p => p.playerName),
      ...secondBossPlayers.map(p => p.playerName),
      ...seasonTotalPlayers.map(p => p.playerName)
    ])
    
         allPlayerNames.forEach(playerName => {
       const firstBossData = firstBossPlayers.find(p => p.playerName === playerName)
       const secondBossData = secondBossPlayers.find(p => p.playerName === playerName)
       const seasonTotalData = seasonTotalPlayers.find(p => p.playerName === playerName)
       
       allPlayers.push({
         playerName,
         firstBossDamage: firstBossData?.damage || 0,
         firstBossDamageText: firstBossData?.damageText || '0',
         secondBossDamage: secondBossData?.damage || 0,
         secondBossDamageText: secondBossData?.damageText || '0',
         seasonTotalDamage: seasonTotalData?.damage || 0,
         seasonTotalDamageText: seasonTotalData?.damageText || '0'
       })
     })
  })
  
  // Sort by season total damage (descending)
  allPlayers.sort((a, b) => b.seasonTotalDamage - a.seasonTotalDamage)
  
     // Debug summary
   console.log('Final processing summary:', {
     totalPlayers: allPlayers.length,
     playersWithFirstBoss: allPlayers.filter(p => p.firstBossDamage > 0).length,
     playersWithSecondBoss: allPlayers.filter(p => p.secondBossDamage > 0).length,
     playersWithSeasonTotal: allPlayers.filter(p => p.seasonTotalDamage > 0).length,
     samplePlayer: allPlayers[0],
     sampleDamageTexts: {
       firstBoss: allPlayers[0]?.firstBossDamageText,
       secondBoss: allPlayers[0]?.secondBossDamageText,
       seasonTotal: allPlayers[0]?.seasonTotalDamageText
     }
   })
  
  // Create CSV content with proper table format
  const csvLines = []
  
     // Header row with column titles
   csvLines.push('Member, Dmg Boss 1, Dmg Boss 2, Season Total')
  
     // Data rows - one row per player with all three values
   allPlayers.forEach(player => {
     // ChatGPT now outputs values already in billions format, so we can use them directly
     csvLines.push(`${player.playerName}, ${player.firstBossDamageText}, ${player.secondBossDamageText}, ${player.seasonTotalDamageText}`)
   })
  
  const combinedCSV = csvLines.join('\n')
  
  // Add BOM (Byte Order Mark) for proper UTF-8 detection in Google Sheets
  const BOM = '\uFEFF'
  const csvContent = BOM + combinedCSV
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'battle_data_table.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Computed properties for sorting and filtering
const sortedAndFilteredImages = computed(() => {
  let filtered = uploadedImages.value

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(img => {
      switch (filterStatus.value) {
        case 'processed':
          return img.processed && !img.error
        case 'unprocessed':
          return !img.processed
        case 'error':
          return img.error
        default:
          return true
      }
    })
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.file.name.localeCompare(b.file.name)
      case 'date':
        return b.file.lastModified - a.file.lastModified
      case 'status':
        if (a.processed && !b.processed) return -1
        if (!a.processed && b.processed) return 1
        if (a.error && !b.error) return 1
        if (!a.error && b.error) return -1
        return 0
      default:
        return 0
    }
  })
})

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

const cleanCSVData = (csvData: string): string => {
  // Remove any extra quotes and clean up the CSV format
  let cleaned = csvData.trim()
  
  // Remove quotes from the beginning and end if they exist
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1)
  }
  
  // Split into lines and clean each line
  const lines = cleaned.split('\n').map(line => {
    line = line.trim()
    // Remove quotes from the beginning and end of each line
    if (line.startsWith('"') && line.endsWith('"')) {
      line = line.slice(1, -1)
    }
    return line
  }).filter(line => line.length > 0)
  
  return lines.join('\n')
}

const downloadCSV = (data?: string) => {
  const csvContent = data || csvData.value
  if (!csvContent) return
  
  // Clean the CSV data
  const cleanedCSV = cleanCSVData(csvContent)
  
  // Convert damage values to billions format
  const lines = cleanedCSV.split('\n')
  const processedLines = lines.map((line, index) => {
    if (index === 0) return line // Keep header as is
    
    const columns = line.split(',')
    if (columns.length >= 12) {
      // Convert damage columns to billions (columns 2, 5, 8)
      const redVelvetDamage = parseFloat(columns[2]) || 0
      const avatarDamage = parseFloat(columns[5]) || 0
      const seasonTotalDamage = parseFloat(columns[8]) || 0
      
      columns[2] = (redVelvetDamage / 1000000000).toFixed(2)
      columns[5] = (avatarDamage / 1000000000).toFixed(2)
      columns[8] = (seasonTotalDamage / 1000000000).toFixed(2)
    }
    return columns.join(',')
  })
  
  const processedCSV = processedLines.join('\n')
  
  // Add BOM (Byte Order Mark) for proper UTF-8 detection in Google Sheets
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + processedCSV
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'battle_data.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const fetchFromSheets = async () => {
  if (!spreadsheetId.value) {
    error.value = 'Please enter a Spreadsheet ID'
    return
  }

  try {
    processing.value = true
    error.value = ''
    parsedPlayers.value = []

    processingMessage.value = '📊 Fetching data from Google Sheets...'

    console.log(`Fetching from Google Sheets: ${spreadsheetId.value}`)

    const players = await BattleAnalyzer.fetchFromGoogleSheets(spreadsheetId.value, range.value)

    if (players.length > 0) {
      parsedPlayers.value = players
      console.log('Successfully fetched players from Google Sheets:', players)
      processingMessage.value = `✅ Found ${players.length} players from Google Sheets!`
    } else {
      processingMessage.value = '⚠️ No players found in Google Sheets'
      console.log('No players found in Google Sheets data')
    }

  } catch (err: any) {
    console.error('Error fetching from Google Sheets:', err)
    error.value = `Error fetching from Google Sheets: ${err.message}`
    processingMessage.value = 'Processing failed'
  } finally {
    processing.value = false
  }
}

const formatDamage = (damage: number) => {
  return BattleAnalyzer.formatDamage(damage)
}

const formatAvgDamage = (avgDamage: number | undefined) => {
  if (avgDamage === undefined) return 'N/A'
  return `${avgDamage.toLocaleString()}B`
}
</script>

<template>
  <div class="test-sheets-page">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">📊 Test Google Sheets Integration</h1>
        <p class="hero-subtitle">Connect to your Google Sheets and fetch battle data for testing</p>
      </div>
    </div>
    
    <!-- Screenshot Upload Section -->
    <div class="screenshot-section">
      <div class="container">
        <h2 class="section-title">📸 Screenshot Data Extraction</h2>
        <p class="section-subtitle">Upload screenshots and use ChatGPT to extract battle data in CSV format</p>
        
        <!-- CSV Import Instructions -->
        <div class="csv-instructions">
          <h3>📋 How to Import CSV into Google Sheets</h3>
          <div class="instructions-grid">
            <div class="instruction-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Download CSV File</h4>
                <p>Click the "Download CSV" button after processing your screenshot</p>
              </div>
            </div>
            <div class="instruction-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Open Google Sheets</h4>
                <p>Go to <a href="https://sheets.google.com" target="_blank">sheets.google.com</a> and create a new spreadsheet</p>
              </div>
            </div>
            <div class="instruction-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Import the File</h4>
                <p>Go to <strong>File → Import → Upload</strong> and select your CSV file</p>
              </div>
            </div>
            <div class="instruction-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Choose Import Settings</h4>
                <p>Select "Replace current sheet" and ensure "Comma" is selected as the separator</p>
              </div>
            </div>
          </div>
        </div>

                 <div class="screenshot-form">
           <div class="upload-area">
             <input 
               type="file" 
               accept="image/*" 
               multiple
               @change="handleImageUpload" 
               id="image-upload"
               class="file-input"
               :disabled="isProcessingScreenshot"
             >
             <label for="image-upload" class="upload-label">
               <div class="upload-content">
                 <div class="upload-icon">📸</div>
                 <div class="upload-text">
                   <strong>Click to upload screenshots</strong>
                   <span>or drag and drop (multiple files supported)</span>
                 </div>
               </div>
             </label>
           </div>

           <!-- Controls -->
           <div v-if="uploadedImages.length > 0" class="controls-section">
             <div class="controls-header">
               <h3>📋 Screenshot Management ({{ uploadedImages.length }} images)</h3>
               <div class="control-buttons">
                  <button @click="processAllScreenshots" :disabled="isProcessingScreenshot" class="control-button process-all">
                    🤖 Process All
                  </button>
                                    <button @click="downloadTableCSV" :disabled="!uploadedImages.some(img => img.csvData)" class="control-button download-all">
                                       💾 Download Table CSV
                 </button>
                 <button @click="clearAllImages" class="control-button clear-all">
                   🗑️ Clear All
                 </button>
               </div>
             </div>
             
             <!-- Simplified CSV Info -->
             <div v-if="uploadedImages.some(img => img.csvData)" class="simplified-csv-info">
               <div class="info-icon">ℹ️</div>
               <div class="info-content">
                                   <strong>Simplified CSV:</strong> All processed screenshots will be merged into a single CSV file with a table format: Member, Dmg Boss 1, Dmg Boss 2, Season Total. Damage values are automatically converted to billions format.
               </div>
             </div>

             <!-- Sort and Filter Controls -->
             <div class="sort-filter-controls">
               <div class="sort-control">
                 <label>Sort by:</label>
                 <select v-model="sortBy" class="sort-select">
                   <option value="name">Name</option>
                   <option value="date">Date</option>
                   <option value="status">Status</option>
                 </select>
               </div>
               <div class="filter-control">
                 <label>Filter by:</label>
                 <select v-model="filterStatus" class="filter-select">
                   <option value="all">All</option>
                   <option value="processed">Processed</option>
                   <option value="unprocessed">Unprocessed</option>
                   <option value="error">Error</option>
                 </select>
               </div>
             </div>
           </div>

           <!-- Images Grid -->
           <div v-if="uploadedImages.length > 0" class="images-grid">
             <div v-for="image in sortedAndFilteredImages" :key="image.id" class="image-card">
               <div class="image-card-header">
                 <h4>{{ image.file.name }}</h4>
                 <div class="image-status">
                   <span v-if="image.processed && !image.error" class="status-badge success">✅ Processed</span>
                   <span v-else-if="image.error" class="status-badge error">❌ Error</span>
                   <span v-else class="status-badge pending">⏳ Pending</span>
                 </div>
                 <button @click="removeImage(image.id)" class="remove-button">🗑️</button>
               </div>
               
               <div class="image-preview">
                 <img :src="image.preview" :alt="image.file.name" class="preview-image">
               </div>
               
                               <div class="image-actions">

                </div>

               <!-- Error Message -->
               <div v-if="image.error" class="error-message">
                 ❌ {{ image.error }}
               </div>

                               <!-- Processing Status -->
                <div v-if="image.csvData" class="processing-status">
                  <div class="status-success">
                    <span class="status-icon">✅</span>
                    <span class="status-text">Data extracted successfully</span>
                  </div>
                </div>
             </div>
           </div>

           <!-- Error Messages -->
           <div v-if="screenshotError" class="error-message">
             ❌ {{ screenshotError }}
           </div>
        </div>
      </div>
    </div>
    
    <div class="sheets-section">
      <div class="container">
        <h2 class="section-title">📊 Connect to Google Sheets</h2>
        <p class="section-subtitle">Fetch battle data directly from your Google Sheets spreadsheet</p>

        <div class="sheets-form">
          <div class="form-row">
            <div class="form-group">
              <label for="spreadsheet-id">Spreadsheet ID:</label>
              <input 
                id="spreadsheet-id"
                v-model="spreadsheetId" 
                type="text" 
                placeholder="e.g., 1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs"
                :disabled="processing"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="range">Range (optional):</label>
              <input 
                id="range"
                v-model="range" 
                type="text" 
                placeholder="e.g., 20-1!A1:Z100"
                :disabled="processing"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <button 
                @click="fetchFromSheets" 
                :disabled="!spreadsheetId || processing"
                class="fetch-button"
              >
                {{ processing ? '📊 Fetching...' : '📊 Fetch from Google Sheets' }}
              </button>
            </div>
          </div>
          
          <!-- Success/Error Messages -->
          <div v-if="!processing && parsedPlayers.length > 0" class="success-message">
            ✅ Successfully fetched data from Google Sheets!
            <div class="data-info">
              <small>Found {{ parsedPlayers.length }} players with battle data.</small>
            </div>
          </div>
          <div v-if="error" class="error-message">
            ❌ {{ error }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="processing" class="processing">
      <p>{{ processingMessage }}</p>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    <div v-if="parsedPlayers.length > 0" class="results-section">
      <div class="container">
        <h2 class="results-title">Players from Google Sheets ({{ parsedPlayers.length }})</h2>
        
        <div class="players-grid">
          <div v-for="player in parsedPlayers" :key="player.rank" class="player-card">
            <div class="player-header">
              <h3>#{{ player.rank }} {{ player.playerName }}</h3>
              <span class="guild-rank">{{ player.guildRank || 'Member' }}</span>
            </div>
            
            <div class="boss-stats">
              <div class="boss-stat">
                <h4>🐉 Red Velvet Dragon</h4>
                <p>Damage: {{ formatDamage(player.redVelvetDragon.damage) }}</p>
                <p>Battles: x{{ player.redVelvetDragon.battles }}</p>
                <p>Avg/Ticket: {{ formatAvgDamage(player.redVelvetDragon.avgDamagePerTicket) }}</p>
              </div>
              
              <div class="boss-stat">
                <h4>👁️ Avatar of Destiny</h4>
                <p>Damage: {{ formatDamage(player.avatarOfDestiny.damage) }}</p>
                <p>Battles: x{{ player.avatarOfDestiny.battles }}</p>
                <p>Avg/Ticket: {{ formatAvgDamage(player.avatarOfDestiny.avgDamagePerTicket) }}</p>
              </div>
              
              <div class="boss-stat">
                <h4>🔷 Living Abyss</h4>
                <p>Damage: {{ formatDamage(player.livingAbyss.damage) }}</p>
                <p>Battles: x{{ player.livingAbyss.battles }}</p>
                <p>Avg/Ticket: {{ formatAvgDamage(player.livingAbyss.avgDamagePerTicket) }}</p>
              </div>
            </div>
            
            <div class="total-stats">
              <p><strong>Total Damage:</strong> {{ formatDamage(player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage) }}</p>
              <p><strong>Total Battles:</strong> {{ player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-sheets-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 4rem 0;
  text-align: center;
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Screenshot Section Styles */
.screenshot-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0;
  color: white;
}

/* CSV Instructions */
.csv-instructions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.csv-instructions h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.5rem;
}

.instructions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.instruction-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step-number {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 1rem;
}

.step-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-content a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.step-content a:hover {
  text-decoration: underline;
}

.step-content strong {
  color: #ffc107;
}

.screenshot-form {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.upload-area {
  position: relative;
  margin-bottom: 2rem;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-label {
  display: block;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-label:hover {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-text strong {
  font-size: 1.2rem;
}

.upload-text span {
  opacity: 0.8;
  font-size: 0.9rem;
}

/* API Key Warning */
.api-key-warning {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content h4 {
  margin: 0 0 0.5rem 0;
  color: #ff9800;
  font-size: 1rem;
}

.warning-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.warning-content code {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.upload-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.1);
}

.upload-label.disabled:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: transparent;
}

/* Controls Section */
.controls-section {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.controls-header h3 {
  margin: 0;
  color: white;
  font-size: 1.2rem;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.control-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.control-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-button.process-all {
  background: linear-gradient(45deg, #4CAF50, #45a049);
}

.control-button.download-all {
  background: linear-gradient(45deg, #2196F3, #1976D2);
}

.control-button.clear-all {
  background: linear-gradient(45deg, #f44336, #d32f2f);
}

/* Simplified CSV Info */
.simplified-csv-info {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  color: #2196F3;
}

.info-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.4;
}

.info-content strong {
  color: #2196F3;
}

.sort-filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.sort-control, .filter-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-control label, .filter-control label {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.sort-select, .filter-select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.sort-select option, .filter-select option {
  background: #333;
  color: white;
}

/* Images Grid */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.image-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.image-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.image-card-header h4 {
  margin: 0;
  color: white;
  font-size: 1rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-status {
  margin: 0 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.error {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-badge.pending {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.remove-button {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.remove-button:hover {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
}

.image-preview {
  margin-bottom: 1rem;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.image-actions {
  margin-bottom: 1rem;
  text-align: center;
}

.process-button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.process-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.process-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.csv-results {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.csv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.csv-header h4 {
  margin: 0;
  color: white;
  flex-shrink: 0;
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.csv-tip {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: #ffc107;
  max-width: 300px;
  text-align: center;
}

.download-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.download-button:hover {
  background: #45a049;
}

.csv-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.csv-content pre {
  margin: 0;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.sheets-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0;
  color: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.section-subtitle {
  text-align: center;
  margin-bottom: 2rem;
  opacity: 0.9;
  font-size: 1.1rem;
}

.sheets-form {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  opacity: 0.9;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fetch-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.fetch-button:hover:not(:disabled) {
  background: #45a049;
}

.fetch-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-message {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.error-message {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.data-info {
  margin-top: 0.5rem;
  opacity: 0.8;
}

.results-section {
  background: rgba(255, 255, 255, 0.05);
  padding: 4rem 0;
  color: white;
}

.results-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.player-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.player-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.player-header h3 {
  margin: 0;
  color: white;
  font-size: 1.2rem;
}

.guild-rank {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: white;
}

.boss-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.boss-stat {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.boss-stat h4 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 1rem;
}

.boss-stat p {
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.total-stats {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
}

.total-stats p {
  margin: 0.5rem 0;
  color: white;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .csv-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .download-options {
    align-items: flex-start;
  }
  
  .csv-tip {
    max-width: none;
  }
  
  .upload-label {
    padding: 2rem;
  }
  
  .upload-icon {
    font-size: 2rem;
  }
  
  .controls-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .sort-filter-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .image-card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .image-status {
    margin: 0;
  }
}
</style>
