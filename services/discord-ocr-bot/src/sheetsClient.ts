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

async function fetchSpreadsheetSheets() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  return { sheets, list: res.data.sheets ?? [] }
}

/** Move tab to the rightmost position (after all existing tabs). */
async function moveSheetTabToEnd(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number,
  sheetCount: number
) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId, index: Math.max(0, sheetCount - 1) },
            fields: 'index'
          }
        }
      ]
    }
  })
}

export async function sheetTabExists(seasonId: string): Promise<boolean> {
  const { list } = await fetchSpreadsheetSheets()
  return list.some(s => s.properties?.title === seasonId)
}

function resolveTemplateSheetId(
  list: Awaited<ReturnType<typeof fetchSpreadsheetSheets>>['list']
): number {
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
  const { sheets, list } = await fetchSpreadsheetSheets()
  const exists = list.some(s => s.properties?.title === seasonId)

  if (exists && !opts?.overwrite) {
    return {
      created: false,
      warning: `Sheet tab "${seasonId}" already exists. Delete it in Google Sheets or pass overwrite.`,
      playerCount: players.length
    }
  }

  const grid = buildSeasonSheetGrid(seasonId, players)

  if (exists && opts?.overwrite) {
    const existing = list.find(s => s.properties?.title === seasonId)
    const existingId = existing?.properties?.sheetId
    if (existingId != null && list.length > 1) {
      await moveSheetTabToEnd(sheets, existingId, list.length)
    }
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

  const templateSheetId = resolveTemplateSheetId(list)
  const insertSheetIndex = list.length

  const duplicate = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          duplicateSheet: {
            sourceSheetId: templateSheetId,
            insertSheetIndex,
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

  // Ensure rightmost tab even if API ignores insertSheetIndex on duplicate
  await moveSheetTabToEnd(sheets, newSheetId, list.length + 1)

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${seasonId}'!A1:AA${grid.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: grid }
  })

  return { created: true, playerCount: players.length }
}
