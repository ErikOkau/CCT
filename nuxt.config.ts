// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    // Server-side environment variables
    googleCloudVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    googleSheetsCredentialsPath: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    // Public keys that are exposed to the client
    public: {
      hasGoogleVisionApi: false, // Set to false since we're using hardcoded data
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  nitro: {
    preset: 'vercel'
  }
})
