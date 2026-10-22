import sharp from 'sharp'
import type { ParsedScreenshot } from '../../../utils/guildBattleSheet.ts'
import {
  buildVisionExtractionPrompt,
  parseVisionModelJson
} from '../../../utils/guildBattleVisionParse.ts'
import { getActiveBossUiColumnOrder } from '../../../utils/guildBattleBosses.ts'
import { parseSeasonIdFromText } from '../../../utils/guildBattleOcrParse.ts'
import { getActiveBossFields, parseSeasonId } from '../../../utils/seasonConfig.ts'

export type OcrProvider = 'openai' | 'tesseract'

export function getOcrProvider(): OcrProvider {
  const explicit = process.env.OCR_PROVIDER?.trim().toLowerCase()
  if (explicit === 'tesseract') return 'tesseract'
  if (explicit === 'openai' || explicit === 'chatgpt' || explicit === 'gpt') return 'openai'
  if (process.env.CHATGPT_API?.trim()) return 'openai'
  return 'tesseract'
}

function getOpenAiApiKey(): string {
  const key = process.env.CHATGPT_API?.trim()
  if (!key) throw new Error('CHATGPT_API is not set (required for OpenAI vision OCR)')
  return key
}

async function imageBufferForVision(imageBuffer: Buffer): Promise<string> {
  const jpeg = await sharp(imageBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}

function resolveHeaderBossesFromSeason(seasonId: string | null, flight: number): ParsedScreenshot['headerBosses'] {
  if (!seasonId) return []
  const parsed = parseSeasonId(seasonId)
  if (!parsed) return []
  return getActiveBossUiColumnOrder(
    getActiveBossFields(parsed.flight, parsed.season),
    parsed.flight
  )
}

export async function parseParticipantsScreenshotVision(
  imageBuffer: Buffer,
  options?: { seasonId?: string; flightHint?: number }
): Promise<ParsedScreenshot> {
  const warnings: string[] = []
  const model = process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o'
  const imageUrl = await imageBufferForVision(imageBuffer)
  const prompt = buildVisionExtractionPrompt(options?.seasonId)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getOpenAiApiKey()}`
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenAI vision failed (${response.status}): ${errText.slice(0, 400)}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content ?? ''
  const parsed = parseVisionModelJson(content, { seasonIdHint: options?.seasonId })

  warnings.push(...parsed.warnings)

  let flight = options?.flightHint ?? 35
  const seasonId = parsed.seasonId ?? options?.seasonId ?? null
  if (seasonId) {
    const p = parseSeasonId(seasonId)
    if (p) flight = p.flight
  }

  let headerBosses = parsed.headerBosses
  if (headerBosses.length < 2) {
    headerBosses = resolveHeaderBossesFromSeason(seasonId, flight)
    if (headerBosses.length >= 2) {
      warnings.push('Boss columns from season config (vision did not return two bosses)')
    }
  }

  if (options?.seasonId && parsed.seasonId && options.seasonId !== parsed.seasonId) {
    warnings.push(
      `Command \`${options.seasonId}\` but screenshot says **${parsed.seasonId}** — use \`?submit_result ${parsed.seasonId}\` for the sheet tab`
    )
  }

  const ocrSeasonFromFooter = parseSeasonIdFromText(content)
  if (!parsed.seasonId && ocrSeasonFromFooter) {
    parsed.seasonId = ocrSeasonFromFooter
  }

  if (parsed.rows.length < 3) {
    warnings.push(
      `Only ${parsed.rows.length} rows from vision on this image — include the full Participants table (~5 rows).`
    )
  }

  return {
    seasonId: parsed.seasonId ?? seasonId,
    uiParticipantCount: parsed.uiParticipantCount,
    headerBosses,
    rows: parsed.rows,
    warnings
  }
}
