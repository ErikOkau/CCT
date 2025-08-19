// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    // Server-side environment variables
    googleCloudVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    googleSheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY,
    // Public keys that are exposed to the client
    public: {
      hasGoogleVisionApi: false // Set to false since we're using hardcoded data
    }
  },
  nitro: {
    preset: 'vercel'
  },
  // Ensure proper build configuration
  build: {
    transpile: ['@supabase/supabase-js']
  }
})
