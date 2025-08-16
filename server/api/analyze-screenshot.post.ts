import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { image, features } = body

    // Check if Google Cloud Vision API key is available
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key not configured')
    }

    // Call Google Cloud Vision API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: image
            },
            features: features || [
              { type: 'TEXT_DETECTION' },
              { type: 'DOCUMENT_TEXT_DETECTION' }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google Vision API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result

  } catch (error) {
    console.error('Screenshot analysis error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Screenshot analysis failed'
    })
  }
})
