import { defineEventHandler, readBody, createError } from 'h3'
import type { GuideSlug } from '~/utils/guildGuides'
import { getCookieBuildTargets } from '~/utils/gearCheck/buildTargets'
import { matchCookieBuild } from '~/utils/gearCheck/matchCookie'
import { compareGearToBuild } from '~/utils/gearCheck/compare'
import { buildGearVisionPrompt } from '~/utils/gearCheck/visionPrompt'
import { parseGearVisionJson } from '~/utils/gearCheck/parseVision'
import type { GearCheckResult } from '~/utils/gearCheck/types'

const VALID_SLUGS = new Set<GuideSlug>(['mgev', 'tla', 'aod', 'rvd'])

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const imageData = body?.imageData as string | undefined
  const bossSlug = body?.bossSlug as GuideSlug | undefined
  const overrideBuildId = (body?.overrideBuildId as string | undefined) ?? null

  if (!imageData?.startsWith('data:image')) {
    throw createError({ statusCode: 400, statusMessage: 'imageData (data URL) is required' })
  }
  if (!bossSlug || !VALID_SLUGS.has(bossSlug)) {
    throw createError({ statusCode: 400, statusMessage: 'bossSlug must be mgev, tla, aod, or rvd' })
  }

  const apiKey = process.env.CHATGPT_API?.trim()
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'CHATGPT_API is not configured on the server' })
  }

  const model = process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o'
  const prompt = buildGearVisionPrompt(bossSlug)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageData, detail: 'high' } }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw createError({
      statusCode: 502,
      statusMessage: `OpenAI vision failed: ${errText.slice(0, 300)}`
    })
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''
  const vision = parseGearVisionJson(content)

  const targets = getCookieBuildTargets(bossSlug)
  const build = matchCookieBuild(vision.cookieName, targets, overrideBuildId)
  const comparisons = compareGearToBuild(vision, build)

  const result: GearCheckResult = {
    bossSlug,
    matchedBuildId: build?.id ?? null,
    matchedShort: build?.short ?? null,
    cookieName: vision.cookieName,
    vision,
    comparisons
  }

  return { ok: true, result }
})
