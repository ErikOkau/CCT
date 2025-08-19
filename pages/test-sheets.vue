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
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">📊 Test Google Sheets Integration</h1>
        <p class="hero-subtitle">Connect to your Google Sheets and fetch battle data for testing</p>
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
</style>
