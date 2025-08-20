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

// All available seasons with their configurations (only after 16-4, excluding "Copy of 18-1")
const allSeasons = [
  { id: '17-1', name: 'Season 17-1', hasData: true },
  { id: '17-2', name: 'Season 17-2', hasData: true },
  { id: '17-3', name: 'Season 17-3', hasData: true },
  { id: '17-4', name: 'Season 17-4', hasData: true },
  { id: '18-1', name: 'Season 18-1', hasData: true },
  { id: '20-1', name: 'Season 20-1', hasData: true },
  { id: '20-2', name: 'Season 20-2', hasData: true }
]

// Season-specific data availability and spreadsheet configurations
const seasonConfigurations = {
  1: { 
    hasData: true,  // Season 20-1 (previous season) has data
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-1!A1:Z100' // Season 20-1 range
  },
  2: { 
    hasData: true, // Season 20-2 (current season) - now has data
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-2!A1:Z100' // Season 20-2 range
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
    await fetchFromGoogleSheets(season)
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

// Ticket status helper methods - Updated for different seasons
const getTicketStatusClass = (player: any, season: number = activeSeason.value) => {
  let ticketsUsed = 0
  
  if (season === 1) {
    // Season 20-1: Red Velvet Dragon and Living Abyss
    ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles
  } else if (season === 2) {
    // Season 20-2: Red Velvet Dragon and Avatar of Destiny
    ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
  } else {
    // Season 20-3: Avatar of Destiny and Living Abyss
    ticketsUsed = player.avatarOfDestiny.battles + player.livingAbyss.battles
  }
  
  if (ticketsUsed >= 18) return 'ticket-excellent'
  if (ticketsUsed >= 15) return 'ticket-good'
  if (ticketsUsed >= 10) return 'ticket-warning'
  return 'ticket-poor'
}

const getTicketStatusText = (player: any, season: number = activeSeason.value) => {
  let ticketsUsed = 0
  
  if (season === 1) {
    // Season 20-1: Red Velvet Dragon and Living Abyss
    ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles
  } else if (season === 2) {
    // Season 20-2: Red Velvet Dragon and Avatar of Destiny
    ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
  } else {
    // Season 20-3: Avatar of Destiny and Living Abyss
    ticketsUsed = player.avatarOfDestiny.battles + player.livingAbyss.battles
  }
  
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

// Hall of Glory data
const hallOfGloryData = ref({
  bossChampions: {
    redVelvet: { player: null as string | null, damage: 0, season: '', tickets: 0 },
    avatar: { player: null as string | null, damage: 0, season: '', tickets: 0 },
    livingAbyss: { player: null as string | null, damage: 0, season: '', tickets: 0 }
  },
  seasonChampions: [] as any[],
  isLoading: false
})

// Function to fetch data for a specific season
const fetchSeasonDataForGlory = async (seasonId: string) => {
  try {
    const battlePlayers = await BattleAnalyzer.fetchFromGoogleSheets(
      '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
      `${seasonId}!A1:Z100`
    )
    
    return {
      seasonId,
      players: battlePlayers,
      totalDamage: battlePlayers.reduce((sum: number, player: any) => 
        sum + player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage, 0
      )
    }
  } catch (error) {
    console.error(`Error fetching data for season ${seasonId}:`, error)
    return null
  }
}

// Function to load all Hall of Glory data
const loadHallOfGloryData = async () => {
  hallOfGloryData.value.isLoading = true
  
  try {
    const seasonDataPromises = allSeasons.map(season => fetchSeasonDataForGlory(season.id))
    const seasonResults = await Promise.all(seasonDataPromises)
    const validSeasonData = seasonResults.filter(data => data !== null)
    
    // Calculate boss champions
    const bossChampions = {
      redVelvet: { player: null as string | null, damage: 0, season: '', tickets: 0 },
      avatar: { player: null as string | null, damage: 0, season: '', tickets: 0 },
      livingAbyss: { player: null as string | null, damage: 0, season: '', tickets: 0 }
    }
    
    // Calculate season champions
    const seasonChampions: any[] = []
    
              validSeasonData.forEach(seasonData => {
       // Find best player for this season (player with highest total damage)
       let bestPlayer: any = null
       let bestTotalDamage = 0
       
       seasonData.players.forEach((player: any) => {
         const playerTotalDamage = player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage
         if (playerTotalDamage > bestTotalDamage) {
           bestTotalDamage = playerTotalDamage
           bestPlayer = player
         }
       })
       
       if (bestPlayer) {
         const ticketsUsed = bestPlayer.redVelvetDragon.battles + bestPlayer.avatarOfDestiny.battles + bestPlayer.livingAbyss.battles
         
         seasonChampions.push({
           seasonId: seasonData.seasonId,
           seasonName: seasonData.seasonId,
           playerName: bestPlayer.playerName,
           totalDamage: bestTotalDamage,
           ticketsUsed
         })
       }
      
      // Check for boss champions - look through ALL players in this season, not just the best overall
      seasonData.players.forEach(player => {
        // Check Red Velvet Dragon champion
        if (player.redVelvetDragon.damage > bossChampions.redVelvet.damage) {
          bossChampions.redVelvet = {
            player: player.playerName,
            damage: player.redVelvetDragon.damage,
            season: seasonData.seasonId,
            tickets: player.redVelvetDragon.battles
          }
        }
        
        // Check Avatar of Destiny champion
        if (player.avatarOfDestiny.damage > bossChampions.avatar.damage) {
          bossChampions.avatar = {
            player: player.playerName,
            damage: player.avatarOfDestiny.damage,
            season: seasonData.seasonId,
            tickets: player.avatarOfDestiny.battles
          }
        }
        
        // Check Living Abyss champion
        if (player.livingAbyss.damage > bossChampions.livingAbyss.damage) {
          bossChampions.livingAbyss = {
            player: player.playerName,
            damage: player.livingAbyss.damage,
            season: seasonData.seasonId,
            tickets: player.livingAbyss.battles
          }
        }
      })
    })
    
    // Sort season champions by total damage
    seasonChampions.sort((a, b) => b.totalDamage - a.totalDamage)
    
    hallOfGloryData.value = {
      bossChampions,
      seasonChampions: seasonChampions.slice(0, 3), // Top 3 seasons
      isLoading: false
    }
    
  } catch (error) {
    console.error('Error loading Hall of Glory data:', error)
    hallOfGloryData.value.isLoading = false
  }
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
             <span class="gradient-text">Guild site & Battle</span>
             <br>Analyzer
           </h1>
            <p class="hero-subtitle">
              Welcome to CCT! 🦔🦊
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

     <!-- Guild Information & Requirements Section -->
     <section class="guild-info-section">
       <div class="container">
         <div class="guild-info-header">
           <h2 class="section-title">Guild Information & Requirements</h2>
         </div>
         
         <div class="guild-info-grid">
           <!-- Information Box -->
           <div class="info-box">
             <h3 class="box-title">📋 INFORMATION</h3>
             <div class="info-list">
               <div class="info-item">
                 <span class="info-icon">🌐</span>
                 <span class="info-text">HOLLYBERRY SERVER</span>
               </div>
               <div class="info-item">
                 <span class="info-icon">⭐</span>
                 <span class="info-text">LEVEL 70 GUILD</span>
               </div>
                               <div class="info-item">
                  <div class="info-icon">
                    <img src="/img/logo_gm3.png" alt="GM3 Logo" />
                  </div>
                  <span class="info-text">GRANDMASTER 3 - #40+</span>
                </div>
               <div class="info-item">
                 <span class="info-icon">👑</span>
                 <span class="info-text">TOP 1% ALLIANCE</span>
               </div>
               <div class="info-item">
                 <span class="info-icon">💎</span>
                 <span class="info-text">114/114 RELICS - LEVEL 11+</span>
               </div>
             </div>
           </div>

           <!-- Requirements Box -->
           <div class="requirements-box">
             <h3 class="box-title">🎯 REQUIREMENTS</h3>
             <div class="requirements-list">
                               <div class="requirement-item">
                  <div class="requirement-icon">
                    <img src="/img/Red_Velvet_Dragon.webp" alt="Red Velvet Dragon" />
                  </div>
                  <span class="requirement-text">8 BIL+ RED VELVET DRAGON</span>
                </div>
                <div class="requirement-item">
                  <div class="requirement-icon">
                    <img src="/img/Living_Licorice_Abyss.webp" alt="Living Licorice Abyss" />
                  </div>
                  <span class="requirement-text">16 BIL+ LIVING ABYSS</span>
                </div>
                <div class="requirement-item">
                  <div class="requirement-icon">
                    <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny" />
                  </div>
                  <span class="requirement-text">3.5 BIL+ AVATAR OF DESTINY</span>
                </div>
               <div class="requirement-item">
                 <span class="requirement-icon">📊</span>
                 <span class="requirement-text">MUST BE CONSISTENT AT 100+ LVLS</span>
               </div>
               <div class="requirement-item">
                 <span class="requirement-icon">🏰</span>
                 <span class="requirement-text">KINGDOM LEVEL 50+</span>
               </div>
               <div class="requirement-item">
                 <span class="requirement-icon">🤝</span>
                 <span class="requirement-text">PARTAKE IN ALLIANCE + DONATE RELICS</span>
               </div>
               <div class="requirement-item">
                 <span class="requirement-icon">🎫</span>
                 <span class="requirement-text">USE 15/18 TICKETS</span>
               </div>
               <div class="requirement-item">
                 <span class="requirement-icon">⚔️</span>
                 <span class="requirement-text">PARTICIPATE IN GUILD EVENTS</span>
               </div>
             </div>
           </div>

           <!-- Other Box -->
           <div class="other-box">
             <h3 class="box-title">💬 OTHER</h3>
             <div class="other-content">
               <div class="other-item">
                 <span class="other-icon">⚠️</span>
                 <span class="other-text">PLEASE LET US KNOW ABOUT YOUR SITUATION IF YOU WILL BE INACTIVE!</span>
               </div>
               <div class="other-item">
                 <span class="other-icon">🤗</span>
                 <span class="other-text">DON'T BE AFRAID TO APPLY EVEN IF YOU'RE A BIT BELOW THE REQUIREMENTS! WE'RE HERE TO HELP!</span>
               </div>
             </div>
           </div>
                   </div>
        </div>
      </section>

                       <!-- Hall of Glory Section -->
       <section class="hall-of-glory-section">
         <div class="container">
           <h2 class="section-title">🏆 Hall of Glory</h2>
           <p class="section-subtitle">All-Time Highest Guild Battle Performers</p>
           
           <!-- Load Button -->
           <div class="glory-load-section" v-if="!hallOfGloryData.isLoading && hallOfGloryData.seasonChampions.length === 0">
             <button @click="loadHallOfGloryData" class="glory-load-button">
               <span class="load-icon">📊</span>
               <span>Load All-Time Champions</span>
             </button>
                           <p class="load-note">Load data from seasons 17-1 to 20-1</p>
           </div>
           
           <!-- Loading State -->
           <div class="glory-loading" v-if="hallOfGloryData.isLoading">
             <div class="loading-spinner">
               <div class="spinner"></div>
             </div>
             <h3>Loading Hall of Glory Data...</h3>
             <p>Fetching data from {{ allSeasons.length }} seasons</p>
           </div>
           
           <!-- Boss Champions Grid -->
           <div class="glory-grid" v-if="!hallOfGloryData.isLoading && hallOfGloryData.seasonChampions.length > 0">
             <!-- Red Velvet Dragon Champion -->
             <div class="glory-card red-velvet" v-if="hallOfGloryData.bossChampions.redVelvet.player">
               <div class="glory-header">
                 <div class="boss-icon">
                   <img src="/img/Red_Velvet_Dragon.webp" alt="Red Velvet Dragon" />
                 </div>
                 <h3>Red Velvet Dragon</h3>
                 <div class="champion-badge">🥇 Champion</div>
               </div>
               <div class="champion-info">
                 <div class="champion-name">{{ hallOfGloryData.bossChampions.redVelvet.player }}</div>
                 <div class="champion-damage">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.redVelvet.damage) }}</div>
                 <div class="champion-details">
                   <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.redVelvet.tickets }}/18 Tickets</span>
                   <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.redVelvet.season }}</span>
                 </div>
               </div>
               <div class="glory-stats">
                 <div class="stat-item">
                   <span class="stat-label">Guild Record:</span>
                   <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.redVelvet.damage) }}</span>
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Season:</span>
                   <span class="stat-value">{{ hallOfGloryData.bossChampions.redVelvet.season }}</span>
                 </div>
               </div>
             </div>

             <!-- Avatar of Destiny Champion -->
             <div class="glory-card avatar" v-if="hallOfGloryData.bossChampions.avatar.player">
               <div class="glory-header">
                 <div class="boss-icon">
                   <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny" />
                 </div>
                 <h3>Avatar of Destiny</h3>
                 <div class="champion-badge">🥇 Champion</div>
               </div>
               <div class="champion-info">
                 <div class="champion-name">{{ hallOfGloryData.bossChampions.avatar.player }}</div>
                 <div class="champion-damage">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.avatar.damage) }}</div>
                 <div class="champion-details">
                   <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.avatar.tickets }}/18 Tickets</span>
                   <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.avatar.season }}</span>
                 </div>
               </div>
               <div class="glory-stats">
                 <div class="stat-item">
                   <span class="stat-label">Guild Record:</span>
                   <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.avatar.damage) }}</span>
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Season:</span>
                   <span class="stat-value">{{ hallOfGloryData.bossChampions.avatar.season }}</span>
                 </div>
               </div>
             </div>

             <!-- Living Abyss Champion -->
             <div class="glory-card living-abyss" v-if="hallOfGloryData.bossChampions.livingAbyss.player">
               <div class="glory-header">
                 <div class="boss-icon">
                   <img src="/img/Living_Licorice_Abyss.webp" alt="Living Licorice Abyss" />
                 </div>
                 <h3>Living Abyss</h3>
                 <div class="champion-badge">🥇 Champion</div>
               </div>
               <div class="champion-info">
                 <div class="champion-name">{{ hallOfGloryData.bossChampions.livingAbyss.player }}</div>
                 <div class="champion-damage">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.livingAbyss.damage) }}</div>
                 <div class="champion-details">
                   <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.livingAbyss.tickets }}/18 Tickets</span>
                   <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.livingAbyss.season }}</span>
                 </div>
               </div>
               <div class="glory-stats">
                 <div class="stat-item">
                   <span class="stat-label">Guild Record:</span>
                   <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.livingAbyss.damage) }}</span>
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Season:</span>
                   <span class="stat-value">{{ hallOfGloryData.bossChampions.livingAbyss.season }}</span>
                 </div>
               </div>
             </div>
           </div>

           <!-- Overall Season Champions -->
           <div class="season-champions" v-if="!hallOfGloryData.isLoading && hallOfGloryData.seasonChampions.length > 0">
             <h3 class="champions-title">🏅 Season Champions</h3>
             <div class="champions-grid">
               <div class="season-champion" v-for="champion in hallOfGloryData.seasonChampions" :key="champion.seasonId">
                 <div class="season-info">
                   <div class="season-name">Season {{ champion.seasonName }}</div>
                   <div class="champion-name">{{ champion.playerName }}</div>
                 </div>
                 <div class="champion-stats">
                   <div class="total-damage">{{ BattleAnalyzer.formatDamage(champion.totalDamage) }}</div>
                   <div class="ticket-usage">{{ champion.ticketsUsed }}/18</div>
                 </div>
                 <div class="champion-badge">👑</div>
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
            <!-- Row 1: Red Velvet Dragon positions -->
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
            
            <!-- Row 2: Avatar of Destiny positions -->
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
            
            <!-- Row 3: Living Abyss positions -->
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

                          <!-- Mobile: Show only selected season -->
              <div class="boss-schedule-mobile">
                <div class="mobile-boss-list">
                  <div
                    v-for="position in [1, 2, 3]"
                    :key="position"
                    class="mobile-boss-item"
                    v-if="getBossForSeason(activeSeason, position)"
                  >
                    <img :src="getBossForSeason(activeSeason, position)?.image" :alt="getBossForSeason(activeSeason, position)?.name" class="mobile-boss-image">
                    <div class="mobile-boss-name">{{ getBossForSeason(activeSeason, position)?.name }}</div>
                  </div>
                <div v-if="!getBossForSeason(activeSeason, 1) && !getBossForSeason(activeSeason, 2) && !getBossForSeason(activeSeason, 3)" class="mobile-no-bosses">
                  <div class="no-bosses-icon">📅</div>
                  <div class="no-bosses-text">No bosses scheduled for this season</div>
                </div>
              </div>
            </div>
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
          
          <!-- Desktop Table -->
          <div class="table-container desktop-table">
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
                      <div class="ticket-count" :class="getTicketStatusClass(player, activeSeason)">
                        {{ activeSeason === 1 ? (player.redVelvetDragon.battles + player.livingAbyss.battles) : 
                           activeSeason === 2 ? (player.redVelvetDragon.battles + player.avatarOfDestiny.battles) : 
                           (player.avatarOfDestiny.battles + player.livingAbyss.battles) }}/18
                      </div>
                      <div class="ticket-status" :class="getTicketStatusClass(player, activeSeason)">
                        {{ getTicketStatusText(player, activeSeason) }}
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

          <!-- Mobile Cards -->
          <div class="mobile-players">
            <div v-for="player in displayedPlayers" :key="player.rank" class="mobile-player-card">
              <div class="mobile-player-header">
                <div class="mobile-rank-badge" :class="BattleAnalyzer.getRankBadgeClass(player.rank)">
                  #{{ player.rank }}
                </div>
                <div class="mobile-player-name">{{ player.playerName }}</div>
                <div class="mobile-guild-rank" :class="BattleAnalyzer.getGuildRankBadgeClass(getPlayerGuildRank(player.playerName))">
                  {{ getPlayerGuildRank(player.playerName) }}
                </div>
              </div>
              
              <div class="mobile-boss-damage">
                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">🐉</div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage) }}</div>
                    <div class="mobile-battles-count">x{{ player.redVelvetDragon.battles }}</div>
                  </div>
                </div>
                
                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">👁️</div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.avatarOfDestiny.damage) }}</div>
                    <div class="mobile-battles-count">x{{ player.avatarOfDestiny.battles }}</div>
                  </div>
                </div>
                
                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">🔷</div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.livingAbyss.damage) }}</div>
                    <div class="mobile-battles-count">x{{ player.livingAbyss.battles }}</div>
                  </div>
                </div>
              </div>
              
              <div class="mobile-total-section">
                <div class="mobile-total-damage">
                  <div class="mobile-total-label">Season Total:</div>
                  <div class="mobile-total-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage) }}</div>
                </div>
                <div class="mobile-ticket-status" :class="getTicketStatusClass(player, activeSeason)">
                  <div class="mobile-ticket-count">{{ activeSeason === 1 ? (player.redVelvetDragon.battles + player.livingAbyss.battles) : 
                     activeSeason === 2 ? (player.redVelvetDragon.battles + player.avatarOfDestiny.battles) : 
                     (player.avatarOfDestiny.battles + player.livingAbyss.battles) }}/18</div>
                  <div class="mobile-ticket-text">{{ getTicketStatusText(player, activeSeason) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <p class="table-note">
            {{ showAllPlayers ? `Showing all ${analysisState.battleData.length} players.` : 'Showing top 5 players.' }} 
          </p>
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

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 6rem 0;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.guild-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.guild-logo-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 215, 0, 0.3);
}

