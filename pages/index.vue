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

// GSAP animations and initialization
onMounted(() => {
  // Add entrance animations here if needed
  // Set active season based on current date after everything is initialized
  activeSeason.value = getCurrentSeason()
  // Trigger initial fetch
  fetchSeasonData(activeSeason.value)
})

// Guild Battle Schedule Data
const activeSeason = ref(1) // Will be calculated based on current date

// Season date ranges (in GMT+9 timezone)
const seasonDates = {
  1: { start: new Date('2025-08-07T00:00:00+09:00'), end: new Date('2025-08-13T23:59:59+09:00') },
  2: { start: new Date('2025-08-14T00:00:00+09:00'), end: new Date('2025-08-20T23:59:59+09:00') },
  3: { start: new Date('2025-08-21T00:00:00+09:00'), end: new Date('2025-08-27T23:59:59+09:00') },
  4: { start: new Date('2025-08-28T00:00:00+09:00'), end: new Date('2025-09-03T23:59:59+09:00') }
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
  { id: '21-2', name: 'Season 21-2', hasData: true },
  { id: '21-3', name: 'Season 21-3', hasData: true },
  { id: '21-4', name: 'Season 21-4', hasData: true },
  { id: '23-1', name: 'Season 23-1', hasData: true },
  { id: '23-2', name: 'Season 23-2', hasData: true },
  { id: '23-3', name: 'Season 23-3', hasData: true },
  { id: '23-4', name: 'Season 23-4', hasData: true },
  { id: '24-1', name: 'Season 24-1', hasData: true },
  { id: '24-2', name: 'Season 24-2', hasData: true },
  { id: '24-3', name: 'Season 24-3', hasData: true }
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
  },
  23: {
    hasData: true, // Season 21-3 now has data available
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '21-3!A1:Z100' // Season 21-3 range
  },
  24: {
    hasData: true, // Season 21-4 now has data available
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '21-4!A1:Z100' // Season 21-4 range
  },
  // Flight 23 seasons
  231: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '23-1!A1:Z100'
  },
  232: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '23-2!A1:Z100'
  },
  233: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '23-3!A1:Z100'
  },
  234: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '23-4!A1:Z100'
  },
  // Flight 24 seasons
  241: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '24-1!A1:Z100'
  },
  242: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '24-2!A1:Z100'
  },
  243: {
    hasData: true,
    spreadsheetId: '1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs',
    range: '24-3!A1:Z100'
  }
}

// Season types for display purposes
const seasonTypes = {
  1: 'previous',  // Season 20-1 - previous season
  2: 'previous',  // Season 20-2 - previous season  
  3: 'previous',  // Season 20-3 - previous season (now over)
  21: 'previous', // Season 21-1 - previous season (Machine God)
  22: 'previous', // Season 21-2 - previous season (Machine God)
  23: 'previous', // Season 21-3 - previous season
  24: 'current'   // Season 21-4 - current season
}

// Function to determine current season based on date
const getCurrentSeason = () => {
  const now = new Date()
  const gmtPlus9 = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // Convert to GMT+9

  for (const season in seasonDates) {
    const seasonNum = parseInt(season) as 1 | 2 | 3 | 4
    const dates = seasonDates[seasonNum]
    if (gmtPlus9 >= dates.start && gmtPlus9 <= dates.end) {
      return seasonNum
    }
  }

  // If not in any season, return the most recent past season or default to 1
  if (gmtPlus9 < seasonDates[1].start) return 1
  if (gmtPlus9 > seasonDates[4].end) return 4

  return 1
}

// Set active season based on current date
// Don't set immediately to avoid initialization issues - will be set after watch is set up
// activeSeason.value = getCurrentSeason()

// Function to check if current season has data
const hasSeasonData = (season: number) => {
  const flight = currentDestinysFlight.value
  if (flight === 21) {
    if (season === 1) return true // Season 21-1 now has data available
    if (season === 2) return true // Season 21-2 now has data available
    if (season === 3) return true // Season 21-3 now has data available
    if (season === 4) return true // Season 21-4 now has data available
  } else if (flight === 23 || flight === 24) {
    // Flights 23 and 24: All seasons have data available
    return true
  } else {
    // Destiny's Flight 20: All seasons are previous seasons with data available
    if (season === 1 || season === 2 || season === 3) return true
  }
  return false
}

// Function to get season display name
const getSeasonDisplayName = (season: number) => {
  const flight = currentDestinysFlight.value
  if (flight === 21 || flight === 23 || flight === 24) {
    return `${flight}-${season}`
  }
  return `20-${season}`
}

// Function to get season type
const getSeasonType = (season: number) => {
  return seasonTypes[season as keyof typeof seasonTypes] || 'unknown'
}

// Function to get season status message
const getSeasonStatusMessage = (season: number) => {
  const flight = currentDestinysFlight.value
  if (flight === 21) {
    if (season === 1) return 'Previous Season - Data Available'
    if (season === 2) return 'Previous Season - Data Available'
    if (season === 3) return 'Previous Season - Data Available'
    if (season === 4) return 'Current Season - Data Available'
  } else if (flight === 23 || flight === 24) {
    // Flights 23 and 24: All seasons have data available
    return 'Previous Season - Data Available'
  } else {
    // Destiny's Flight 20: All seasons are previous seasons with data available
    if (season === 1 || season === 2 || season === 3) return 'Previous Season - Data Available'
  }
  return 'Unknown Status'
}

