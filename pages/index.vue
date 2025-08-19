<script setup lang="ts">
import { onMounted } from 'vue'
import { useBattleAnalysis } from '~/composables/useBattleAnalysis'
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

// GSAP animations
onMounted(() => {
  // Add entrance animations here if needed
})

// Guild Battle Schedule Data
const activeSeason = ref(1) // Will be calculated based on current date

// Season date ranges (in GMT+9 timezone)
const seasonDates = {
  1: { start: new Date('2025-08-07T00:00:00+09:00'), end: new Date('2025-08-13T23:59:59+09:00') },
  2: { start: new Date('2025-08-14T00:00:00+09:00'), end: new Date('2025-08-20T23:59:59+09:00') },
  3: { start: new Date('2025-08-21T00:00:00+09:00'), end: new Date('2025-08-27T23:59:59+09:00') }
}

// Season-specific data availability and spreadsheet configurations
const seasonConfigurations = {
  1: { 
    hasData: true,  // Season 20-1 (previous season) has data
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-1!A1:Z100' // Season 20-1 range
  },
  2: { 
    hasData: false, // Season 20-2 (current season) - no data yet
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-2!A1:Z100' // Season 20-2 range (for when data becomes available)
  },
  3: { 
    hasData: false, // Season 20-3 (upcoming season) no data available
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-3!A1:Z100' // Season 20-3 range (for when data becomes available)
  }
}

// Season types for display purposes
const seasonTypes = {
  1: 'previous',  // Season 20-1 - previous season
  2: 'current',   // Season 20-2 - current season
  3: 'upcoming'   // Season 20-3 - upcoming season
}

// Function to determine current season based on date
const getCurrentSeason = () => {
  const now = new Date()
  const gmtPlus9 = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // Convert to GMT+9
  
  for (const [season, dates] of Object.entries(seasonDates)) {
    if (gmtPlus9 >= dates.start && gmtPlus9 <= dates.end) {
      return parseInt(season)
    }
  }
  
  // If not in any season, return the most recent past season or default to 1
  if (gmtPlus9 < seasonDates[1].start) return 1
  if (gmtPlus9 > seasonDates[3].end) return 3
  
  return 1
}

// Set active season based on current date
activeSeason.value = getCurrentSeason()

// Function to check if current season has data
const hasSeasonData = (season: number) => {
  return seasonConfigurations[season as keyof typeof seasonConfigurations]?.hasData || false
}

// Function to get season display name
const getSeasonDisplayName = (season: number) => {
  return `20-${season}`
}

// Function to get season type
const getSeasonType = (season: number) => {
  return seasonTypes[season as keyof typeof seasonTypes] || 'unknown'
}

// Function to get season status message
const getSeasonStatusMessage = (season: number) => {
  const seasonType = getSeasonType(season)
  const hasData = hasSeasonData(season)
  
  switch (seasonType) {
    case 'previous':
      return hasData ? 'Previous Season - Data Available' : 'Previous Season - No Data'
    case 'current':
      return hasData ? 'Current Season - Data Available' : 'Current Season - Coming Soon'
    case 'upcoming':
      return 'Upcoming Season - No Data Available'
    default:
      return 'Unknown Season'
  }
}

// Function to get season status icon
const getSeasonStatusIcon = (season: number) => {
  const seasonType = getSeasonType(season)
  const hasData = hasSeasonData(season)
  
  switch (seasonType) {
    case 'previous':
      return hasData ? '📊' : '📈'
    case 'current':
      return hasData ? '📊' : '⏳'
    case 'upcoming':
      return '🔮'
    default:
      return '❓'
  }
}

// Function to get season dates for display
const getSeasonDates = (season: number) => {
  const dates = seasonDates[season as keyof typeof seasonDates]
  if (!dates) return 'Unknown dates'
  
  const startDate = dates.start.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: '2-digit' 
  })
  const endDate = dates.end.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: '2-digit' 
  })
  
  return `${startDate} - ${endDate}`
}

// Loading state for season selection
const isSeasonLoading = ref(false)