.guild-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.guild-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.guild-info .info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-label {
  font-weight: 600;
  color: #ffd700;
  min-width: 80px;
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.sonic-illustration {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sonic-character {
  font-size: 8rem;
  animation: bounce 2s ease-in-out infinite;
  z-index: 2;
}

.rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring {
  position: absolute;
  font-size: 2rem;
  animation: rotate 4s linear infinite;
}

.ring-1 {
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.ring-2 {
  top: -50px;
  right: -50px;
  animation-delay: 1s;
}

.ring-3 {
  bottom: -50px;
  left: -50px;
  animation-delay: 2s;
}

.chaos-emeralds {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.emerald {
  position: absolute;
  font-size: 1.5rem;
  animation: pulse 3s ease-in-out infinite;
}

.emerald-1 {
  top: -80px;
  left: -80px;
  animation-delay: 0s;
}

.emerald-2 {
  top: -80px;
  right: -80px;
  animation-delay: 1s;
}

.emerald-3 {
  bottom: -80px;
  left: -80px;
  animation-delay: 2s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* Guild Information & Requirements Section */
.guild-info-section {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 60, 0.95) 100%);
  padding: 4rem 0;
  color: white;
  position: relative;
  overflow: hidden;
}

/* Hall of Glory Section */
.hall-of-glory-section {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(40, 20, 60, 0.95) 100%);
  padding: 4rem 0;
  color: white;
  position: relative;
  overflow: hidden;
}

.hall-of-glory-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,215,0,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
  opacity: 0.4;
  pointer-events: none;
}

.hall-of-glory-section .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.hall-of-glory-section .section-title {
  text-align: center;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  font-weight: 500;
}

.glory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.glory-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 215, 0, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transition: all 0.4s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.glory-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--boss-color), var(--boss-color-light));
}

