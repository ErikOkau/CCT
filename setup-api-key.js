#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔑 Google Cloud Vision API Key Setup')
console.log('=====================================')

// Check if .env file exists
const envPath = path.join(__dirname, '.env')
const envExists = fs.existsSync(envPath)

if (envExists) {
  console.log('✅ .env file already exists')
  const envContent = fs.readFileSync(envPath, 'utf8')
  if (envContent.includes('GOOGLE_CLOUD_VISION_API_KEY')) {
    console.log('✅ API key is already configured')
    console.log('You can now restart your development server: npm run dev')
  } else {
    console.log('⚠️  .env file exists but no API key found')
    console.log('Add this line to your .env file:')
    console.log('GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here')
  }
} else {
  console.log('📝 Creating .env file...')
  const envContent = `# Google Cloud Vision API Key
# Get your API key from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here

# Other environment variables can be added here
NODE_ENV=development
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created')
  console.log('📋 Next steps:')
  console.log('1. Get your API key from: https://console.cloud.google.com/apis/credentials')
  console.log('2. Replace "your_api_key_here" in the .env file with your actual API key')
  console.log('3. Restart your development server: npm run dev')
}

console.log('\n📖 For detailed setup instructions, see: GOOGLE_CLOUD_SETUP.md')
