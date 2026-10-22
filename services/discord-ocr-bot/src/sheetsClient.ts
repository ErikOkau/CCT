import { google } from 'googleapis'
import { buildSeasonSheetGrid, SHEET_TEMPLATE_TAB } from '../../../utils/guildBattleSheet.ts'
import type { OcrPlayerRow } from '../../../utils/guildBattleSheet.ts'
import { SPREADSHEET_ID } from '../../../utils/seasonConfig.ts'
import { parseGoogleSheetsCredentials } from './googleCredentials.ts'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

function getAuth() {
  const credentials = parseGoogleSheetsCredentials()
  return new google.auth.GoogleAuth({ credentials, scopes: SCOPES })
}

export async function sheetTabExists(seasonId: string): Promise<boolean> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  return (res.data.sheets ?? []).some(s => s.properties?.title === seasonId)
}

async function resolveTemplateSheetId(): Promise<number> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const list = res.data.sheets ?? []

  const template = list.find(s => s.properties?.title === SHEET_TEMPLATE_TAB)
  if (template?.properties?.sheetId != null) return template.properties.sheetId

  const fallback = list.find(s => s.properties?.title === '35-4') ?? list[list.length - 1]
  if (fallback?.properties?.sheetId == null) {
    throw new Error('No template sheet found in spreadsheet')
  }
  return fallback.properties.sheetId
}

export async function createSeasonTabFromOcr(
  seasonId: string,
  players: OcrPlayerRow[],
  opts?: { overwrite?: boolean }
): Promise<{ created: boolean; warning?: string; playerCount: number }> {
  const exists = await sheetTabExists(seasonId)
  if (exists && !opts?.overwrite) {
    return {
      created: false,
      warning: `Sheet tab "${seasonId}" already exists. Delete it in Google Sheets or pass overwrite.`,
      playerCount: players.length
    }
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const grid = buildSeasonSheetGrid(seasonId, players)

  if (exists && opts?.overwrite) {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${seasonId}'!A1:AA100`
    })
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${seasonId}'!A1:AA${grid.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: grid }
    })
    return { created: true, playerCount: players.length }
  }

  const templateSheetId = await resolveTemplateSheetId()
  const duplicate = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          duplicateSheet: {
            sourceSheetId: templateSheetId,
            newSheetName: seasonId
          }
        }
      ]
    }
  })

  const newSheetId = duplicate.data.replies?.[0]?.duplicateSheet?.properties?.sheetId
  if (newSheetId == null) {
    throw new Error('Failed to duplicate template sheet')
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${seasonId}'!A1:AA${grid.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: grid }
  })

  return { created: true, playerCount: players.length }
}
