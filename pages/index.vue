<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
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
  { id: '20-2', name: 'Season 20-2', hasData: true },
  { id: '20-3', name: 'Season 20-3', hasData: true },
  { id: '21-1', name: 'Season 21-1', hasData: true },
  { id: '21-2', name: 'Season 21-2', hasData: true }
]

// Season-specific data availability and spreadsheet configurations
const seasonConfigurations = {
  1: { 
    hasData: true,  // Season 20-1 (previous season) has data
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-1!A1:Z100' // Season 20-1 range
  },
  2: { 
    hasData: true, // Season 20-2 (previous season) - now has data
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-2!A1:Z100' // Season 20-2 range
  },
  3: { 
    hasData: true, // Season 20-3 (season is over) - now has data
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '20-3!A1:Z100' // Season 20-3 range
  },
  21: { 
    hasData: true, // Season 21-1 now has data available
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '21-1!A1:Z100' // Season 21-1 range
  },
  22: { 
    hasData: true, // Season 21-2 now has data available
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '21-2!A1:Z100' // Season 21-2 range
  }
}

// Season types for display purposes
const seasonTypes = {
  1: 'previous',  // Season 20-1 - previous season
  2: 'previous',  // Season 20-2 - previous season  
  3: 'previous',  // Season 20-3 - previous season (now over)
  21: 'previous', // Season 21-1 - previous season (Machine God)
  22: 'current'   // Season 21-2 - current season
}

