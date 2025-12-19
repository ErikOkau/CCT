// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production
  css: ['~/assets/scss/main.scss'],
  
  // Enable SSR for proper API routes and dynamic imports
  ssr: true,
  
  // Optimize for Vercel deployment
  nitro: {
    preset: 'vercel',
    minify: true,
    sourceMap: false,
    // Add cache control headers to prevent caching issues
    routeRules: {
      '/api/**': { 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      },
      '/_nuxt/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=31536000, immutable' 
        }
      }
    }
  },
  
  // Disable experimental features that cause issues
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false
  },
  
  runtimeConfig: {
    // Server-side environment variables
    googleSheetsCredentials: process.env.GOOGLE_SHEETS_CREDENTIALS,
    // Public keys that are exposed to the client
    public: {
      // Configuration for client-side features
    }
  },
  
  // Ensure proper build configuration
  build: {
    transpile: [],
    // Ensure assets are properly generated
    analyze: false
  },
  
  // Vite configuration for better module resolution
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router']
          }
        }
      }
    },
    optimizeDeps: {
      include: []
    }
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
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'version', content: Date.now().toString() }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/cctLogo.png' },
        { rel: 'apple-touch-icon', href: '/img/cctLogo.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  }
})
