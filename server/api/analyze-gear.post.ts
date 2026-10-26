import { defineEventHandler, readBody, createError } from 'h3'
import { getCookieBuildTargets, isGearCheckMode, type GearCheckMode } from '~/utils/gearCheck/buildTargets'
import { matchCookieBuild } from '~/utils/gearCheck/matchCookie'
import { compareGearToBuild } from '~/utils/gearCheck/compare'
import { buildGearValidatePrompt, buildGearVisionPrompt } from '~/utils/gearCheck/visionPrompt'
import { parseGearVisionJson } from '~/utils/gearCheck/parseVision'
import type { GearCheckResult } from '~/utils/gearCheck/types'
import { callOpenAiVisionJson } from '../utils/openaiJsonVision'
import { extractJsonObjectFromModelText } from '~/utils/guildBattleVisionParse'
import { creamPuffHpRequired, WA_ATK_SPD_REQ } from '~/utils/tlaGuide'

async function analyzeOneImage(
  apiKey: string,
  model: string,
  bossSlug: GearCheckMode,
  imageData: string,
  overrideBuildId: string | null,
  tlaContext?: { windArcherHp?: number; grimoireHpPercent?: number }
): Promise<GearCheckResult> {
  const validateRaw = await callOpenAiVisionJson(
    apiKey,
    model,
    buildGearValidatePrompt(),
    imageData,
    512
  )
  let validate: { isGearScreen?: boolean; statsTab?: string; warnings?: string[] } = {}
  try {
    validate = JSON.parse(extractJsonObjectFromModelText(validateRaw))
  } catch {
    /* continue with full pass */
  }

  const statsRaw = await callOpenAiVisionJson(
    apiKey,
    model,
    buildGearVisionPrompt(bossSlug),
    imageData,
    2048
  )
  const vision = parseGearVisionJson(statsRaw)
  if (validate.isGearScreen === false) {
    vision.warnings.push('Screenshot may not be the Gear window — use Gear → Total.')
  }
  if (validate.statsTab && validate.statsTab !== 'Total') {
    vision.warnings.push(`Stats tab looks like "${validate.statsTab}" — Total tab is recommended.`)
  }
  if (Array.isArray(validate.warnings)) {
    vision.warnings.push(...validate.warnings.map(String))
  }

  const targets = getCookieBuildTargets(bossSlug)
  const build = matchCookieBuild(vision.cookieName, targets, overrideBuildId)
  let comparisons = compareGearToBuild(vision, build)

  if (bossSlug === 'tla' && build?.id === 'cpuff' && tlaContext?.windArcherHp) {
    const hp = vision.stats.find(s => s.statKey === 'hp')?.value
    const required = creamPuffHpRequired(tlaContext.windArcherHp, tlaContext.grimoireHpPercent ?? 12)
    if (hp != null) {
      comparisons = comparisons.map(row => {
        if (row.statKey !== 'hp') return row
        const met = hp > required
        return {
          ...row,
          targetLabel: `>${Math.round(required).toLocaleString()} (vs WA)`,
          scannedLabel: Math.round(hp).toLocaleString(),
          status: met ? 'met' : 'low',
          gap: hp - required
        }
      })
    }
  }

  if (bossSlug === 'tla' && build?.id === 'warcher') {
    const aspd = vision.stats.find(s => s.statKey === 'atkSpd')?.value
    if (aspd != null && aspd < WA_ATK_SPD_REQ) {
      comparisons = comparisons.map(row =>
        row.statKey === 'atkSpd'
          ? { ...row, status: aspd >= WA_ATK_SPD_REQ * 0.98 ? 'close' : 'low' }
          : row
      )
    }
  }

  return {
    bossSlug,
    matchedBuildId: build?.id ?? null,
    matchedShort: build?.short ?? null,
    cookieName: vision.cookieName,
    vision,
    comparisons
  }
}

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const imageData = body?.imageData as string | undefined
  const images = body?.images as string[] | undefined
  const bossSlug = body?.bossSlug as string | undefined
  const overrideBuildId = (body?.overrideBuildId as string | undefined) ?? null
  const tlaContext = body?.tlaContext as { windArcherHp?: number; grimoireHpPercent?: number } | undefined

  const list = images?.length ? images : imageData ? [imageData] : []
  if (!list.every(u => u.startsWith('data:image'))) {
    throw createError({ statusCode: 400, statusMessage: 'imageData or images[] (data URLs) required' })
  }
  if (!bossSlug || !isGearCheckMode(bossSlug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'bossSlug must be mgev, tla, aod, or rvd'
    })
  }

  const apiKey = process.env.CHATGPT_API?.trim()
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'CHATGPT_API is not configured on the server' })
  }

  const model = process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o'

  try {
    if (list.length === 1) {
      const result = await analyzeOneImage(apiKey, model, bossSlug, list[0]!, overrideBuildId, tlaContext)
      return { ok: true, result, results: [result] }
    }

    const results: GearCheckResult[] = []
    for (let i = 0; i < list.length; i++) {
      const result = await analyzeOneImage(
        apiKey,
        model,
        bossSlug,
        list[i]!,
        i === 0 ? overrideBuildId : null,
        tlaContext
      )
      results.push(result)
    }
    return { ok: true, result: results[0], results }
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message ?? 'Gear vision failed'
    })
  }
})