// Function to get season status icon
const getSeasonStatusIcon = (season: number) => {
  const flight = currentDestinysFlight.value
  if (flight === 21) {
    if (season === 1) return '📊' // Previous season with data available
    if (season === 2) return '📊' // Previous season with data available
    if (season === 3) return '📊' // Previous season with data available
    if (season === 4) return '📊' // Current season with data available
  } else if (flight === 23 || flight === 24) {
    // Flights 23 and 24: All seasons have data available
    return '📊'
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

// Track last fetched season/flight to prevent unnecessary resets
const lastFetchedSeason = ref<{ flight: number; season: number } | null>(null)

// Function to automatically fetch data for selected season
const fetchSeasonData = async (season: number) => {
  let config: any
  const flight = currentDestinysFlight.value

  // Handle Destiny's Flight 21 seasons
  if (flight === 21) {
    // For Destiny's Flight 21, use the correct season configuration
    if (season === 1) {
      config = seasonConfigurations[21] // Season 21-1: AoD + Machine God
    } else if (season === 2) {
      config = seasonConfigurations[22] // Season 21-2: RVD + Machine God
    } else if (season === 3) {
      config = seasonConfigurations[23] // Season 21-3: RVD + AOD
    } else if (season === 4) {
      config = seasonConfigurations[24] // Season 21-4: AoD + Machine God
    } else {
      config = seasonConfigurations[21] // Fallback to 21-1
    }
  } else if (flight === 23) {
    // Flight 23 seasons
    const configKey = (230 + season) as keyof typeof seasonConfigurations
    config = seasonConfigurations[configKey] || seasonConfigurations[231]
    console.log(`🔍 Flight 23, Season ${season}: Using config key ${configKey}, range: ${config?.range}`)
  } else if (flight === 24) {
    // Flight 24 seasons
    const configKey = (240 + season) as keyof typeof seasonConfigurations
    config = seasonConfigurations[configKey] || seasonConfigurations[241]
    console.log(`🔍 Flight 24, Season ${season}: Using config key ${configKey}, range: ${config?.range}`)
  } else {
    config = seasonConfigurations[season as keyof typeof seasonConfigurations]
  }

  if (!config || !config.hasData) {
    // Reset analysis state for seasons without data
    console.warn(`⚠️ No config found for Flight ${flight}, Season ${season}`)
    resetAnalysis()
    return
  }

  // Set loading state
  isSeasonLoading.value = true

  // Only reset analysis state if we're switching to a different flight/season combination
  // This prevents clearing data unnecessarily
  const isNewSeason = !lastFetchedSeason.value ||
    lastFetchedSeason.value.flight !== flight ||
    lastFetchedSeason.value.season !== season

  if (isNewSeason) {
    resetAnalysis()
    lastFetchedSeason.value = { flight, season }
  }

  // Set the spreadsheet configuration for the selected season
  sheetsState.spreadsheetId = config.spreadsheetId
  sheetsState.range = config.range

  // Wait a tick to ensure state is updated
  await new Promise(resolve => setTimeout(resolve, 0))

  // Automatically fetch data for the season
  try {
    // Map the season number correctly for the battle analyzer
    let analyzerSeason = season
    if (flight === 21 || flight === 23 || flight === 24) {
      // For flights 21, 23, and 24, keep the same season number for analyzer
      analyzerSeason = season
    }
    console.log(`📊 Fetching data for Flight ${flight}, Season ${season} (analyzer season: ${analyzerSeason})`)
    console.log(`📊 Using spreadsheet range: ${config.range}`)
    console.log(`📊 Current sheetsState.range: ${sheetsState.range}`)
    console.log(`📊 Expected bosses for ${flight}-${season}:`, {
      boss1: getBossForSeason(flight, season, 1)?.name || 'None',
      boss2: getBossForSeason(flight, season, 2)?.name || 'None',
      boss3: getBossForSeason(flight, season, 3)?.name || 'None'
    })
    // Pass the range directly to ensure we use the correct one
    await fetchFromGoogleSheets(analyzerSeason, flight, config.range)

    // Verify data was loaded successfully
    console.log(`✅ Data fetch completed for Flight ${flight}, Season ${season}`)
    console.log(`✅ analysisComplete: ${analysisState.analysisComplete}`)
    console.log(`✅ players count: ${analysisState.battleData.length}`)
    console.log(`✅ hasSeasonData: ${hasSeasonData(season)}`)
    console.log(`✅ isSeasonLoading: ${isSeasonLoading.value}`)

    // Double-check that analysisComplete is set
    if (!analysisState.analysisComplete && analysisState.battleData.length > 0) {
      console.warn(`⚠️ analysisComplete is false but we have data! Setting it to true.`)
      analysisState.analysisComplete = true
    }
  } catch (error) {
    console.error('Error fetching season data:', error)
    // Ensure loading state is cleared even on error
    isSeasonLoading.value = false
    // Don't reset analysis on error - let the error message show
  } finally {
    // Clear loading state
    isSeasonLoading.value = false
  }
}

// Current Destiny's Flight (main season)
const currentDestinysFlight = ref(24)

// Flag to prevent multiple simultaneous fetches
let isFetchingSeason = false

// Watch for active season changes and fetch data automatically
watch([activeSeason, currentDestinysFlight], ([newSeason, newFlight]) => {
  if (isFetchingSeason) {
    console.log(`⏸️ Skipping fetch - already in progress`)
    return
  }
  console.log(`👀 Watch triggered: Season ${newSeason}, Flight ${newFlight}`)
  isFetchingSeason = true
  fetchSeasonData(newSeason).finally(() => {
    isFetchingSeason = false
  })
}, { immediate: false })

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
  },
  23: { // Destiny's Flight 23 (4x3 grid)
    1: { // Season 23-1: RVD and AOD
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: null // Empty
    },
    2: { // Season 23-2: AOD and Machine God
      1: null, // Empty
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    },
    3: { // Season 23-3: RVD and Machine God
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: null, // Empty
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    },
    4: { // Season 23-4: RVD and AOD
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: null // Empty
    }
  },
  24: { // Destiny's Flight 24 (3x3 grid)
    1: { // Season 24-1: AOD and Machine God
      1: null, // Empty
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    },
    2: { // Season 24-2: RVD and Machine God
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: null, // Empty
      3: { name: 'Machine-God of the Eternal Void', image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' }
    },
    3: { // Season 24-3: RVD and AOD
      1: { name: 'Red Velvet Dragon', image: '/img/Red_Velvet_Dragon.webp' },
      2: { name: 'Avatar of Destiny', image: '/img/Avatar_of_destiny_guild_battle_ready.webp' },
      3: null // Empty
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

// Helper function to check if a boss is active in the current season
const isBossActiveInSeason = (bossName: string, destinysFlight: number, season: number): boolean => {
  const flightData = bossSchedules[destinysFlight as keyof typeof bossSchedules]
  if (!flightData) return false
  const seasonData = flightData[season as keyof typeof flightData]
  if (!seasonData) return false

  // Check all positions for this boss
  for (let pos = 1; pos <= 3; pos++) {
    const boss = seasonData[pos as keyof typeof seasonData]
    if (boss && boss.name === bossName) {
      return true
    }
  }
  return false
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
    console.log(`🔄 Navigating to Flight ${flight}`)
    currentDestinysFlight.value = flight
    // Reset to first season - this will trigger the watch which calls fetchSeasonData
    activeSeason.value = 1
  }
}

const canNavigateToFlight = (flight: number) => {
  return !!bossSchedules[flight as keyof typeof bossSchedules]
}

// Get the next available flight (for navigation)
const getNextFlight = (currentFlight: number, direction: 'prev' | 'next'): number | null => {
  const availableFlights = Object.keys(bossSchedules).map(Number).sort((a, b) => a - b)
  const currentIndex = availableFlights.indexOf(currentFlight)

  if (direction === 'prev') {
    if (currentIndex > 0) {
      return availableFlights[currentIndex - 1]
    }
  } else {
    if (currentIndex < availableFlights.length - 1) {
      return availableFlights[currentIndex + 1]
    }
  }
  return null
}

// Ticket status helper methods - Updated for different seasons
const getTicketStatusClass = (player: any, season: number = activeSeason.value) => {
  let ticketsUsed = 0
  const flight = currentDestinysFlight.value

  if (flight === 21) {
    if (season === 1) {
      // Season 21-1: Avatar of Destiny and Machine God of the Eternal Void
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 2) {
      // Season 21-2: Red Velvet Dragon and Machine God of the Eternal Void
      ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 21-3: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 4) {
      // Season 21-4: Avatar of Destiny and Machine God of the Eternal Void
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    }
  } else if (flight === 23) {
    if (season === 1) {
      // Season 23-1: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 2) {
      // Season 23-2: Avatar of Destiny and Machine God
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 23-3: Red Velvet Dragon and Machine God
      ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 4) {
      // Season 23-4: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    }
  } else if (flight === 24) {
    if (season === 1) {
      // Season 24-1: Avatar of Destiny and Machine God
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 2) {
      // Season 24-2: Red Velvet Dragon and Machine God
      ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 24-3: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    }
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
  const flight = currentDestinysFlight.value

  if (flight === 21) {
    if (season === 1) {
      // Season 21-1: Avatar of Destiny and Machine God of the Eternal Void
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 2) {
      // Season 21-2: Red Velvet Dragon and Machine God of the Eternal Void
      ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 21-3: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 4) {
      // Season 21-4: Avatar of Destiny and Machine God of the Eternal Void
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    }
  } else if (flight === 23) {
    if (season === 1) {
      // Season 23-1: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 2) {
      // Season 23-2: Avatar of Destiny and Machine God
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 23-3: Red Velvet Dragon and Machine God
      ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 4) {
      // Season 23-4: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    }
  } else if (flight === 24) {
    if (season === 1) {
      // Season 24-1: Avatar of Destiny and Machine God
      ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 2) {
      // Season 24-2: Red Velvet Dragon and Machine God
      ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 24-3: Red Velvet Dragon and Avatar of Destiny
      ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    }
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
  if (playerName === 'jammifyvxxx') return 'Officer'
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

// Helper function to get total damage for a player based on active bosses in a season
const getPlayerTotalDamageForGlory = (player: any, seasonId: string) => {
  // Parse season ID (e.g., "23-1" -> flight: 23, season: 1)
  const parts = seasonId.split('-')
  if (parts.length !== 2) {
    // Fallback: sum all bosses
    return player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage + (player.machineGod?.damage || 0)
  }

  const flight = parseInt(parts[0])
  const season = parseInt(parts[1])

  // Flight 23 seasons
  if (flight === 23) {
    if (season === 1) {
      // Season 23-1: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.damage + player.avatarOfDestiny.damage
    } else if (season === 2) {
      // Season 23-2: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.damage + (player.machineGod?.damage || 0)
    } else if (season === 3) {
      // Season 23-3: Red Velvet Dragon and Machine God
      return player.redVelvetDragon.damage + (player.machineGod?.damage || 0)
    } else if (season === 4) {
      // Season 23-4: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.damage + player.avatarOfDestiny.damage
    }
  }
  // Flight 24 seasons
  if (flight === 24) {
    if (season === 1) {
      // Season 24-1: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.damage + (player.machineGod?.damage || 0)
    } else if (season === 2) {
      // Season 24-2: Red Velvet Dragon and Machine God
      return player.redVelvetDragon.damage + (player.machineGod?.damage || 0)
    } else if (season === 3) {
      // Season 24-3: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.damage + player.avatarOfDestiny.damage
    }
  }
  // Flight 21 seasons
  if (flight === 21) {
    if (season === 1) {
      // Season 21-1: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.damage + (player.machineGod?.damage || 0)
    } else if (season === 2) {
      // Season 21-2: Red Velvet Dragon and Machine God
      return player.redVelvetDragon.damage + (player.machineGod?.damage || 0)
    } else if (season === 3) {
      // Season 21-3: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.damage + player.avatarOfDestiny.damage
    } else if (season === 4) {
      // Season 21-4: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.damage + (player.machineGod?.damage || 0)
    }
  }
  // Flight 20 seasons
  if (flight === 20) {
    if (season === 1) {
      // Season 20-1: Red Velvet Dragon and Living Abyss
      return player.redVelvetDragon.damage + player.livingAbyss.damage
    } else if (season === 2) {
      // Season 20-2: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.damage + player.avatarOfDestiny.damage
    } else if (season === 3) {
      // Season 20-3: Avatar of Destiny and Living Abyss
      return player.avatarOfDestiny.damage + player.livingAbyss.damage
    }
  }
  // Default: sum all bosses
  return player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage + (player.machineGod?.damage || 0)
}

// Helper function to get total battles for a player based on active bosses in a season
const getPlayerTotalBattlesForGlory = (player: any, seasonId: string) => {
  // Parse season ID (e.g., "23-1" -> flight: 23, season: 1)
  const parts = seasonId.split('-')
  if (parts.length !== 2) {
    // Fallback: sum all battles
    return player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles + (player.machineGod?.battles || 0)
  }

  const flight = parseInt(parts[0])
  const season = parseInt(parts[1])

  // Flight 23 seasons
  if (flight === 23) {
    if (season === 1) {
      // Season 23-1: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 2) {
      // Season 23-2: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 23-3: Red Velvet Dragon and Machine God
      return player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 4) {
      // Season 23-4: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    }
  }
  // Flight 24 seasons
  if (flight === 24) {
    if (season === 1) {
      // Season 24-1: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 2) {
      // Season 24-2: Red Velvet Dragon and Machine God
      return player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 24-3: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    }
  }
  // Flight 21 seasons
  if (flight === 21) {
    if (season === 1) {
      // Season 21-1: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    } else if (season === 2) {
      // Season 21-2: Red Velvet Dragon and Machine God
      return player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    } else if (season === 3) {
      // Season 21-3: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 4) {
      // Season 21-4: Avatar of Destiny and Machine God
      return player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    }
  }
  // Flight 20 seasons
  if (flight === 20) {
    if (season === 1) {
      // Season 20-1: Red Velvet Dragon and Living Abyss
      return player.redVelvetDragon.battles + player.livingAbyss.battles
    } else if (season === 2) {
      // Season 20-2: Red Velvet Dragon and Avatar of Destiny
      return player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    } else if (season === 3) {
      // Season 20-3: Avatar of Destiny and Living Abyss
      return player.avatarOfDestiny.battles + player.livingAbyss.battles
    }
  }
  // Default: sum all battles
  return player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles + (player.machineGod?.battles || 0)
}

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
        sum + getPlayerTotalDamageForGlory(player, seasonId), 0
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
        const playerTotalDamage = getPlayerTotalDamageForGlory(player, seasonData.seasonId)
        if (playerTotalDamage > bestTotalDamage) {
          bestTotalDamage = playerTotalDamage
          bestPlayer = player
        }
      })

      if (bestPlayer) {
        const ticketsUsed = getPlayerTotalBattlesForGlory(bestPlayer, seasonData.seasonId)

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
  const flight = currentDestinysFlight.value
  if (flight === 21) {
    if (activeSeason.value === 1) return 'tallying'
    if (activeSeason.value === 2) return 'tallying'
    if (activeSeason.value === 3) return 'tallying'
    if (activeSeason.value === 4) return 'current'
  } else if (flight === 23 || flight === 24) {
    // Flights 23 and 24: All seasons are previous seasons
    return 'previous'
  } else if (flight === 20 && activeSeason.value === 3) {
    return 'previous'
  }
  return 'default'
}

// Helper function to get tickets used for display
const getTicketsUsed = (player: any, season: number = activeSeason.value) => {
  const flight = currentDestinysFlight.value
  let ticketsUsed = 0

  if (flight === 21) {
    if (season === 1) ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    else if (season === 2) ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    else if (season === 3) ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    else if (season === 4) ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
  } else if (flight === 23) {
    if (season === 1) ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    else if (season === 2) ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    else if (season === 3) ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    else if (season === 4) ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
  } else if (flight === 24) {
    if (season === 1) ticketsUsed = player.avatarOfDestiny.battles + (player.machineGod?.battles || 0)
    else if (season === 2) ticketsUsed = player.redVelvetDragon.battles + (player.machineGod?.battles || 0)
    else if (season === 3) ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
  } else {
    if (season === 1) ticketsUsed = player.redVelvetDragon.battles + player.livingAbyss.battles
    else if (season === 2) ticketsUsed = player.redVelvetDragon.battles + player.avatarOfDestiny.battles
    else ticketsUsed = player.avatarOfDestiny.battles + player.livingAbyss.battles
  }

  return ticketsUsed
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
              <span class="info-value">jammifyvxxx</span>
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
                <span class="info-text">114/114 RELICS - LEVEL 13+</span>
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
                <span class="requirement-text">13 BIL+ RED VELVET DRAGON</span>
              </div>
              <div class="requirement-item">
                <div class="requirement-icon">
                  <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny" />
                </div>
                <span class="requirement-text">6.5 BIL+ AVATAR OF DESTINY</span>
              </div>
              <div class="requirement-item">
                <div class="requirement-icon">
                  <img src="/img/Living_Licorice_Abyss.webp" alt="Living Licorice Abyss" />
                </div>
                <span class="requirement-text">18 BIL+ LIVING ABYSS</span>
              </div>
              <div class="requirement-item">
                <div class="requirement-icon">
                  <img src="/img/Machine-God_of_the_Eternal_Void_guild_ready.webp"
                    alt="Machine-God of the Eternal Void" />
                </div>
                <span class="requirement-text">13 BIL+ MACHINE-GOD OF THE ETERNAL VOID</span>
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
                <span class="requirement-text">USE 18/18 TICKETS</span>
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
                <span class="other-text">DON'T BE AFRAID TO APPLY EVEN IF YOU'RE A BIT BELOW THE REQUIREMENTS! WE'RE
                  HERE TO HELP!</span>
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
        <div class="glory-load-section"
          v-if="!hallOfGloryData.isLoading && hallOfGloryData.seasonChampions.length === 0">
          <button @click="loadHallOfGloryData" class="glory-load-button">
            <span class="load-icon">📊</span>
            <span>Load All-Time Champions</span>
          </button>
          <p class="load-note">Load data from seasons 17-1 to 24-3</p>
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
              <div class="champion-damage">{{
                BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.redVelvet.damage) }}</div>
              <div class="champion-details">
                <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.redVelvet.tickets }}/18 Tickets</span>
                <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.redVelvet.season }}</span>
              </div>
            </div>
            <div class="glory-stats">
              <div class="stat-item">
                <span class="stat-label">Guild Record:</span>
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.redVelvet.damage)
                  }}</span>
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
                <img src="/img/Machine-God_of_the_Eternal_Void_guild_ready.webp"
                  alt="Machine-God of the Eternal Void" />
              </div>
              <h3>Machine God</h3>
              <div class="champion-badge">🥇 Champion</div>
            </div>
            <div class="champion-info">
              <div class="champion-name">{{ hallOfGloryData.bossChampions.machineGod.player }}</div>
              <div class="champion-damage">{{
                BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.machineGod.damage) }}</div>
              <div class="champion-details">
                <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.machineGod.tickets }}/18 Tickets</span>
                <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.machineGod.season }}</span>
              </div>
            </div>
            <div class="glory-stats">
              <div class="stat-item">
                <span class="stat-label">Guild Record:</span>
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.machineGod.damage)
                  }}</span>
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
              <div class="champion-damage">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.avatar.damage)
                }}</div>
              <div class="champion-details">
                <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.avatar.tickets }}/18 Tickets</span>
                <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.avatar.season }}</span>
              </div>
            </div>
            <div class="glory-stats">
              <div class="stat-item">
                <span class="stat-label">Guild Record:</span>
                <span class="stat-value">{{ BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.avatar.damage)
                  }}</span>
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
              <div class="champion-damage">{{
                BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.livingAbyss.damage) }}</div>
              <div class="champion-details">
                <span class="detail-item">🎯 {{ hallOfGloryData.bossChampions.livingAbyss.tickets }}/18 Tickets</span>
                <span class="detail-item">📅 Season {{ hallOfGloryData.bossChampions.livingAbyss.season }}</span>
              </div>
            </div>
            <div class="glory-stats">
              <div class="stat-item">
                <span class="stat-label">Guild Record:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(hallOfGloryData.bossChampions.livingAbyss.damage) }}</span>
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
            <button class="flight-nav-arrow left"
              @click="() => { const prevFlight = getNextFlight(currentDestinysFlight, 'prev'); if (prevFlight !== null) navigateToDestinysFlight(prevFlight); }"
              :disabled="getNextFlight(currentDestinysFlight, 'prev') === null">
              ←
            </button>
            <div class="flight-indicator">
              <span class="flight-number">{{ currentDestinysFlight }}</span>
              <span class="flight-label">Destiny's Flight</span>
            </div>
            <button class="flight-nav-arrow right"
              @click="() => { const nextFlight = getNextFlight(currentDestinysFlight, 'next'); if (nextFlight !== null) navigateToDestinysFlight(nextFlight); }"
              :disabled="getNextFlight(currentDestinysFlight, 'next') === null">
              →
            </button>
          </div>

          <!-- Season Headers -->
          <div class="season-headers" :style="{ gridTemplateColumns: `repeat(${getSeasonCount()}, 1fr)` }">
            <div v-for="season in getSeasonCount()" :key="season" class="season-header"
              :class="{ active: activeSeason === season }" @click="activeSeason = season">
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
                <span v-else-if="currentDestinysFlight === 23">
                  <span v-if="season === 1">10.23.25 - 10.29.25</span>
                  <span v-else-if="season === 2">10.30.25 - 11.05.25</span>
                  <span v-else-if="season === 3">11.06.25 - 11.12.25</span>
                  <span v-else-if="season === 4">11.13.25 - 11.19.25</span>
                </span>
                <span v-else-if="currentDestinysFlight === 24">
                  <span v-if="season === 1">11.20.25 - 11.26.25</span>
                  <span v-else-if="season === 2">12.04.25 - 12.10.25</span>
                  <span v-else-if="season === 3">12.11.25 - 12.17.25</span>
                </span>
              </div>
              <div v-if="activeSeason === season" class="current-indicator">{{ getSeasonStatusIcon(season) }} {{
                getSeasonStatusMessage(season) }}</div>
              <div v-if="!hasSeasonData(season)" class="coming-soon-indicator">{{ getSeasonStatusIcon(season) }} {{
                getSeasonStatusMessage(season) }}</div>
            </div>
          </div>

          <!-- Boss Schedule Grid -->
          <div class="boss-schedule" :style="{ gridTemplateColumns: `repeat(${getSeasonCount()}, 1fr)` }">
            <!-- Row 1: Red Velvet Dragon positions -->
            <template v-for="season in getSeasonCount()" :key="`row1-${season}`">
              <div v-if="getBossForSeason(currentDestinysFlight, season, 1)" class="boss-cell">
                <img :src="getBossForSeason(currentDestinysFlight, season, 1)?.image"
                  :alt="getBossForSeason(currentDestinysFlight, season, 1)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(currentDestinysFlight, season, 1)?.name }}</div>
              </div>
              <div v-else class="boss-cell empty"></div>
            </template>

            <!-- Row 2: Avatar of Destiny positions -->
            <template v-for="season in getSeasonCount()" :key="`row2-${season}`">
              <div v-if="getBossForSeason(currentDestinysFlight, season, 2)" class="boss-cell">
                <img :src="getBossForSeason(currentDestinysFlight, season, 2)?.image"
                  :alt="getBossForSeason(currentDestinysFlight, season, 2)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(currentDestinysFlight, season, 2)?.name }}</div>
              </div>
              <div v-else class="boss-cell empty"></div>
            </template>

            <!-- Row 3: Living Abyss/Machine-God positions -->
            <template v-for="season in getSeasonCount()" :key="`row3-${season}`">
              <div v-if="getBossForSeason(currentDestinysFlight, season, 3)" class="boss-cell">
                <img :src="getBossForSeason(currentDestinysFlight, season, 3)?.image"
                  :alt="getBossForSeason(currentDestinysFlight, season, 3)?.name" class="boss-image">
                <div class="boss-name">{{ getBossForSeason(currentDestinysFlight, season, 3)?.name }}</div>
              </div>
              <div v-else class="boss-cell empty"></div>
            </template>
          </div>



          <!-- Mobile: Show only selected season -->
          <div class="boss-schedule-mobile">
            <div class="mobile-boss-list">
              <div v-for="boss in mobileBossList" :key="boss.position" class="mobile-boss-item">
                <img :src="boss.image" :alt="boss.name" class="mobile-boss-image">
                <div class="mobile-boss-name">{{ boss.name }}</div>
              </div>
              <div
                v-if="!getBossForSeason(currentDestinysFlight, activeSeason, 1) && !getBossForSeason(currentDestinysFlight, activeSeason, 2) && !getBossForSeason(currentDestinysFlight, activeSeason, 3)"
                class="mobile-no-bosses">
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
          <p class="loading-subtitle">Fetching battle analysis data for Season {{ getSeasonDisplayName(activeSeason) }}
          </p>
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

    <!-- Error Display Section -->
    <section v-if="sheetsState.fetchError && !isSeasonLoading && !analysisState.analysisComplete" class="error-section">
      <div class="container">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">Error Loading Season Data</h2>
          <p class="error-message">{{ sheetsState.fetchError }}</p>
          <div class="error-help">
            <p><strong>Common solutions:</strong></p>
            <ul>
              <li>Check if the sheet exists in your Google Spreadsheet with the exact name shown in the error</li>
              <li>Verify that the service account has access to the spreadsheet</li>
              <li>Ensure the spreadsheet ID is correct</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Season Status Section -->
    <section v-if="!hasSeasonData(activeSeason) && !isSeasonLoading && !sheetsState.fetchError"
      class="coming-soon-section" :class="getSeasonStatusClass()">
      <div class="container">
        <div class="coming-soon-content">
          <div class="coming-soon-icon">{{ getSeasonStatusIcon(activeSeason) }}</div>

          <!-- Dynamic title and subtitle based on season status -->
          <h2 class="coming-soon-title">
            <span v-if="currentDestinysFlight === 21 && activeSeason === 1">Season Just Finished</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 2">Previous Season</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 3">Previous Season</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 4">Current Season</span>
            <span v-else-if="currentDestinysFlight === 20 && activeSeason === 3">Previous Season</span>
            <span v-else>No Data Available</span>
          </h2>

          <p class="coming-soon-subtitle">
            <span v-if="currentDestinysFlight === 21 && activeSeason === 1">Season 21-1 has just ended and is currently
              being tallied.</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 2">Season 21-2 is a previous season with
              battle data available.</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 3">Season 21-3 is a previous season with
              battle data available.</span>
            <span v-else-if="currentDestinysFlight === 21 && activeSeason === 4">Season 21-4 is currently active with
              battle
              data available.</span>
            <span v-else-if="currentDestinysFlight === 20 && activeSeason === 3">Season 20-3 is a previous season with
              battle data available.</span>
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

            <!-- Season 21-2: Previous Season -->
            <template v-if="currentDestinysFlight === 21 && activeSeason === 2">
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

            <!-- Season 21-3: Previous Season -->
            <template v-if="currentDestinysFlight === 21 && activeSeason === 3">
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

            <!-- Season 21-4: Current Season -->
            <template v-if="currentDestinysFlight === 21 && activeSeason === 4">
              <div class="info-card current">
                <div class="info-icon">⚔️</div>
                <h3>Battles in Progress</h3>
                <p>This season is currently running with battle data available. Check the analysis below for detailed
                  performance metrics.</p>
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
            <template
              v-if="!(currentDestinysFlight === 21 && [1, 2, 3, 4].indexOf(activeSeason) !== -1) && !(currentDestinysFlight === 20 && activeSeason === 3)">
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
    <section class="results-section"
      v-if="hasSeasonData(activeSeason) && analysisState.analysisComplete && !isSeasonLoading && analysisState.battleData.length > 0">
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
          <!-- Red Velvet Dragon - only show if active in this season -->
          <div v-if="isBossActiveInSeason('Red Velvet Dragon', currentDestinysFlight, activeSeason)"
            class="boss-stat-card red-velvet">
            <div class="boss-stat-header">
              <div class="boss-icon">
                <img src="/img/Red_Velvet_Dragon.webp" alt="Red Velvet Dragon" class="boss-icon-image">
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
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(analysisState.battleStats?.redVelvetStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(analysisState.battleStats?.redVelvetStats.averageDamage || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- Avatar of Destiny - only show if active in this season -->
          <div v-if="isBossActiveInSeason('Avatar of Destiny', currentDestinysFlight, activeSeason)"
            class="boss-stat-card avatar">
            <div class="boss-stat-header">
              <div class="boss-icon">
                <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny"
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
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(analysisState.battleStats?.avatarStats.totalDamage
                  || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(analysisState.battleStats?.avatarStats.averageDamage
                  || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- Living Abyss - only show if active in this season -->
          <div v-if="isBossActiveInSeason('Living Abyss', currentDestinysFlight, activeSeason)"
            class="boss-stat-card living-abyss">
            <div class="boss-stat-header">
              <div class="boss-icon">
                <img src="/img/Living_Licorice_Abyss.webp" alt="Living Abyss" class="boss-icon-image">
              </div>
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

          <!-- Machine God - only show if active in this season -->
          <div v-if="isBossActiveInSeason('Machine-God of the Eternal Void', currentDestinysFlight, activeSeason)"
            class="boss-stat-card machine-god">
            <div class="boss-stat-header">
              <div class="boss-icon">
                <img src="/img/Machine-God_of_the_Eternal_Void_guild_ready.webp" alt="Machine-God of the Eternal Void"
                  class="boss-icon-image">
              </div>
              <h3>Machine God of the Eternal Void</h3>
            </div>
            <div class="boss-stat-content">
              <div class="boss-stat-item">
                <span class="stat-label">Participants:</span>
                <span class="stat-value">{{ analysisState.battleStats?.machineGodStats.participants || 0 }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Total Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(analysisState.battleStats?.machineGodStats.totalDamage || 0) }}</span>
              </div>
              <div class="boss-stat-item">
                <span class="stat-label">Average Damage:</span>
                <span class="stat-value">{{
                  BattleAnalyzer.formatDamage(analysisState.battleStats?.machineGodStats.averageDamage || 0) }}</span>
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
                  <th>{{ (currentDestinysFlight === 21 || currentDestinysFlight === 23 || currentDestinysFlight === 24)
                    ?
                    'Machine God of the Eternal Void' : 'Living Abyss' }}</th>
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
                      <div class="damage-value">{{ BattleAnalyzer.formatDamage((currentDestinysFlight === 21 ||
                        currentDestinysFlight === 23 || currentDestinysFlight === 24) ? (player.machineGod?.damage || 0)
                        :
                        player.livingAbyss.damage) }}</div>
                      <div class="battles-count">x{{ (currentDestinysFlight === 21 || currentDestinysFlight === 23 ||
                        currentDestinysFlight === 24) ? (player.machineGod?.battles || 0) : player.livingAbyss.battles
                        }}
                      </div>
                    </div>
                  </td>
                  <td class="damage-cell">
                    <div class="damage-info">
                      <div class="damage-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage +
                        player.avatarOfDestiny.damage + ((currentDestinysFlight === 21 || currentDestinysFlight === 23
                          ||
                          currentDestinysFlight === 24) ? (player.machineGod?.damage || 0) : player.livingAbyss.damage))
                        }}
                      </div>
                      <div class="battles-count">x{{ player.redVelvetDragon.battles + player.avatarOfDestiny.battles +
                        ((currentDestinysFlight === 21 || currentDestinysFlight === 23 || currentDestinysFlight === 24)
                          ?
                        (player.machineGod?.battles || 0) : player.livingAbyss.battles) }}</div>
                    </div>
                  </td>
                  <td class="ticket-cell">
                    <div class="ticket-info">
                      <div class="ticket-count" :class="getTicketStatusClass(player, activeSeason)">
                        {{ getTicketsUsed(player, activeSeason) }}/18
                      </div>
                      <div class="ticket-status" :class="getTicketStatusClass(player, activeSeason)">

                        {{ getTicketStatusText(player, activeSeason) }}
                      </div>
                    </div>
                  </td>
                  <td class="rank-cell">
                    <span class="guild-rank-badge"
                      :class="BattleAnalyzer.getGuildRankBadgeClass(getPlayerGuildRank(player.playerName))">
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
                <div class="mobile-guild-rank"
                  :class="BattleAnalyzer.getGuildRankBadgeClass(getPlayerGuildRank(player.playerName))">
                  {{ getPlayerGuildRank(player.playerName) }}
                </div>
              </div>

              <div class="mobile-boss-damage">
                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">
                    <img src="/img/Red_Velvet_Dragon.webp" alt="Red Velvet Dragon" class="boss-icon-image">
                  </div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage) }}
                    </div>
                    <div class="mobile-battles-count">x{{ player.redVelvetDragon.battles }}</div>
                  </div>
                </div>

                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">
                    <img src="/img/Avatar_of_destiny_guild_battle_ready.webp" alt="Avatar of Destiny"
                      class="boss-icon-image">
                  </div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage(player.avatarOfDestiny.damage) }}
                    </div>
                    <div class="mobile-battles-count">x{{ player.avatarOfDestiny.battles }}</div>
                  </div>
                </div>

                <div class="mobile-boss-damage-item">
                  <div class="mobile-boss-icon">
                    <img
                      :src="(currentDestinysFlight === 21 || currentDestinysFlight === 23 || currentDestinysFlight === 24) ? '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp' : '/img/Living_Licorice_Abyss.webp'"
                      :alt="(currentDestinysFlight === 21 || currentDestinysFlight === 23 || currentDestinysFlight === 24) ? 'Machine God of the Eternal Void' : 'Living Abyss'"
                      class="boss-icon-image">
                  </div>
                  <div class="mobile-boss-damage-info">
                    <div class="mobile-damage-value">{{ BattleAnalyzer.formatDamage((currentDestinysFlight === 21 ||
                      currentDestinysFlight === 23 || currentDestinysFlight === 24) ? (player.machineGod?.damage || 0) :
                      player.livingAbyss.damage) }}</div>
                    <div class="mobile-battles-count">x{{ (currentDestinysFlight === 21 || currentDestinysFlight === 23
                      ||
                      currentDestinysFlight === 24) ? (player.machineGod?.battles || 0) : player.livingAbyss.battles }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mobile-total-section">
                <div class="mobile-total-damage">
                  <div class="mobile-total-label">Season Total:</div>
                  <div class="mobile-total-value">{{ BattleAnalyzer.formatDamage(player.redVelvetDragon.damage +
                    player.avatarOfDestiny.damage + ((currentDestinysFlight === 21 || currentDestinysFlight === 23 ||
                      currentDestinysFlight === 24) ? (player.machineGod?.damage || 0) : player.livingAbyss.damage)) }}
                  </div>
                </div>
                <div class="mobile-ticket-status" :class="getTicketStatusClass(player, activeSeason)">
                  <div class="mobile-ticket-count">{{ getTicketsUsed(player, activeSeason) }}/18</div>
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

.info-box,
.requirements-box,
.other-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.info-box:hover,
.requirements-box:hover,
.other-box:hover {
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

.info-list,
.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item,
.requirement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.info-item:hover,
.requirement-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.info-icon,
.requirement-icon {
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

.info-text,
.requirement-text {
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

  .info-box,
  .requirements-box,
  .other-box {
    padding: 1.5rem;
  }

  .info-text,
  .requirement-text,
  .other-text {
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

.current-indicator,
.coming-soon-indicator {
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