import sharp from 'sharp'
import type { BossField } from '../../../utils/guildBattleBosses.ts'
import { getActiveBossUiColumnOrder } from '../../../utils/guildBattleBosses.ts'
import type { OcrPlayerRow, ParsedScreenshot } from '../../../utils/guildBattleSheet.ts'
import {
  filterAndDedupeOcrRows,
  MAX_IMAGES,
  parseBossHeadersFromText,
  parseParticipantsFullText,
  parseSeasonIdFromText
} from '../../../utils/guildBattleOcrParse.ts'
import { getActiveBossFields, parseSeasonId } from '../../../utils/seasonConfig.ts'
import { ocrBuffer, terminateOcrWorker } from './ocrSession.ts'

export { MAX_IMAGES }

const TABLE_CROP = { left: 0, top: 0.11, width: 1, height: 0.8 }
const HEADER_CROP = { left: 0.22, top: 0.08, width: 0.76, height: 0.12 }
const SEASON_CROP = { left: 0.62, top: 0.82, width: 0.36, height: 0.14 }

async function preprocessTable(imageBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata()
  const w = meta.width ?? 875
  const h = meta.height ?? 540
  const left = Math.floor(TABLE_CROP.left * w)
  const top = Math.floor(TABLE_CROP.top * h)
  const width = Math.floor(TABLE_CROP.width * w)
  const height = Math.floor(TABLE_CROP.height * h)

  return sharp(imageBuffer)
    .extract({ left, top, width: Math.min(width, w - left), height: Math.min(height, h - top) })
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: Math.min(2400, Math.floor(width * 2.75)) })
    .png()
    .toBuffer()
}

function cropNormBuffer(imageBuffer: Buffer, box: typeof SEASON_CROP): Promise<Buffer> {
  return sharp(imageBuffer)
    .metadata()
    .then(meta => {
      const w = meta.width ?? 1
      const h = meta.height ?? 1
      const left = Math.floor(box.left * w)
      const top = Math.floor(box.top * h)
      const width = Math.floor(box.width * w)
      const height = Math.floor(box.height * h)
      return sharp(imageBuffer)
        .extract({ left, top, width: Math.min(w - left, width), height: Math.min(h - top, height) })
        .png()
        .toBuffer()
    })
}

function resolveHeaderBosses(
  ocrText: string,
  flight: number,
  seasonIdForFallback: string | null
): BossField[] {
  const headerBosses = parseBossHeadersFromText(ocrText, flight)
  if (headerBosses.length >= 2) return headerBosses

  if (seasonIdForFallback) {
    const parsed = parseSeasonId(seasonIdForFallback)
    if (parsed) {
      return getActiveBossUiColumnOrder(
        getActiveBossFields(parsed.flight, parsed.season),
        parsed.flight
      )
    }
  }
  return headerBosses
}

export async function parseParticipantsScreenshot(
  imageBuffer: Buffer,
  options?: { seasonId?: string; flightHint?: number }
): Promise<ParsedScreenshot> {
  const warnings: string[] = []

  const [seasonBuf, headerBuf, tableBuf] = await Promise.all([
    cropNormBuffer(imageBuffer, SEASON_CROP),
    cropNormBuffer(imageBuffer, HEADER_CROP),
    preprocessTable(imageBuffer)
  ])

  const [seasonText, headerText, tableText] = await Promise.all([
    ocrBuffer(seasonBuf),
    ocrBuffer(headerBuf),
    ocrBuffer(tableBuf)
  ])

  const ocrSeasonId = parseSeasonIdFromText(seasonText + '\n' + tableText)
  const seasonId = options?.seasonId ?? ocrSeasonId

  let flight = options?.flightHint ?? 35
  if (seasonId) {
    const p = parseSeasonId(seasonId)
    if (p) flight = p.flight
  }

  const seasonForBossFallback = ocrSeasonId ?? seasonId
  if (options?.seasonId && ocrSeasonId && options.seasonId !== ocrSeasonId) {
    warnings.push(
      `Command \`${options.seasonId}\` but screenshot says **${ocrSeasonId}** — use \`?submit_result ${ocrSeasonId}\` for the sheet tab`
    )
  }

  const headerBosses = resolveHeaderBosses(
    `${headerText}\n${tableText.slice(0, 500)}`,
    flight,
    seasonForBossFallback
  )
  if (headerBosses.length < 2) {
    warnings.push('Using season rotation for boss columns (header OCR unclear)')
  }

  const parsed = parseParticipantsFullText(tableText, headerBosses)
  warnings.push(...parsed.warnings)

  if (parsed.rows.length < 4) {
    warnings.push(`Only ${parsed.rows.length} rows parsed from this image — scroll so ~5 members are visible and avoid cropping the table`)
  }

  return {
    seasonId: ocrSeasonId ?? seasonId,
    headerBosses,
    rows: filterAndDedupeOcrRows(parsed.rows),
    warnings
  }
}

export async function parseParticipantsImages(
  buffers: Buffer[],
  seasonId: string
): Promise<ParsedScreenshot> {
  const parsed = parseSeasonId(seasonId)
  const flightHint = parsed?.flight

  const allRows: OcrPlayerRow[] = []
  const warnings: string[] = []
  let headerBosses: BossField[] = []
  const detectedSeasons: string[] = []

  try {
    for (const buf of buffers.slice(0, MAX_IMAGES)) {
      const result = await parseParticipantsScreenshot(buf, { seasonId, flightHint })
      if (result.seasonId) detectedSeasons.push(result.seasonId)
      if (result.headerBosses.length >= headerBosses.length) {
        headerBosses = result.headerBosses
      }
      warnings.push(...result.warnings)
      allRows.push(...result.rows)
    }
  } finally {
    await terminateOcrWorker()
  }

  const ocrSeason = detectedSeasons[0]
  const effectiveSeason = ocrSeason && ocrSeason !== seasonId ? ocrSeason : seasonId
  const merged = filterAndDedupeOcrRows(allRows)

  if (merged.length < 20) {
    warnings.push(
      `Only ${merged.length} players parsed (guild has up to 30). Attach **6 screenshots** (~5 members each, full Participants panel) for best coverage.`
    )
  }

  return {
    seasonId: effectiveSeason,
    headerBosses,
    rows: merged,
    warnings
  }
}
