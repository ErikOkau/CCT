// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  
  // Enable SSR for both website and web app modes
  ssr: true,
  
  // Optimize for Vercel deployment
  nitro: {
    preset: 'vercel'
  },
  
  runtimeConfig: {
    // Server-side environment variables
    googleCloudVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    googleSheetsCredentials: process.env.GOOGLE_SHEETS_CREDENTIALS,
    // Public keys that are exposed to the client
    public: {
      hasGoogleVisionApi: false // Set to false since we're using hardcoded data
    }
  },
  
  // Ensure proper build configuration
  build: {
    transpile: ['@supabase/supabase-js']
  },
  
  // App configuration for PWA features
  app: {
    head: {
      title: 'Chaos Control Team - Guild Battle Analyzer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Guild site & Battle Analyzer for Chaos Control Team' },
        { name: 'theme-color', content: '#1e3c72' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'CCT Analyzer' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/cctLogo.png' },
        { rel: 'apple-touch-icon', href: '/img/cctLogo.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  }
})