.glory-card.red-velvet {
  --boss-color: #ff4444;
  --boss-color-light: #ff6666;
}

.glory-card.avatar {
  --boss-color: #4444ff;
  --boss-color-light: #6666ff;
}

.glory-card.living-abyss {
  --boss-color: #44ff44;
  --boss-color-light: #66ff66;
}

.glory-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border-color: var(--boss-color);
}

.glory-header {
  margin-bottom: 1.5rem;
}

.glory-header .boss-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.glory-header .boss-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.glory-header h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffd700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.champion-badge {
  display: inline-block;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  text-shadow: none;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.champion-info {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.champion-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.champion-damage {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.champion-details {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.glory-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 700;
  color: #ffd700;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Glory Load Section */
.glory-load-section {
  text-align: center;
  margin: 3rem 0;
}

.glory-load-button {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.glory-load-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.4);
  background: linear-gradient(45deg, #ffed4e, #ffd700);
}

.load-icon {
  font-size: 1.3rem;
}

.load-note {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* Glory Loading */
.glory-loading {
  text-align: center;
  margin: 3rem 0;
  padding: 2rem;
}

.glory-loading h3 {
  font-size: 1.8rem;
  color: #ffd700;
  margin-bottom: 1rem;
}

.glory-loading p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

/* Season Champions */
.season-champions {
  margin-top: 3rem;
}

.champions-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.champions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.season-champion {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  position: relative;
}

.season-champion:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
}

.season-info {
  flex: 1;
}

.season-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.season-champion .champion-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0;
}

.champion-stats {
  text-align: center;
  margin: 0 1rem;
}

.total-damage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.ticket-usage {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.season-champion .champion-badge {
  font-size: 2rem;
  background: none;
  color: #ffd700;
  padding: 0;
  box-shadow: none;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.guild-info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.guild-info-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.guild-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.guild-logo-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 215, 0, 0.3);
}

.guild-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.section-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guild-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.info-box, .requirements-box, .other-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.info-box:hover, .requirements-box:hover, .other-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.3);
}

.box-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #ffd700;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.info-list, .requirements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item, .requirement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.info-item:hover, .requirement-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.info-icon, .requirement-icon {
  font-size: 1.2rem;
  width: 30px;
  text-align: center;
}

