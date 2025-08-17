#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🔧 Google Sheets API Setup Helper')
console.log('==================================')

// Check if credentials file exists
const credentialsPath = './google-sheets-credentials.json'
if (fs.existsSync(credentialsPath)) {
  console.log('✅ Google Sheets credentials file found!')
  
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    console.log(`📧 Service Account Email: ${credentials.client_email}`)
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Share your Google Sheets with this email address')
    console.log('2. Set the environment variable:')
    console.log('   GOOGLE_SHEETS_CREDENTIALS_PATH=./google-sheets-credentials.json')
    console.log('3. Restart your development server')
  } catch (error) {
    console.log('❌ Error reading credentials file:', error.message)
  }
} else {
  console.log('❌ Google Sheets credentials file not found!')
  console.log('')
  console.log('📋 To set up Google Sheets API:')
  console.log('1. Follow the instructions in GOOGLE_CLOUD_SETUP.md')
  console.log('2. Download the service account JSON key file')
  console.log('3. Save it as "google-sheets-credentials.json" in this directory')
  console.log('4. Run this script again')
}

// Check if .env file exists
const envPath = './.env'
if (fs.existsSync(envPath)) {
  console.log('')
  console.log('✅ .env file found!')
  const envContent = fs.readFileSync(envPath, 'utf8')
  if (envContent.includes('GOOGLE_SHEETS_CREDENTIALS_PATH')) {
    console.log('✅ GOOGLE_SHEETS_CREDENTIALS_PATH is configured')
  } else {
    console.log('⚠️  GOOGLE_SHEETS_CREDENTIALS_PATH not found in .env file')
    console.log('   Add: GOOGLE_SHEETS_CREDENTIALS_PATH=./google-sheets-credentials.json')
  }
} else {
  console.log('')
  console.log('⚠️  .env file not found!')
  console.log('   Create a .env file with:')
  console.log('   GOOGLE_SHEETS_CREDENTIALS_PATH=./google-sheets-credentials.json')
}

console.log('')
console.log('🎯 Test your setup:')
console.log('1. Go to /test-sheets page')
console.log('2. Click "Fetch from Google Sheets"')
console.log('3. You should see all 30 players from the guild')
console.log('4. New spreadsheet ID: 1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs')