// Function to automatically fetch data for selected season
const fetchSeasonData = async (season: number) => {
  const config = seasonConfigurations[season as keyof typeof seasonConfigurations]
  
  if (!config || !config.hasData) {
    // Reset analysis state for seasons without data
    resetAnalysis()
    return
  }
  
  // Set loading state
  isSeasonLoading.value = true
  
  // Set the spreadsheet configuration for the selected season
  sheetsState.spreadsheetId = config.spreadsheetId
  sheetsState.range = config.range
  
  // Automatically fetch data for the season
  try {
    await fetchFromGoogleSheets()
  } catch (error) {
    console.error('Error fetching season data:', error)
  } finally {
    // Clear loading state
    isSeasonLoading.value = false
  }
}

// Watch for active season changes and fetch data automatically
watch(activeSeason, (newSeason) => {
  fetchSeasonData(newSeason)
})

// Boss schedule data based on the image
const bossSchedule = {
  1: { // Season 20-1
    1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
    2: null, // Empty
    3: { name: 'Living Abyss', image: '/img/Living_Licorice_Abyss.webp' }
  },
  2: { // Season 20-2 (currently active)
    1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
    2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
    3: null // Empty
  },
  3: { // Season 20-3
    1: null, // Empty
    2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
    3: { name: 'Living Abyss', image: '/img/Living_Licorice_Abyss.webp' }
  }
}

// Method to get boss for specific season and position
const getBossForSeason = (season: number, position: number) => {
  const seasonData = bossSchedule[season as keyof typeof bossSchedule]
  if (!seasonData) return null
  return seasonData[position as keyof typeof seasonData] || null
}

// Ticket status helper methods - Season 20-1 only has Red Velvet Dragon and Living Abyss
const getTicketStatusClass = (player: any) => {
  const ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles // Avatar of Destiny not in Season 20-1
  if (ticketsUsed >= 18) return 'ticket-excellent'
  if (ticketsUsed >= 15) return 'ticket-good'
  if (ticketsUsed >= 10) return 'ticket-warning'
  return 'ticket-poor'
}

const getTicketStatusText = (player: any) => {
  const ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles // Avatar of Destiny not in Season 20-1
  if (ticketsUsed >= 18) return 'Yay'
  if (ticketsUsed >= 15) return 'Slothful'
  return 'At risk of disposal'
}

// Get correct guild rank for specific players
const getPlayerGuildRank = (playerName: string) => {
  if (playerName === 'Bestoutuber') return 'Leader'
  if (playerName === 'brownmascara') return 'Officer'
  return 'Member'
}

