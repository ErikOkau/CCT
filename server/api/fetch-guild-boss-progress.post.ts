import { defineEventHandler, readBody, setHeader } from 'h3'
import { google } from 'googleapis'
import { SPREADSHEET_ID } from '~/utils/seasonConfig'
import { parseGuildBossProgressRows } from '~/utils/guildBossProgressSheet'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

  const body = await readBody(event).catch(() => ({}))
  const spreadsheetId = (body?.spreadsheetId as string | undefined)?.trim() || SPREADSHEET_ID

  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!credentialsJson) {
    return { ok: false, progress: null, error: 'GOOGLE_SHEETS_CREDENTIALS not set' }
  }

  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })
  const sheets = google.sheets({ version: 'v4', auth })

  const range = `'Guild Progress'!A1:F24`

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    })
    const progress = parseGuildBossProgressRows(response.data.values ?? [])
    return { ok: true, progress }
  } catch (err: any) {
    const code = err.code || err.response?.status
    if (code === 404 || String(err.message || '').includes('Unable to parse range')) {
      return { ok: true, progress: null }
    }
    return { ok: false, progress: null, error: err.message ?? 'Failed to load Guild Progress tab' }
  }
})