.requirement-icon img {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-icon img {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.info-text, .requirement-text {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.other-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.other-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.other-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.other-icon {
  font-size: 1.2rem;
  width: 30px;
  text-align: center;
  margin-top: 0.2rem;
}

.other-text {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 0;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .sonic-illustration {
    width: 200px;
    height: 200px;
  }
  
  .sonic-character {
    font-size: 5rem;
  }
  
  .guild-info-section {
    padding: 2rem 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .guild-info-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .info-box, .requirements-box, .other-box {
    padding: 1.5rem;
  }
  
  .info-text, .requirement-text, .other-text {
    font-size: 0.85rem;
  }
  
  .hall-of-glory-section {
    padding: 2rem 0;
  }
  
  .hall-of-glory-section .section-title {
    font-size: 2.5rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
  
  .glory-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .glory-card {
    padding: 1.5rem;
  }
  
  .glory-header .boss-icon {
    width: 80px;
    height: 80px;
  }
  
  .glory-header h3 {
    font-size: 1.5rem;
  }
  
  .champion-damage {
    font-size: 2rem;
  }
  
  .champions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .season-champion {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .champion-stats {
    margin: 0;
  }
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



/* Season Headers */
.season-headers {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.season-header {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.season-header:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.season-header.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.3));
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}

.season-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.season-dates {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.current-indicator, .coming-soon-indicator {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.current-indicator {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.coming-soon-indicator {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
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
