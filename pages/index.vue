<script setup lang="ts">
import { onMounted } from 'vue'
import { useBattleAnalysis } from '~/composables/useBattleAnalysis'
import { useExcelExport } from '~/composables/useExcelExport'
import { useAuth } from '~/composables/useAuth'
import { BattleAnalyzer } from '~/utils/battleAnalyzer'

// Use composables
const {
  analysisState,
  sheetsState,
  databaseForm,
  fetchFromGoogleSheets,
  resetAnalysis,
  saveToDatabase
} = useBattleAnalysis()

const {
  user,
  isAuthenticated,
  isLoading,
  loginForm,
  checkSession,
  login,
  logout,
  isAdmin
} = useAuth()

// Check session on page load
onMounted(() => {
  checkSession()
})

const { exportToExcel } = useExcelExport()

// GSAP animations
onMounted(() => {
  // Add entrance animations here if needed
})
</script>

<template>
  <div class="landing-page">
    <!-- Navigation Header -->
    <header class="nav-header">
      <div class="nav-container">
        <div class="nav-brand">
          <img src="/img/cctLogo.png" alt="CCT Logo" class="nav-logo">
          <span class="nav-title">Chaos Control Team</span>
        </div>
        
        <nav class="nav-menu">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink v-if="!isAuthenticated" to="/login" class="nav-link">Login</NuxtLink>
          <NuxtLink v-if="!isAuthenticated" to="/registration" class="nav-link">Register</NuxtLink>
          
          <div v-if="isAuthenticated" class="user-menu">
            <span class="user-badge">
              👤 {{ user?.username }} ({{ user?.role }})
            </span>
            <button @click="logout" class="logout-button">
              🚪 Logout
            </button>
          </div>
        </nav>
      </div>
    </header>

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

    

    <!-- Google Sheets Section (Admin Only) -->
    <section v-if="isAuthenticated && isAdmin()" class="sheets-section">
      <div class="container">
        <h2 class="section-title">📊 Connect to Google Sheets</h2>
        <p class="section-subtitle">Fetch battle data directly from your Google Sheets spreadsheet</p>

        <div class="sheets-form">
          <div class="form-row">
            <div class="form-group">
              <label for="spreadsheet-id">Spreadsheet ID:</label>
              <input 
                id="spreadsheet-id"
                v-model="sheetsState.spreadsheetId" 
                type="text" 
                placeholder="e.g., 1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs"
                :disabled="sheetsState.isFetching"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="range">Range (optional):</label>
              <input 
                id="range"
                v-model="sheetsState.range" 
                type="text" 
                placeholder="e.g., 20-1!A1:Z100"
                :disabled="sheetsState.isFetching"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <button 
                @click="fetchFromGoogleSheets" 
                :disabled="!sheetsState.spreadsheetId || sheetsState.isFetching"
                class="fetch-button"
              >
                {{ sheetsState.isFetching ? '📊 Fetching...' : '📊 Fetch from Google Sheets' }}
              </button>
            </div>
          </div>
          
                     <!-- Success/Error Messages -->
           <div v-if="sheetsState.fetchSuccess" class="success-message">
             ✅ Successfully fetched data from Google Sheets!
             <div class="data-info">
               <small>Data is automatically saved and will persist across page refreshes.</small>
             </div>
           </div>
           <div v-if="sheetsState.fetchError" class="error-message">
             ❌ {{ sheetsState.fetchError }}
           </div>
           
           <!-- Clear Data Button (Admin Only) -->
           <div v-if="analysisState.analysisComplete && isAdmin()" class="clear-data-section">
             <button @click="resetAnalysis" class="clear-button">
               🗑️ Clear Saved Data
             </button>
             <small class="clear-note">This will remove all saved data and reset the form. (Admin only)</small>
           </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section" v-if="analysisState.analysisComplete">
      <div class="container">
        <div class="results-header">
          <h2 class="section-title">Battle Analysis Results</h2>
          <div class="action-buttons">
                         <button @click="exportToExcel(analysisState.battleData)" class="export-button">
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
             <div class="stat-number">{{ analysisState.battleStats?.totalPlayers || 0 }}</div>
             <div class="stat-label">Total Players</div>
           </div>
           <div class="stat-card">
             <div class="stat-number">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.highestDamage || 0) }}
             </div>
             <div class="stat-label">Highest Season Total</div>
           </div>
           <div class="stat-card">
             <div class="stat-number">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.averageDamage || 0) }}
             </div>
             <div class="stat-label">Average Season Total</div>
           </div>
           <div class="stat-card">
             <div class="stat-number">{{ analysisState.battleStats?.totalBattlesDone || 0 }}</div>
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
                                 <span class="stat-value">{{ analysisState.battleStats?.redVelvetStats.participants || 0 }}</span>
               </div>
               <div class="boss-stat-item">
                 <span class="stat-label">Total Damage:</span>
                 <span class="stat-value">{{
                   BattleAnalyzer.formatDamage(analysisState.battleStats?.redVelvetStats.totalDamage || 0) }}</span>
               </div>
               <div class="boss-stat-item">
                 <span class="stat-label">Average Damage:</span>
                 <span class="stat-value">{{
                   BattleAnalyzer.formatDamage(analysisState.battleStats?.redVelvetStats.averageDamage || 0)
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
                                 <span class="stat-value">{{ analysisState.battleStats?.avatarStats.participants || 0 }}</span>
               </div>
               <div class="boss-stat-item">
                 <span class="stat-label">Total Damage:</span>
                 <span class="stat-value">{{
                   BattleAnalyzer.formatDamage(analysisState.battleStats?.avatarStats.totalDamage || 0) }}</span>
               </div>
               <div class="boss-stat-item">
                 <span class="stat-label">Average Damage:</span>
                 <span class="stat-value">{{
                   BattleAnalyzer.formatDamage(analysisState.battleStats?.avatarStats.averageDamage || 0) }}</span>
               </div>
            </div>
          </div>

          <div class="boss-stat-card living-abyss">
            <div class="boss-stat-header">
              <div class="boss-icon">🔷</div>
              <h3>Living Abyss</h3>
            </div>
            <div class="boss-stat-content">
              <div class="boss-stat-item">
                <span class="stat-label">Participants:</span>
                                 <span class="stat-value">{{ analysisState.battleStats?.livingAbyssStats.participants || 0 }}</span>
               </div>
               <div class="boss-stat-item">
                 <span class="stat-label">Total Damage:</span>
                 <span class="stat-value">{{
                   BattleAnalyzer.formatDamage(analysisState.battleStats?.livingAbyssStats.totalDamage || 0) }}</span>
               </div>
               <div class="boss-stat-item">
                 <span class="stat-label">Average Damage:</span>
                 <span class="stat-value">{{
                   BattleAnalyzer.formatDamage(analysisState.battleStats?.livingAbyssStats.averageDamage || 0) }}</span>
               </div>
            </div>
          </div>
        </div>

                 <!-- Insights Section -->
         <div class="insights-section" v-if="analysisState.insights.length > 0">
           <h3>Performance Insights</h3>
           <div class="insights-grid">
             <div class="insight-card" v-for="(insight, index) in analysisState.insights" :key="index">
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
                    <th>Living Abyss</th>
                    <th>Season Total</th>
                    <th>Guild Rank</th>
                  </tr>
                </thead>
               <tbody>
                 <tr v-for="player in analysisState.previewData" :key="player.rank">
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
                         BattleAnalyzer.formatDamage(player.livingAbyss.damage) }}</div>
                       <div class="battles-count">x{{ player.livingAbyss.battles }}</div>
                     </div>
                   </td>
                   <td class="damage-cell">
                     <div class="damage-info">
                       <div class="damage-value">{{
                         BattleAnalyzer.formatDamage(player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage) }}</div>
                       <div class="battles-count">x{{ player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles }}</div>
                     </div>
                   </td>
                  <td class="rank-cell">
                    <span class="guild-rank-badge"
                      :class="BattleAnalyzer.getGuildRankBadgeClass(player.guildRank || 'Member')">
                      {{ player.guildRank || 'Member' }}
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
            <div class="boss-icon">
              <img src="/img/Red_Velvet_Dragon.webp" alt="Red Velvet Dragon" />
            </div>
            <h3>Red Velvet Dragon</h3>
            <div class="boss-requirements">
              <div class="requirement">
                <span class="req-label">Damage Req:</span>
                <span class="req-value">8.0B</span>
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
            <div class="boss-icon">
              <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny" />
            </div>
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
            <div class="boss-icon">
              <img src="/img/Living_Licorice_Abyss.webp" alt="Living Licorice Abyss" />
            </div>
            <h3>Living Abyss</h3>
            <div class="boss-requirements">
              <div class="requirement">
                <span class="req-label">Damage Req:</span>
                <span class="req-value">16.0B</span>
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

<style scoped>
/* Global reset for landing page */
.landing-page {
  margin: 0;
  padding: 0;
}

/* Ensure body has no margins */
:global(body) {
  margin: 0;
  padding: 0;
}

.sheets-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0;
  color: white;
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

.clear-data-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.clear-button {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.clear-button:hover {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
}

.clear-note {
  display: block;
  margin-top: 0.5rem;
  opacity: 0.7;
  font-size: 0.8rem;
}

/* Navigation Header Styles */
.nav-header {
  position: static;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  margin: 0;
  width: 100%;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.nav-title {
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-badge {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid rgba(76, 175, 80, 0.3);
  font-size: 0.9rem;
}

.logout-button {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-title {
    display: none;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>