// Function to determine current season based on date
const getCurrentSeason = () => {
  const now = new Date()
  const gmtPlus9 = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // Convert to GMT+9
  
  for (const season in seasonDates) {
    const dates = seasonDates[season as keyof typeof seasonDates]
    if (gmtPlus9 >= dates.start && gmtPlus9 <= dates.end) {
      return parseInt(season) as unknown as 1 | 2 | 3
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
  if (currentDestinysFlight.value === 21) {
    if (season === 1) return true // Season 21-1 now has data available
    if (season === 2) return true // Season 21-2 now has data available
    if (season === 3 || season === 4) return false // Upcoming, no data
  } else {
    // Destiny's Flight 20: All seasons are previous seasons with data available
    if (season === 1 || season === 2 || season === 3) return true
  }
  return false
}

// Function to get season display name
const getSeasonDisplayName = (season: number) => {
  if (currentDestinysFlight.value === 21) {
    return `21-${season}`
  }
  return `20-${season}`
}

// Function to get season type
const getSeasonType = (season: number) => {
  return seasonTypes[season as keyof typeof seasonTypes] || 'unknown'
}

// Function to get season status message
const getSeasonStatusMessage = (season: number) => {
  if (currentDestinysFlight.value === 21) {
    if (season === 1) return 'Previous Season - Data Available'
    if (season === 2) return 'Current Season - No Data Yet'
    if (season === 3 || season === 4) return 'Upcoming Season - No Data Available'
  } else {
    // Destiny's Flight 20: All seasons are previous seasons with data available
    if (season === 1 || season === 2 || season === 3) return 'Previous Season - Data Available'
  }
  return 'Unknown Status'
}

// Function to get season status icon
const getSeasonStatusIcon = (season: number) => {
  if (currentDestinysFlight.value === 21) {
    if (season === 1) return '📊' // Previous season with data available
    if (season === 2) return '⏳' // Current but no data
    if (season === 3 || season === 4) return '⏳' // Upcoming
  } else {
    // Destiny's Flight 20: All seasons are previous seasons with data available
    if (season === 1 || season === 2 || season === 3) return '📊' // Previous
  }
  return '❓'
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
  let config: any
  
  // Handle Destiny's Flight 21 seasons
  if (currentDestinysFlight.value === 21) {
    // For Destiny's Flight 21, use the 21-1 data for all seasons (since we only have 21-1 data)
    config = seasonConfigurations[21]
  } else {
    config = seasonConfigurations[season as keyof typeof seasonConfigurations]
  }
  
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
    await fetchFromGoogleSheets(season, currentDestinysFlight.value)
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

// Current Destiny's Flight (main season)
const currentDestinysFlight = ref(20)

// Function to determine Destiny's Flight based on season
const getDestinysFlightFromSeason = (season: number) => {
  // If season is 21, it means we're viewing Season 21-1
  if (season === 21) return 21
  // Otherwise, it's Destiny's Flight 20
  return 20
}

// Boss schedule data for different Destiny's Flights
const bossSchedules = {
  20: { // Destiny's Flight 20 (3x3 grid)
    1: { // Season 20-1
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: null, // Empty
      3: { name: 'Living Abyss', image: '/img/Living_Licorice_Abyss.webp' }
    },
    2: { // Season 20-2
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: null // Empty
    },
    3: { // Season 20-3
      1: null, // Empty
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: { name: 'Living Abyss', image: '/img/Living_Licorice_Abyss.webp' }
    }
  },
  21: { // Destiny's Flight 21 (4x3 grid)
    1: { // Season 21-1
      1: null, // Empty
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    },
    2: { // Season 21-2
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: null, // Empty
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    },
    3: { // Season 21-3
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: null // Empty
    },
    4: { // Season 21-4
      1: null, // Empty
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    }
  }
}

// Method to get boss for specific Destiny's Flight, season and position
const getBossForSeason = (destinysFlight: number, season: number, position: number) => {
  const flightData = bossSchedules[destinysFlight as keyof typeof bossSchedules]
  if (!flightData) return null
  const seasonData = flightData[season as keyof typeof flightData]
  if (!seasonData) return null
  const boss = seasonData[position as keyof typeof seasonData] || null
  console.log(`getBossForSeason(${destinysFlight}, ${season}, ${position}):`, boss)
  return boss
}

// Method to get current Destiny's Flight boss schedule
const getCurrentBossSchedule = () => {
  return bossSchedules[currentDestinysFlight.value as keyof typeof bossSchedules]
}

// Method to get number of seasons for current Destiny's Flight
const getSeasonCount = () => {
  const schedule = getCurrentBossSchedule()
  return schedule ? Object.keys(schedule).length : 3
}

// Navigation methods for Destiny's Flights
const navigateToDestinysFlight = (flight: number) => {
  if (bossSchedules[flight as keyof typeof bossSchedules]) {
    currentDestinysFlight.value = flight
    activeSeason.value = 1 // Reset to first season of new flight
  }
}

const canNavigateToFlight = (flight: number) => {
  return !!bossSchedules[flight as keyof typeof bossSchedules]
}

// Ticket status helper methods - Updated for different seasons
const getTicketStatusClass = (player: any, season: number = activeSeason.value) => {
  let ticketsUsed = 0
  
  if (currentDestinysFlight.value === 21 && season === 1) {
    // Season 21-1: Avatar of Destiny and Machine God of the Eternal Void
    ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
  } else if (currentDestinysFlight.value === 21 && season === 2) {
    // Season 21-2: Red Velvet Dragon and Machine God of the Eternal Void
    ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
  } else if (season === 1) {
    // Season 20-1: Red Velvet Dragon and Living Abyss
    ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles
  } else if (season === 2) {
    // Season 20-2: Red Velvet Dragon and Avatar of Destiny
    ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
  } else if (season === 3) {
    // Season 20-3: Avatar of Destiny and Living Abyss
    ticketsUsed = player.avatarOfDestiny.battles + player.livingAbyss.battles
  } else {
    // Default fallback: Avatar of Destiny and Living Abyss
    ticketsUsed = player.avatarOfDestiny.battles + player.livingAbyss.battles
  }
  
  if (ticketsUsed >= 18) return 'ticket-excellent'
  if (ticketsUsed >= 15) return 'ticket-good'
  if (ticketsUsed >= 10) return 'ticket-warning'
  return 'ticket-poor'
}

const getTicketStatusText = (player: any, season: number = activeSeason.value) => {
  let ticketsUsed = 0
  
  if (currentDestinysFlight.value === 21 && season === 1) {
    // Season 21-1: Avatar of Destiny and Machine God of the Eternal Void
    ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
  } else if (currentDestinysFlight.value === 21 && season === 2) {
    // Season 21-2: Red Velvet Dragon and Machine God of the Eternal Void
    ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
  } else if (season === 1) {
    // Season 20-1: Red Velvet Dragon and Living Abyss
    ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles
  } else if (season === 2) {
    // Season 20-2: Red Velvet Dragon and Avatar of Destiny
    ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
  } else if (season === 3) {
    // Season 20-3: Avatar of Destiny and Living Abyss
    ticketsUsed = player.avatarOfDestiny.battles + player.livingAbyss.battles
  } else {
    // Default fallback: Avatar of Destiny and Living Abyss
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
    livingAbyss: { player: null as string | null, damage: 0, season: '', tickets: 0 },
    machineGod: { player: null as string | null, damage: 0, season: '', tickets: 0 }
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
        sum + player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage + (player.machineGod?.damage || 0), 0
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
      livingAbyss: { player: null as string | null, damage: 0, season: '', tickets: 0 },
      machineGod: { player: null as string | null, damage: 0, season: '', tickets: 0 }
    }
    
    // Calculate season champions
    const seasonChampions: any[] = []
    
              validSeasonData.forEach(seasonData => {
       // Find best player for this season (player with highest total damage)
       let bestPlayer: any = null
       let bestTotalDamage = 0
       
       seasonData.players.forEach((player: any) => {
         const playerTotalDamage = player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage + (player.machineGod?.damage || 0)
         if (playerTotalDamage > bestTotalDamage) {
           bestTotalDamage = playerTotalDamage
           bestPlayer = player
         }
       })
       
       if (bestPlayer) {
         const ticketsUsed = bestPlayer.redVelvetDragon.battles + bestPlayer.avatarOfDestiny.battles + bestPlayer.livingAbyss.battles + (bestPlayer.machineGod?.battles || 0)
         
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
        
        // Check Machine God champion
        if (player.machineGod && player.machineGod.damage > bossChampions.machineGod.damage) {
          console.log(`New Machine God champion: ${player.playerName} with ${player.machineGod.damage} damage in season ${seasonData.seasonId}`)
          bossChampions.machineGod = {
            player: player.playerName,
            damage: player.machineGod.damage,
            season: seasonData.seasonId,
            tickets: player.machineGod.battles
          }
        }
      })
    })
    
    // Sort season champions by total damage
    seasonChampions.sort((a, b) => b.totalDamage - a.totalDamage)
    
    console.log('Final boss champions:', bossChampions)
    console.log('Machine God champion:', bossChampions.machineGod)
    
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

// Computed property for mobile boss list
const mobileBossList = computed(() => {
  const bosses = []
  const seasonCount = getSeasonCount()
  for (let i = 1; i <= seasonCount; i++) {
    const boss = getBossForSeason(currentDestinysFlight.value, activeSeason.value, i)
    if (boss) {
      bosses.push({ ...boss, position: i })
    }
  }
  return bosses
})

// Helper functions for season status display
const getSeasonStatusClass = () => {
  if (currentDestinysFlight.value === 21) {
    if (activeSeason.value === 1) return 'tallying'
    if (activeSeason.value === 2) return 'current'
    if (activeSeason.value === 3 || activeSeason.value === 4) return 'upcoming'
  } else if (currentDestinysFlight.value === 20 && activeSeason.value === 3) {
    return 'previous'
  }
  return 'default'
}

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
                  <span class="requirement-text">11 BIL+ RED VELVET DRAGON</span>
                </div>
                <div class="requirement-item">
                  <div class="requirement-icon">
                    <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny" />
                  </div>
                  <span class="requirement-text">6 BIL+ AVATAR OF DESTINY</span>
                </div>
                <div class="requirement-item">
                  <div class="requirement-icon">
                    <img src="/img/Living_Licorice_Abyss.webp" alt="Living Licorice Abyss" />
                  </div>
                  <span class="requirement-text">16 BIL+ LIVING ABYSS</span>
                </div>
                <div class="requirement-item">
                  <div class="requirement-icon">
                    <img src="/img/Machine-God_of_the_Eternal_Void_guild_ready.webp" alt="Machine-God of the Eternal Void" />
                  </div>
                  <span class="requirement-text">10 BIL+ MACHINE-GOD OF THE ETERNAL VOID</span>
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
                           <p class="load-note">Load data from seasons 17-1 to 20-3</p>
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

             <!-- Machine God Champion -->
             <div class="glory-card machine-god" v-if="hallOfGloryData.bossChampions.machineGod.player">
               <div class="glory-header">
                 <div class="boss-icon">
                   <img src="/img/Machine-God_of_the_Eternal_Void_guild_ready.webp" alt="Machine-God of the Eternal Void" />
                 </div>
                 <h3>Machine God</h3>
                 <div class="champion-badge">🥇 Champion</div>
               </div>
               <div class="champion-info">
                 <div class="champion-name">{{ hallOfGloryData.bossChampions.machineGod.player }}</div>
                 <div class="champion-damage">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.machineGod.damage) }}</div>
                 <div class="champion-details">
                   <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.machineGod.tickets }}/18 Tickets</span>
                   <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.machineGod.season }}</span>
                 </div>
               </div>
               <div class="glory-stats">
                 <div class="stat-item">
                   <span class="stat-label">Guild Record:</span>
                   <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.machineGod.damage) }}</span>
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Season:</span>
                   <span class="stat-value">{{ hallOfGloryData.bossChampions.machineGod.season }}</span>
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
          <p class="schedule-subtitle">Destiny's Flight {{ currentDestinysFlight }}</p>
          <p class="schedule-note">Season times are to GMT+9</p>
        </div>

        <div class="schedule-grid">
          <!-- Destiny's Flight Navigation -->
          <div class="destinys-flight-navigation">
            <button 
              class="flight-nav-arrow left" 
              @click="navigateToDestinysFlight(currentDestinysFlight - 1)"
              :disabled="!canNavigateToFlight(currentDestinysFlight - 1)"
            >
              ←
            </button>
            <div class="flight-indicator">
              <span class="flight-number">{{ currentDestinysFlight }}</span>
              <span class="flight-label">Destiny's Flight</span>
            </div>
            <button 
              class="flight-nav-arrow right" 
              @click="navigateToDestinysFlight(currentDestinysFlight + 1)"
              :disabled="!canNavigateToFlight(currentDestinysFlight + 1)"
            >
              →
            </button>
          </div>

          <!-- Season Headers -->
          <div class="season-headers" :style="{ gridTemplateColumns: `repeat(${getSeasonCount()}, 1fr)` }">
            <div 
              v-for="season in getSeasonCount()" 
              :key="season"
              class="season-header" 
              :class="{ active: activeSeason === season }"
              @click="activeSeason = season"
            >
              <div class="season-name">Season {{ currentDestinysFlight }}-{{ season }}</div>
              <div class="season-dates">
                <span v-if="currentDestinysFlight === 20">
                  <span v-if="season === 1">08.07.25 - 08.13.25</span>
                  <span v-else-if="season === 2">08.14.25 - 08.20.25</span>
                  <span v-else-if="season === 3">08.21.25 - 08.27.25</span>
                </span>
                <span v-else-if="currentDestinysFlight === 21">
                  <span v-if="season === 1">08.28.25 - 09.03.25</span>
                  <span v-else-if="season === 2">09.04.25 - 09.10.25</span>
                  <span v-else-if="season === 3">09.11.25 - 09.17.25</span>
                  <span v-else-if="season === 4">09.18.25 - 09.24.25</span>
                </span>
              </div>
              <div v-if="activeSeason === season" class="current-indicator">{{ getSeasonStatusIcon(season) }} {{ getSeasonStatusMessage(season) }}</div>
              <div v-if="!hasSeasonData(season)" class="coming-soon-indicator">{{ getSeasonStatusIcon(season) }} {{ getSeasonStatusMessage(season) }}</div>
            </div>
          </div>

          <!-- Boss Schedule Grid -->
          <div class="boss-schedule" :style="{ gridTemplateColumns: `repeat(${getSeasonCount()}, 1fr)` }">
            <!-- Row 1: Red Velvet Dragon positions -->
            <template v-for="season in getSeasonCount()" :key="`row1-${season}`">
              <div 
                v-if="getBossForSeason(currentDestinysFlight, season, 1)"
                class="boss-cell"
              >
                <img :src="getBossForSeason(currentDestinysFlight, season, 1)?.image" :alt="getBossForSeason(currentDestinysFlight, season, 1)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(currentDestinysFlight, season, 1)?.name }}</div>
              </div>
              <div 
                v-else
                class="boss-cell empty"
              ></div>
            </template>
            
            <!-- Row 2: Avatar of Destiny positions -->
            <template v-for="season in getSeasonCount()" :key="`row2-${season}`">
              <div 
                v-if="getBossForSeason(currentDestinysFlight, season, 2)"
                class="boss-cell"
              >
                <img :src="getBossForSeason(currentDestinysFlight, season, 2)?.image" :alt="getBossForSeason(currentDestinysFlight, season, 2)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(currentDestinysFlight, season, 2)?.name }}</div>
              </div>
              <div 
                v-else
                class="boss-cell empty"
              ></div>
            </template>
            
            <!-- Row 3: Living Abyss/Machine-God positions -->
            <template v-for="season in getSeasonCount()" :key="`row3-${season}`">
              <div 
                v-if="getBossForSeason(currentDestinysFlight, season, 3)"
                class="boss-cell"
              >
                <img :src="getBossForSeason(currentDestinysFlight, season, 3)?.image" :alt="getBossForSeason(currentDestinysFlight, season, 3)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(currentDestinysFlight, season, 3)?.name }}</div>
              </div>
              <div 
                v-else
                class="boss-cell empty"
              ></div>
            </template>
          </div>



          <!-- Mobile: Show only selected season -->
          <div class="boss-schedule-mobile">
            <div class="mobile-boss-list">
              <div
                v-for="boss in mobileBossList"
                :key="boss.position"
                class="mobile-boss-item"
              >
                <img :src="boss.image" :alt="boss.name" class="mobile-boss-image">
                <div class="mobile-boss-name">{{ boss.name }}</div>
              </div>
              <div v-if="!getBossForSeason(currentDestinysFlight, activeSeason, 1) && !getBossForSeason(currentDestinysFlight, activeSeason, 2) && !getBossForSeason(currentDestinysFlight, activeSeason, 3)" class="mobile-no-bosses">
                <div class="no-bosses-icon">📅</div>
                <div class="no-bosses-text">No bosses scheduled for this season</div>
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
    <section v-if="!hasSeasonData(activeSeason) && !isSeasonLoading" class="coming-soon-section" :class="getSeasonStatusClass()">
      <div class="container">
        <div class="coming-soon-content">
          <div class="coming-soon-icon">{{ getSeasonStatusIcon(activeSeason) }}</div>
          
          <!-- Dynamic title and subtitle based on season status -->
          <h2 class="coming-soon-title">
            <span v-if="currentDestinysFlight === 21 && activeSeason === 1">Season Just Finished</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 2">Current Season</span>
            <span v-else-if="currentDestinysFlight === 21 && (activeSeason === 3 || activeSeason === 4)">Upcoming Season</span>
            <span v-else-if="currentDestinysFlight === 20 && activeSeason === 3">Previous Season</span>
            <span v-else>No Data Available</span>
          </h2>
          
          <p class="coming-soon-subtitle">
            <span v-if="currentDestinysFlight === 21 && activeSeason === 1">Season 21-1 has just ended and is currently being tallied.</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 2">Season 21-2 is currently active with battle data available.</span>
            <span v-else-if="currentDestinysFlight === 21 && (activeSeason === 3 || activeSeason === 4)">Season {{ currentDestinysFlight }}-{{ activeSeason }} is an upcoming season. No data is available yet.</span>
            <span v-else-if="currentDestinysFlight === 20 && activeSeason === 3">Season 20-3 is a previous season with battle data available.</span>
            <span v-else>No battle analysis data is available for this season.</span>
          </p>
          
          <!-- Helpful Information Cards -->
          <div class="coming-soon-info">
            <!-- Season 21-1: Tallying -->
            <template v-if="currentDestinysFlight === 21 && activeSeason === 1">
              <div class="info-card tallying">
                <div class="info-icon">📈</div>
                <h3>Tallying Results</h3>
                <p>Final scores and rankings are being calculated. Check back soon for the complete results.</p>
              </div>
              <div class="info-card tallying">
                <div class="info-icon">🏆</div>
                <h3>Champions</h3>
                <p>Top performers and guild rankings will be available once tallying is complete.</p>
              </div>
              <div class="info-card tallying">
                <div class="info-icon">📅</div>
                <h3>Next Season</h3>
                <p>Season 21-2 is currently active. Check the boss schedule above for current battles.</p>
              </div>
            </template>

            <!-- Season 21-2: Current Season -->
            <template v-if="currentDestinysFlight === 21 && activeSeason === 2">
              <div class="info-card current">
                <div class="info-icon">⚔️</div>
                <h3>Battles in Progress</h3>
                <p>This season is currently running with battle data available. Check the analysis below for detailed performance metrics.</p>
              </div>
              <div class="info-card current">
                <div class="info-icon">📊</div>
                <h3>Live Updates</h3>
                <p>Check back regularly to see real-time battle results and player rankings.</p>
              </div>
              <div class="info-card current">
                <div class="info-icon">🎯</div>
                <h3>Get Ready</h3>
                <p>Prepare your guild for the current boss battles and strategize your approach.</p>
              </div>
            </template>

            <!-- Seasons 21-3 & 21-4: Upcoming -->
            <template v-if="currentDestinysFlight === 21 && (activeSeason === 3 || activeSeason === 4)">
              <div class="info-card upcoming">
                <div class="info-icon">🔮</div>
                <h3>Future Season</h3>
                <p>This season hasn't started yet. Check the boss schedule above to see what's planned.</p>
              </div>
              <div class="info-card upcoming">
                <div class="info-icon">📅</div>
                <h3>Season Dates</h3>
                <p>
                  <span v-if="activeSeason === 3">Season 21-3 will run from 09.11.25 - 09.17.25.</span>
                  <span v-else-if="activeSeason === 4">Season 21-4 will run from 09.18.25 - 09.24.25.</span>
                </p>
              </div>
              <div class="info-card upcoming">
                <div class="info-icon">🎯</div>
                <h3>Preparation</h3>
                <p>Use this time to prepare your guild for the upcoming battles and strategize your approach.</p>
              </div>
            </template>

            <!-- Season 20-3: Previous with Data -->
            <template v-if="currentDestinysFlight === 20 && activeSeason === 3">
              <div class="info-card previous">
                <div class="info-icon">📊</div>
                <h3>Data Available</h3>
                <p>This season has completed and all battle data is available for review.</p>
              </div>
              <div class="info-card previous">
                <div class="info-icon">🏆</div>
                <h3>Final Results</h3>
                <p>Check the Hall of Glory below to see final rankings and champions.</p>
              </div>
              <div class="info-card previous">
                <div class="info-icon">📈</div>
                <h3>Performance Analysis</h3>
                <p>Review your guild's performance and identify areas for improvement.</p>
              </div>
            </template>

            <!-- Default: Generic current/upcoming info -->
            <template v-if="!(currentDestinysFlight === 21 && [1, 2, 3, 4].indexOf(activeSeason) !== -1) && !(currentDestinysFlight === 20 && activeSeason === 3)">
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
            </template>
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
                <div class="boss-ticket-icon">
                  <img src="/img/Red_Velvet_Dragon.webp" 
                       alt="Red Velvet Dragon"
                       class="boss-icon-image">
                </div>
                <div class="boss-ticket-info">
                  <div class="boss-ticket-name">Red Velvet Dragon</div>
                  <div class="boss-ticket-count">{{ analysisState.battleStats?.ticketStats.ticketsUsedByBoss.redVelvet || 0 }} tickets</div>
                </div>
              </div>
              <div class="ticket-boss-item avatar">
                <div class="boss-ticket-icon">
                  <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" 
                       alt="Avatar of Destiny"
                       class="boss-icon-image">
                </div>
                <div class="boss-ticket-info">
                  <div class="boss-ticket-name">Avatar of Destiny</div>
                  <div class="boss-ticket-count">{{ analysisState.battleStats?.ticketStats.ticketsUsedByBoss.avatar || 0 }} tickets</div>
                </div>
              </div>
              <div class="ticket-boss-item" :class="(currentDestinysFlight === 21) ? 'machine-god' : 'living-abyss'">
                <div class="boss-ticket-icon">
                  <img :src="(currentDestinysFlight === 21) ? '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' : '/img/Living_Licorice_Abyss.webp'" 
                       :alt="(currentDestinysFlight === 21) ? 'Machine God of the Eternal Void' : 'Living Abyss'"
                       class="boss-icon-image">
                </div>
                <div class="boss-ticket-info">
                  <div class="boss-ticket-name">{{ (currentDestinysFlight === 21) ? 'Machine God of the Eternal Void' : 'Living Abyss' }}</div>
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
              <div class="boss-icon">
                <img src="/img/Red_Velvet_Dragon.webp" 
                     alt="Red Velvet Dragon"
                     class="boss-icon-image">
              </div>
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
              <div class="boss-icon">
                <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" 
                     alt="Avatar of Destiny"
                     class="boss-icon-image">
              </div>
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

          <div class="boss-stat-card" :class="(currentDestinysFlight === 21) ? 'machine-god' : 'living-abyss'">
            <div class="boss-stat-header">
              <div class="boss-icon">
                <img :src="(currentDestinysFlight === 21) ? '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' : '/img/Living_Licorice_Abyss.webp'" 
                     :alt="(currentDestinysFlight === 21) ? 'Machine God of the Eternal Void' : 'Living Abyss'"
                     class="boss-icon-image">
              </div>
              <h3>{{ (currentDestinysFlight === 21) ? 'Machine God of the Eternal Void' : 'Living Abyss' }}</h3>
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
                  <th>{{ (currentDestinysFlight === 21) ? 'Machine God of the Eternal Void' : 'Living Abyss' }}</th>
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
                        {{ currentDestinysFlight === 21 ? (player.avatarOfDestiny.battles + player.livingAbyss.battles) :
                           activeSeason === 1 ? (player.redVelvetDragon.battles + player.livingAbyss.battles) : 
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
                  <div class="mobile-boss-icon">
                    <img src="/img/Red_Velvet_Dragon.webp" 
                         alt="Red Velvet Dragon"
                         class="boss-icon-image">
                  </div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage) }}</div>
                    <div class="mobile-battles-count">x{{ player.redVelvetDragon.battles }}</div>
                  </div>
                </div>
                
                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">
                    <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" 
                         alt="Avatar of Destiny"
                         class="boss-icon-image">
                  </div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.avatarOfDestiny.damage) }}</div>
                    <div class="mobile-battles-count">x{{ player.avatarOfDestiny.battles }}</div>
                  </div>
                </div>
                
                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">
                    <img :src="(currentDestinysFlight === 21) ? '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' : '/img/Living_Licorice_Abyss.webp'" 
                         :alt="(currentDestinysFlight === 21) ? 'Machine God of the Eternal Void' : 'Living Abyss'"
                         class="boss-icon-image">
                  </div>
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
                  <div class="mobile-ticket-count">{{ currentDestinysFlight === 21 ? (player.avatarOfDestiny.battles + player.livingAbyss.battles) :
                     activeSeason === 1 ? (player.redVelvetDragon.battles + player.livingAbyss.battles) : 
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

/* Informational Banners for Seasons Without Data */
.info-banner {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.banner-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.banner-icon {
  font-size: 2rem;
  color: #ffd700;
}

.banner-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.banner-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.banner-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.3);
}

.card-icon {
  font-size: 1.5rem;
  color: #ffd700;
  margin-right: 0.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.card-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.tallying {
  --boss-color: #ff4444;
  --boss-color-light: #ff6666;
}

.current-no-data {
  --boss-color: #4444ff;
  --boss-color-light: #6666ff;
}

.upcoming {
  --boss-color: #44ff44;
  --boss-color-light: #66ff66;
}

.previous-with-data {
  --boss-color: #ffaa44;
  --boss-color-light: #ffcc66;
}
</style>