import '../src/loadEnv.ts'
import { google } from 'googleapis'
import { SPREADSHEET_ID } from '../../../utils/seasonConfig.ts'
import { parseGoogleSheetsCredentials } from '../src/googleCredentials.ts'

async function main() {
  const credentials = parseGoogleSheetsCredentials()
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const titles = (res.data.sheets ?? []).map(s => s.properties?.title).filter(Boolean)
  console.log(`✅ Sheets access OK (${titles.length} tabs). Latest tabs:`, titles.slice(-5))
}

main().catch(err => {
  console.error('❌ Sheets access failed:', err.message)
  process.exit(1)
})
