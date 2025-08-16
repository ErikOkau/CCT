<script setup lang="ts">
import { onMounted } from 'vue'
import { useBattleAnalysis } from '~/composables/useBattleAnalysis'
import { useExcelExport } from '~/composables/useExcelExport'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'

// Use composables
const {
  uploadState,
  databaseForm,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  analyzeBattleResult,
  resetAnalysis,
  saveToDatabase
} = useBattleAnalysis()

const { exportToExcel } = useExcelExport()

// GSAP animations
onMounted(() => {
  // Add entrance animations here if needed
})
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <div class="guild-badge">
            <div class="guild-logo">
              <img src="/img/cctLogo.png" alt="CCT Logo" class="guild-logo-img">
            </div>
            <div class="guild-name">Chaos Control Team</div>
          </div>
          <h1 class="hero-title">
            <span class="gradient-text">Guild Battle</span>
            <br>Analyzer
          </h1>
          <p class="hero-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
            non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div class="guild-info">
            <div class="info-item">
              <span class="info-label">Leader:</span>
              <span class="info-value">Bestoutuber</span>
            </div>
            <div class="info-item">
              <span class="info-label">Officer:</span>
              <span class="info-value">brownmascara</span>
            </div>
            <div class="info-item">
              <span class="info-label">Guild Level:</span>
              <span class="info-value">70</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="sonic-illustration">
            <div class="sonic-character">🦔</div>
            <div class="rings">
              <div class="ring ring-1">💍</div>
              <div class="ring ring-2">💍</div>
              <div class="ring ring-3">💍</div>
            </div>
            <div class="chaos-emeralds">
              <div class="emerald emerald-1">💎</div>
              <div class="emerald emerald-2">💎</div>
              <div class="emerald emerald-3">💎</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upload Section -->
    <section class="upload-section">
      <div class="container">
        <h2 class="section-title">Upload Your Battle Screenshot</h2>

        <div class="upload-area" :class="{
          'dragging': uploadState.isDragging,
          'has-file': uploadState.uploadedFiles.length > 0,
          'analyzing': uploadState.isAnalyzing
        }" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
          <input type="file" id="file-input" accept="image/*" multiple @change="handleFileSelect"
            class="file-input">

          <div class="upload-content" v-if="uploadState.uploadedFiles.length === 0">
            <div class="upload-icon">📸</div>
            <h3>Upload Multiple Screenshots</h3>
            <label for="file-input" class="upload-button">Choose Files</label>
          </div>

          <div class="upload-content" v-else-if="uploadState.filesSelected && !uploadState.isAnalyzing && !uploadState.analysisComplete">
            <div class="files-selected-icon">📁</div>
            <h3>Files Selected!</h3>
            <p>{{ uploadState.uploadedFiles.length }} screenshot{{ uploadState.uploadedFiles.length > 1 ? 's' : '' }} ready for
              analysis</p>
            <div class="file-list">
              <div v-for="(file, index) in uploadState.uploadedFiles" :key="index" class="file-item">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ (file.size / 1024 / 1024).toFixed(1) }} MB</span>
              </div>
            </div>
            <div class="action-buttons">
              <button @click="analyzeBattleResult" class="confirm-button">
                🔍 Analyze Screenshots
              </button>
              <button @click="resetAnalysis" class="reset-button">
                📁 Choose Different Files
              </button>
            </div>
          </div>

          <div class="upload-content" v-else-if="uploadState.isAnalyzing">
            <div class="loading-spinner"></div>
            <h3>Analyzing Battle Results...</h3>
            <p>Extracting data from {{ uploadState.uploadedFiles.length }} screenshot{{ uploadState.uploadedFiles.length > 1 ? 's' :
              '' }}</p>
          </div>

          <div class="upload-content" v-else-if="uploadState.analysisComplete">
            <div class="success-icon">✅</div>
            <h3>Analysis Complete!</h3>
            <p>{{ uploadState.uploadedFiles.length }} screenshot{{ uploadState.uploadedFiles.length > 1 ? 's' : '' }} processed</p>
            <button @click="resetAnalysis" class="reset-button">Upload More</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section" v-if="uploadState.analysisComplete">
      <div class="container">
        <div class="results-header">
          <h2 class="section-title">Battle Analysis Results</h2>
          <div class="action-buttons">
            <button @click="exportToExcel(uploadState.battleData)" class="export-button">
              📊 Export to Excel
            </button>
          </div>
        </div>

        <!-- Database Save Form -->
        <div class="database-form">
          <h3>Save to Database</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="seasonName">Season Name:</label>
              <input 
                id="seasonName"
                v-model="databaseForm.seasonName" 
                type="text" 
                placeholder="e.g., 20-2"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="guildName">Guild Name:</label>
              <input 
                id="guildName"
                v-model="databaseForm.guildName" 
                type="text" 
                placeholder="e.g., Chaos Control Team"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <button 
                @click="saveToDatabase" 
                :disabled="databaseForm.isSavingToDatabase"
                class="save-button"
              >
                {{ databaseForm.isSavingToDatabase ? 'Saving...' : '💾 Save to Database' }}
              </button>
            </div>
          </div>
          
          <!-- Success/Error Messages -->
          <div v-if="databaseForm.saveSuccess" class="success-message">
            ✅ Successfully saved to database!
          </div>
          <div v-if="databaseForm.saveError" class="error-message">
            ❌ {{ databaseForm.saveError }}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ uploadState.battleStats?.totalPlayers || 0 }}</div>
            <div class="stat-label">Total Players</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ BattleAnalyzer.formatDamage(uploadState.battleStats?.highestDamage || 0) }}
            </div>
            <div class="stat-label">Highest Season Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ BattleAnalyzer.formatDamage(uploadState.battleStats?.averageDamage || 0) }}
            </div>
            <div class="stat-label">Average Season Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ uploadState.battleStats?.totalBattlesDone || 0 }}</div>
            <div class="stat-label">Total Battles Done</div>
          </div>
        </div>

        <!-- Boss-specific stats -->
        <div class="boss-stats-grid">
          <div class="boss-stat-card red-velvet">
            <div class="boss-stat-header">
              <div class="boss-icon">🐉</div>
              <h3>Red Velvet Dragon</h3>
            </div>
            <div class="boss-stat-content">
              <div class="boss-stat-item">
                <span class="stat-label">Participants:</span>
                <span class="stat-value">{{ uploadState.battleStats?.redVelvetStats.participants || 0 }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Total Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(uploadState.battleStats?.redVelvetStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(uploadState.battleStats?.redVelvetStats.averageDamage || 0)
                  }}</span>
              </div>
            </div>
          </div>

          <div class="boss-stat-card avatar">
            <div class="boss-stat-header">
              <div class="boss-icon">👁️</div>
              <h3>Avatar of Destiny</h3>
            </div>
            <div class="boss-stat-content">
              <div class="boss-stat-item">
                <span class="stat-label">Participants:</span>
                <span class="stat-value">{{ uploadState.battleStats?.avatarStats.participants || 0 }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Total Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(uploadState.battleStats?.avatarStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(uploadState.battleStats?.avatarStats.averageDamage || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Insights Section -->
        <div class="insights-section" v-if="uploadState.insights.length > 0">
          <h3>Performance Insights</h3>
          <div class="insights-grid">
            <div class="insight-card" v-for="(insight, index) in uploadState.insights" :key="index">
              <div class="insight-icon">💡</div>
              <p>{{ insight }}</p>
            </div>
          </div>
        </div>

        <div class="results-table">
          <h3>Player Performance Preview</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Red Velvet Dragon</th>
                  <th>Avatar of Destiny</th>
                  <th>Season Total</th>
                  <th>Guild Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in uploadState.previewData" :key="player.rank">
                  <td class="rank-cell">
                    <span class="rank-badge" :class="BattleAnalyzer.getRankBadgeClass(player.rank)">
                      {{ player.rank }}
                    </span>
                  </td>
                  <td class="player-cell">
                    <div class="player-info">
                      <div class="player-name">{{ player.playerName }}</div>
                      <div class="player-details">
                        <span class="player-level">Lv.{{ player.playerLevel }}</span>
                        <span class="player-title">{{ player.playerTitle }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{
                        BattleAnalyzer.formatDamage(player.redVelvetDragon.damage) }}</div>
                      <div class="battles-count">x{{ player.redVelvetDragon.battles }}</div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{
                        BattleAnalyzer.formatDamage(player.avatarOfDestiny.damage) }}</div>
                      <div class="battles-count">x{{ player.avatarOfDestiny.battles }}</div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{
                        BattleAnalyzer.formatDamage(player.seasonTotal.damage) }}</div>
                      <div class="battles-count">x{{ player.seasonTotal.battles }}</div>
                    </div>
                  </td>
                  <td class="rank-cell">
                    <span class="guild-rank-badge"
                      :class="BattleAnalyzer.getGuildRankBadgeClass(player.guildRank)">
                      {{ player.guildRank }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="table-note">
            Showing top 5 players. Download the full Excel report for complete data.
          </p>
        </div>
      </div>
    </section>

    <!-- Guild Bosses Section -->
    <section class="bosses-section">
      <div class="container">
        <h2 class="section-title">Guild Boss Requirements</h2>
        <div class="bosses-grid">
          <div class="boss-card red-velvet">
            <div class="boss-icon">🐉</div>
            <h3>Red Velvet Dragon</h3>
            <div class="boss-requirements">
              <div class="requirement">
                <span class="req-label">Damage Req:</span>
                <span class="req-value">6.0B</span>
              </div>
              <div class="requirement">
                <span class="req-label">Damage Goal:</span>
                <span class="req-value">9.0B</span>
              </div>
              <div class="requirement">
                <span class="req-label">Min Tickets:</span>
                <span class="req-value">15</span>
              </div>
            </div>
          </div>
          <div class="boss-card avatar">
            <div class="boss-icon">👁️</div>
            <h3>Avatar of Destiny</h3>
            <div class="boss-requirements">
              <div class="requirement">
                <span class="req-label">Damage Req:</span>
                <span class="req-value">3.5B</span>
              </div>
              <div class="requirement">
                <span class="req-label">Damage Goal:</span>
                <span class="req-value">5.0B</span>
              </div>
              <div class="requirement">
                <span class="req-label">Min Tickets:</span>
                <span class="req-value">15</span>
              </div>
            </div>
          </div>
          <div class="boss-card living-abyss">
            <div class="boss-icon">🌊</div>
            <h3>Living Abyss</h3>
            <div class="boss-requirements">
              <div class="requirement">
                <span class="req-label">Damage Req:</span>
                <span class="req-value">12.0B</span>
              </div>
              <div class="requirement">
                <span class="req-label">Damage Goal:</span>
                <span class="req-value">18.0B</span>
              </div>
              <div class="requirement">
                <span class="req-label">Min Tickets:</span>
                <span class="req-value">15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <div class="footer-guild-name">Chaos Control Team</div>
            <div class="footer-guild-tag">CCT</div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>