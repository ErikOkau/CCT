import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { imageData } = body

    if (!imageData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image data is required'
      })
    }

    const chatGptApiKey = process.env.CHATGPT_API
    if (!chatGptApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'ChatGPT API key not configured'
      })
    }

    // Prepare the prompt for ChatGPT with simplified format
    const prompt = `Please analyze this screenshot of a game leaderboard and extract the data in a simple 4-row format. 

FIRST, identify the boss names from the column headers at the top of the screenshot. Look for the main damage columns (usually the 2nd and 3rd columns after the Player column).

Then, extract the data in exactly this format with 4 rows separated by blank columns:

Row 1: Member names and 1st boss damage (extract the first boss name you see in the headers)
Row 2: Member names and 2nd boss damage (extract the second boss name you see in the headers)  
Row 3: Member names and season total damage
Row 4: (blank row for separation)

CRITICAL INSTRUCTIONS:
- Look at the column headers to identify the actual boss names (e.g., "Avatar of Destiny", "Living Abyss", etc.)
- DO NOT use generic names like "Boss 1" or "Boss 2" - use the actual names from the screenshot
- Extract ONLY real player names that are visible in the screenshot
- DO NOT generate fake player names
- If you cannot read a player name clearly, use "Unknown Player"
- Format each row as: "PlayerName, DamageValue" (e.g., "brownmascara, 53,701,335,417")
- Use commas as delimiters
- Do NOT include quotes around values
- Include ALL players visible in the screenshot
- Sort players by damage from highest to lowest within each row
- If a player has no damage for a specific boss, use "0" for damage
- Make sure the boss names in your output match exactly what you see in the screenshot headers
- IMPORTANT: Extract the EXACT damage values as shown in the screenshot - do NOT round, truncate, or modify the numbers
- Preserve all digits and commas in the damage values exactly as they appear

Example format (replace boss names with actual names from your screenshot):
PlayerName, DamageValue
goonhak, 51,651,235,846
pavlovapookie, 49,925,434,664

PlayerName, DamageValue  
brownmascara, 229,966,815,174
goonhak, 217,358,214,628

PlayerName, DamageValue
brownmascara, 283,668,150,591
goonhak, 269,009,450,474

(blank row)`

    // Call ChatGPT API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chatGptApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ChatGPT API Response:', errorText)
      throw createError({
        statusCode: response.status,
        statusMessage: `ChatGPT API error: ${response.statusText}`
      })
    }

    const data = await response.json()
    return {
      success: true,
      csvData: data.choices[0].message.content
    }

  } catch (error: any) {
    console.error('Error processing screenshot:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error processing screenshot'
    })
  }
})
