<script setup lang="ts">
import { ref } from 'vue'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'

const selectedFile = ref<File | null>(null)
const parsedPlayers = ref<any[]>([])
const error = ref('')
const processing = ref(false)
const processingMessage = ref('')

const processImage = async () => {
  if (!selectedFile.value) return

  try {
    processing.value = true
    error.value = ''
    parsedPlayers.value = []

    processingMessage.value = '🔍 Analyzing screenshot...'

    console.log(`Processing ${selectedFile.value.name}`)

    const players = await BattleAnalyzer.analyzeScreenshots([selectedFile.value])

    if (players.length > 0) {
      parsedPlayers.value = players
      console.log('Successfully parsed players:', players)
      processingMessage.value = `✅ Found ${players.length} players!`
    } else {
      processingMessage.value = '⚠️ No players found in the image'
      console.log('No players found in parsed data')
    }

  } catch (err: any) {
    console.error('Error processing image:', err)
    error.value = `Error processing ${selectedFile.value.name}: ${err.message}`
    processingMessage.value = 'Processing failed'
  } finally {
    processing.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const formatDamage = (damage: number) => {
  return BattleAnalyzer.formatDamage(damage)
}
</script>

<template>
  <div class="test-ocr-page">
    <h1>Test OCR Analysis</h1>
    
    <div class="upload-section">
      <input 
        type="file" 
        accept="image/*" 
        @change="handleFileSelect"
        :disabled="processing"
      >
      
      <button 
        @click="processImage" 
        :disabled="!selectedFile || processing"
        class="process-button"
      >
        {{ processing ? 'Processing...' : 'Process Image' }}
      </button>
    </div>

    <div v-if="processing" class="processing">
      <p>{{ processingMessage }}</p>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-if="parsedPlayers.length > 0" class="results">
      <h2>Parsed Players ({{ parsedPlayers.length }})</h2>
      
      <div v-for="player in parsedPlayers" :key="player.rank" class="player-card">
        <h3>{{ player.playerName }} (Lv.{{ player.playerLevel }})</h3>
        <p>Title: {{ player.playerTitle }}</p>
        <p>Red Velvet: x{{ player.redVelvetDragon.battles }} {{ formatDamage(player.redVelvetDragon.damage) }}</p>
        <p>Avatar: x{{ player.avatarOfDestiny.battles }} {{ formatDamage(player.avatarOfDestiny.damage) }}</p>
        <p>Season: x{{ player.seasonTotal.battles }} {{ formatDamage(player.seasonTotal.damage) }}</p>
        <p>Guild Rank: {{ player.guildRank }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-ocr-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.upload-section {
  margin: 2rem 0;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
}

.process-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.process-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.processing {
  margin: 1rem 0;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 4px;
}

.error {
  margin: 1rem 0;
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
}

.results {
  margin-top: 2rem;
}

.player-card {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.player-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.player-card p {
  margin: 0.25rem 0;
  color: #666;
}
</style>