// Player preview expand/collapse
const showAllPlayers = ref(false)
const displayedPlayers = computed(() => showAllPlayers.value ? analysisState.battleData : analysisState.previewData)
const toggleShowAllPlayers = () => { showAllPlayers.value = !showAllPlayers.value }
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

    <!-- Guild Battle Schedule Section -->
    <section class="schedule-section">
      <div class="schedule-container">
        <div class="schedule-header">
          <h2 class="schedule-title">Boss Schedule</h2>
          <p class="schedule-subtitle">Destiny's Flight 20</p>
          <p class="schedule-note">Season times are to GMT+9</p>
        </div>

        <div class="schedule-grid">
          <!-- Season Headers -->
          <div class="season-headers">
            <div 
              class="season-header" 
              :class="{ active: activeSeason === 1 }"
              @click="activeSeason = 1"
            >
              <div class="season-name">Season 20-1</div>
              <div class="season-dates">08.07.25 - 08.13.25</div>
              <div v-if="activeSeason === 1" class="current-indicator">{{ getSeasonStatusIcon(1) }} {{ getSeasonStatusMessage(1) }}</div>
              <div v-if="!hasSeasonData(1)" class="coming-soon-indicator">{{ getSeasonStatusIcon(1) }} {{ getSeasonStatusMessage(1) }}</div>
            </div>
            <div 
              class="season-header" 
              :class="{ active: activeSeason === 2 }"
              @click="activeSeason = 2"
            >
              <div class="season-name">Season 20-2</div>
              <div class="season-dates">08.14.25 - 08.20.25</div>
              <div v-if="activeSeason === 2" class="current-indicator">{{ getSeasonStatusIcon(2) }} {{ getSeasonStatusMessage(2) }}</div>
              <div v-if="!hasSeasonData(2)" class="coming-soon-indicator">{{ getSeasonStatusIcon(2) }} {{ getSeasonStatusMessage(2) }}</div>
            </div>
            <div 
              class="season-header" 
              :class="{ active: activeSeason === 3 }"
              @click="activeSeason = 3"
            >
              <div class="season-name">Season 20-3</div>
              <div class="season-dates">08.21.25 - 08.27.25</div>
              <div v-if="activeSeason === 3" class="current-indicator">{{ getSeasonStatusIcon(3) }} {{ getSeasonStatusMessage(3) }}</div>
              <div v-if="!hasSeasonData(3)" class="coming-soon-indicator">{{ getSeasonStatusIcon(3) }} {{ getSeasonStatusMessage(3) }}</div>
            </div>
          </div>

          <!-- Boss Schedule Grid -->
          <div class="boss-schedule">
            <!-- Row 1: Red Velvet Dragon -->
            <div class="boss-row">
              <div class="boss-cell" v-if="getBossForSeason(1, 1)">
                <img :src="getBossForSeason(1, 1)?.image" :alt="getBossForSeason(1, 1)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(1, 1)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
              
              <div class="boss-cell" v-if="getBossForSeason(2, 1)">
                <img :src="getBossForSeason(2, 1)?.image" :alt="getBossForSeason(2, 1)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(2, 1)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
              
              <div class="boss-cell" v-if="getBossForSeason(3, 1)">
                <img :src="getBossForSeason(3, 1)?.image" :alt="getBossForSeason(3, 1)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(3, 1)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
            </div>

            <!-- Row 2: Avatar of Destiny -->
            <div class="boss-row">
              <div class="boss-cell" v-if="getBossForSeason(1, 2)">
                <img :src="getBossForSeason(1, 2)?.image" :alt="getBossForSeason(1, 2)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(1, 2)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
              
              <div class="boss-cell" v-if="getBossForSeason(2, 2)">
                <img :src="getBossForSeason(2, 2)?.image" :alt="getBossForSeason(2, 2)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(2, 2)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
              
              <div class="boss-cell" v-if="getBossForSeason(3, 2)">
                <img :src="getBossForSeason(3, 2)?.image" :alt="getBossForSeason(3, 2)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(3, 2)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
            </div>

            <!-- Row 3: Living Abyss -->
            <div class="boss-row">
              <div class="boss-cell" v-if="getBossForSeason(1, 3)">
                <img :src="getBossForSeason(1, 3)?.image" :alt="getBossForSeason(1, 3)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(1, 3)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
              
              <div class="boss-cell" v-if="getBossForSeason(2, 3)">
                <img :src="getBossForSeason(2, 3)?.image" :alt="getBossForSeason(2, 3)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(2, 3)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
              
              <div class="boss-cell" v-if="getBossForSeason(3, 3)">
                <img :src="getBossForSeason(3, 3)?.image" :alt="getBossForSeason(3, 3)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(3, 3)?.name }}</div>
              </div>
              <div class="boss-cell empty" v-else></div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="schedule-pagination">
            <button 
              v-for="season in 3" 
              :key="season"
              @click="activeSeason = season"
              class="page-button"
              :class="{ active: activeSeason === season }"
            >
              {{ season }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Season Loading Section -->
    <section v-if="isSeasonLoading" class="loading-section">
      <div class="container">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <h2 class="loading-title">Loading Season Data...</h2>
          <p class="loading-subtitle">Fetching battle analysis data for Season {{ getSeasonDisplayName(activeSeason) }}</p>
          <div class="loading-details">
            <div class="loading-detail">
              <span class="loading-icon">📊</span>
              <span>Connecting to Google Sheets</span>
            </div>
            <div class="loading-detail">
              <span class="loading-icon">⚔️</span>
              <span>Processing battle data</span>
            </div>
            <div class="loading-detail">
              <span class="loading-icon">📈</span>
              <span>Calculating statistics</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Season Status Section -->
    <section v-if="!hasSeasonData(activeSeason) && !isSeasonLoading" class="coming-soon-section">
      <div class="container">
        <div class="coming-soon-content">
          <div class="coming-soon-icon">{{ getSeasonStatusIcon(activeSeason) }}</div>
          <h2 class="coming-soon-title">{{ getSeasonType(activeSeason) === 'current' ? 'Coming Soon!' : getSeasonType(activeSeason) === 'upcoming' ? 'Upcoming Season' : 'No Data Available' }}</h2>
          <p class="coming-soon-subtitle">
            <span v-if="getSeasonType(activeSeason) === 'current'">
              Battle analysis data for Season {{ getSeasonDisplayName(activeSeason) }} will be available soon.
            </span>
            <span v-else-if="getSeasonType(activeSeason) === 'upcoming'">
              Season {{ getSeasonDisplayName(activeSeason) }} is an upcoming season. No data is available yet.
            </span>
            <span v-else>
              No battle analysis data is available for Season {{ getSeasonDisplayName(activeSeason) }}.
            </span>
          </p>
          <div class="coming-soon-info">
            <div class="info-card" v-if="getSeasonType(activeSeason) === 'current'">
              <div class="info-icon">📊</div>
              <h3>Data Collection</h3>
              <p>We're currently collecting battle data for this season. Check back later for detailed analysis.</p>
            </div>
            <div class="info-card" v-if="getSeasonType(activeSeason) === 'current'">
              <div class="info-icon">🎯</div>
              <h3>Boss Schedule</h3>
              <p>View the boss schedule above to see which bosses will appear in this season.</p>
            </div>
            <div class="info-card" v-if="getSeasonType(activeSeason) === 'current'">
              <div class="info-icon">📈</div>
              <h3>Performance Tracking</h3>
              <p>Once data is available, you'll be able to track guild performance and ticket usage.</p>
            </div>
            <div class="info-card" v-if="getSeasonType(activeSeason) === 'upcoming'">
              <div class="info-icon">🔮</div>
              <h3>Future Season</h3>
              <p>This season hasn't started yet. Check the boss schedule above to see what's planned.</p>
            </div>
            <div class="info-card" v-if="getSeasonType(activeSeason) === 'upcoming'">
              <div class="info-icon">📅</div>
              <h3>Season Dates</h3>
              <p>Season {{ getSeasonDisplayName(activeSeason) }} will run from {{ getSeasonDates(activeSeason) }}.</p>
            </div>
            <div class="info-card" v-if="getSeasonType(activeSeason) === 'upcoming'">
              <div class="info-icon">🎯</div>
              <h3>Preparation</h3>
              <p>Use this time to prepare your guild for the upcoming battles and strategize your approach.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section" v-if="hasSeasonData(activeSeason) && analysisState.analysisComplete">
      <div class="container">
        <div class="results-header">
          <h2 class="section-title">Battle Analysis Results - Season {{ getSeasonDisplayName(activeSeason) }}</h2>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ analysisState.battleStats?.totalPlayers || 0 }}</div>
            <div class="stat-label">Total Players</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.highestDamage || 0) }}</div>
            <div class="stat-label">Highest Season Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.averageDamage || 0) }}</div>
            <div class="stat-label">Average Season Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ analysisState.battleStats?.totalBattlesDone || 0 }}</div>
            <div class="stat-label">Total Battles Done</div>
          </div>
        </div>

        <!-- Ticket Statistics Section -->
        <div class="ticket-stats-section">
          <h3>🎫 Ticket Usage Statistics</h3>
          <div class="ticket-stats-grid">
            <div class="ticket-stat-card">
              <div class="ticket-stat-header">
                <div class="ticket-icon">🎫</div>
                <h4>Total Tickets</h4>
              </div>
              <div class="ticket-stat-content">
                <div class="ticket-stat-main">
                  <span class="ticket-number">{{ analysisState.battleStats?.ticketStats.totalTicketsUsed || 0 }}</span>
                  <span class="ticket-max">/ {{ (analysisState.battleStats?.totalPlayers || 0) * 18 }}</span>
                </div>
                <div class="ticket-stat-subtitle">Tickets Used</div>
              </div>
            </div>

            <div class="ticket-stat-card missed">
              <div class="ticket-stat-header">
                <div class="ticket-icon">⚠️</div>
                <h4>Missed Tickets</h4>
              </div>
              <div class="ticket-stat-content">
                <div class="ticket-stat-main">
                  <span class="ticket-number">{{ analysisState.battleStats?.ticketStats.totalTicketsMissed || 0 }}</span>
                </div>
                <div class="ticket-stat-subtitle">Tickets Lost</div>
              </div>
            </div>

            <div class="ticket-stat-card below-min">
              <div class="ticket-stat-header">
                <div class="ticket-icon">📉</div>
                <h4>Below Minimum</h4>
              </div>
              <div class="ticket-stat-content">
                <div class="ticket-stat-main">
                  <span class="ticket-number">{{ analysisState.battleStats?.ticketStats.playersBelowMinimum || 0 }}</span>
                </div>
                <div class="ticket-stat-subtitle">Players (< 15 tickets)</div>
              </div>
            </div>

            <div class="ticket-stat-card average">
              <div class="ticket-stat-header">
                <div class="ticket-icon">📊</div>
                <h4>Average Usage</h4>
              </div>
              <div class="ticket-stat-content">
                <div class="ticket-stat-main">
                  <span class="ticket-number">{{ analysisState.battleStats?.ticketStats.averageTicketsUsed || 0 }}</span>
                </div>
                <div class="ticket-stat-subtitle">Tickets per Player</div>
              </div>
            </div>
          </div>

          <!-- Ticket Usage by Boss -->
          <div class="ticket-boss-breakdown">
            <h4>Ticket Usage by Boss</h4>
            <div class="ticket-boss-grid">
              <div class="ticket-boss-item red-velvet">
                <div class="boss-ticket-icon">🐉</div>
                <div class="boss-ticket-info">
                  <div class="boss-ticket-name">Red Velvet Dragon</div>
                  <div class="boss-ticket-count">{{ analysisState.battleStats?.ticketStats.ticketsUsedByBoss.redVelvet || 0 }} tickets</div>
                </div>
              </div>
              <div class="ticket-boss-item avatar">
                <div class="boss-ticket-icon">👁️</div>
                <div class="boss-ticket-info">
                  <div class="boss-ticket-name">Avatar of Destiny</div>
                  <div class="boss-ticket-count">{{ analysisState.battleStats?.ticketStats.ticketsUsedByBoss.avatar || 0 }} tickets</div>
                </div>
              </div>
              <div class="ticket-boss-item living-abyss">
                <div class="boss-ticket-icon">🔷</div>
                <div class="boss-ticket-info">
                  <div class="boss-ticket-name">Living Abyss</div>
                  <div class="boss-ticket-count">{{ analysisState.battleStats?.ticketStats.ticketsUsedByBoss.livingAbyss || 0 }} tickets</div>
                </div>
              </div>
            </div>
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
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.redVelvetStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.redVelvetStats.averageDamage || 0) }}</span>
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
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.avatarStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.avatarStats.averageDamage || 0) }}</span>
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
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.livingAbyssStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(analysisState.battleStats?.livingAbyssStats.averageDamage || 0) }}</span>
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
          <div class="toggle-row">
            <button @click="toggleShowAllPlayers" class="export-button">
              {{ showAllPlayers ? 'Show Top 5' : 'Show All Players' }}
            </button>
          </div>
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
                  <th>Tickets Used</th>
                  <th>Guild Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in displayedPlayers" :key="player.rank">
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
                      <div class="damage-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage) }}</div>
                      <div class="battles-count">x{{ player.redVelvetDragon.battles }}</div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{ BattleAnalyzer.formatDamage(player.avatarOfDestiny.damage) }}</div>
                      <div class="battles-count">x{{ player.avatarOfDestiny.battles }}</div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{ BattleAnalyzer.formatDamage(player.livingAbyss.damage) }}</div>
                      <div class="battles-count">x{{ player.livingAbyss.battles }}</div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage) }}</div>
                      <div class="battles-count">x{{ player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles }}</div>
                    </div>
                  </td>
                  <td class="ticket-cell">
                    <div class="ticket-info">
                      <div class="ticket-count" :class="getTicketStatusClass(player)">
                        {{ player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles }}/18
                      </div>
                      <div class="ticket-status" :class="getTicketStatusClass(player)">
                        {{ getTicketStatusText(player) }}
                      </div>
                    </div>
                  </td>
                  <td class="rank-cell">
                    <span class="guild-rank-badge" :class="BattleAnalyzer.getGuildRankBadgeClass(getPlayerGuildRank(player.playerName))">
                      {{ getPlayerGuildRank(player.playerName) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="table-note">
            {{ showAllPlayers ? `Showing all ${analysisState.battleData.length} players.` : 'Showing top 5 players.' }} Download the full Excel report for complete data.
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

/* optional small layout tweak for toggle row */
.toggle-row {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 12px 0;
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

/* Loading Section Styles */
.loading-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%);
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.loading-spinner {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4caf50, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  line-height: 1.6;
}

.loading-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.loading-detail {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.loading-detail:nth-child(1) { animation-delay: 0.2s; }
.loading-detail:nth-child(2) { animation-delay: 0.4s; }
.loading-detail:nth-child(3) { animation-delay: 0.6s; }

.loading-icon {
  font-size: 1.5rem;
  width: 30px;
  text-align: center;
}

.loading-detail span:last-child {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
