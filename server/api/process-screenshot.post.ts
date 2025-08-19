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

    // Prepare the prompt for ChatGPT
    const prompt = `Please analyze this screenshot of a game leaderboard and extract the data in CSV format. The screenshot shows player performance data with columns for Player, Red Velvet Dragon, Avatar of Destiny, and Season Total. Each row should include:

1. Player name
2. Red Velvet Dragon damage (in billions) and battles count
3. Avatar of Destiny damage (in billions) and battles count  
4. Season Total damage (in billions) and battles count
5. Player rank (Member/Officer/Leader)

Please format the output as a CSV with the following structure:
"Rank,Player Name,Red Velvet Dragon Damage (Billion),Red Velvet Dragon Battles,Avatar of Destiny Damage (Billion),Avatar of Destiny Battles,Season Total Damage (Billion),Season Total Battles,Guild Rank"

If a player has no data for a specific boss, use "N/A" for damage and "0" for battles.`

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
