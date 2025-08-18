<script setup lang="ts">
import { ref } from 'vue'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'
import type { BattlePlayer } from '~/types/battle'

const spreadsheetId = ref('1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs')
const range = ref('20-1!A1:Z100') // Sheet 20-1 contains the guild battle data
const parsedPlayers = ref<BattlePlayer[]>([])
const error = ref('')
const processing = ref(false)
const processingMessage = ref('')

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
    <h1>Test Google Sheets Integration</h1>
    
    <div class="sheets-section">
      <h2>📊 Connect to Google Sheets</h2>
      <p>Enter your Google Sheets ID to fetch battle data directly from your spreadsheet.</p>
      
      <div class="input-group">
        <label for="spreadsheet-id">Spreadsheet ID:</label>
        <input 
          id="spreadsheet-id"
          v-model="spreadsheetId" 
          type="text" 
          placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
          :disabled="processing"
        >
      </div>
      
      <div class="input-group">
        <label for="range">Range (optional):</label>
        <input 
          id="range"
          v-model="range" 
          type="text" 
          placeholder="e.g., A1:Z100"
          :disabled="processing"
        >
        <p class="note">Note: If you are using a Google Sheet with multiple sheets, please specify the sheet name (e.g., "Sheet1!A1:Z100" or "Sheet2!A1:Z100").</p>
      </div>
      
      <button 
        @click="fetchFromSheets" 
        :disabled="!spreadsheetId || processing"
        class="fetch-button"
      >
        {{ processing ? 'Fetching...' : '📊 Fetch from Google Sheets' }}
      </button>
    </div>

    <div v-if="processing" class="processing">
      <p>{{ processingMessage }}</p>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-if="parsedPlayers.length > 0" class="results">
      <h2>Players from Google Sheets ({{ parsedPlayers.length }})</h2>
      
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
</template>

<style scoped>
.test-sheets-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.sheets-section {
  margin: 2rem 0;
  padding: 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.input-group {
  margin: 1rem 0;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.fetch-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.fetch-button:disabled {
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

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.player-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.player-header h3 {
  margin: 0;
  color: #333;
}

.guild-rank {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #666;
}

.boss-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.boss-stat {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.boss-stat h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.boss-stat p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.875rem;
}

.total-stats {
  padding-top: 1rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.total-stats p {
  margin: 0.5rem 0;
  color: #333;
  font-size: 0.875rem;
}

.note {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}
</style>
