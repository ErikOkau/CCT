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
    const prompt = `Please analyze this screenshot of a game leaderboard and extract the data in CSV format. The screenshot shows player performance data with columns for Player, Red Velvet Dragon, Avatar of Destiny, and Living Abyss. Each row should include:

1. Player name (EXTRACT ONLY REAL PLAYER NAMES FROM THE SCREENSHOT - DO NOT GENERATE FAKE NAMES)
2. Red Velvet Dragon damage (in billions) and battles count
3. Avatar of Destiny damage (in billions) and battles count  
4. Living Abyss damage (in billions) and battles count
5. Player rank (Member/Officer/Leader)

Please format the output as a properly formatted CSV with the following structure:
Rank,Player Name,Red Velvet Dragon Damage,Red Velvet Dragon Unit,Red Velvet Dragon Battles,Avatar of Destiny Damage,Avatar of Destiny Unit,Avatar of Destiny Battles,Living Abyss Damage,Living Abyss Unit,Living Abyss Battles,Guild Rank

CRITICAL INSTRUCTIONS: 
- Extract ONLY real player names that are visible in the screenshot
- DO NOT generate fake player names like "Player Name", "PlayerName", or placeholder names
- If you cannot read a player name clearly, use "Unknown Player" instead of making up names
- Use commas as delimiters
- Do NOT include quotes around the header row
- Do NOT include quotes around data values unless they contain commas
- Ensure each row has exactly 12 columns
- If a player has no damage for a specific boss, use "0" for damage and "0" for battles
- If a player has no battles for a specific boss, use "0" for battles
- Make sure the CSV is properly formatted for import into Google Sheets or Excel
- Add "Billions" in the unit columns (columns 4, 7, and 10) to indicate the unit of measurement
- IGNORE ANY "Season Total" COLUMN - do NOT use Season Total data for any boss
- ONLY extract data from the three specific boss columns: Red Velvet Dragon, Avatar of Destiny, and Living Abyss
- If there is a "Season Total" column in the screenshot, completely ignore it and do not include its data
- The third boss column should be "Living Abyss" - if a player has no Living Abyss data, use "0" for both damage and battles
- SORT PLAYERS BY DAMAGE: For each boss column, sort players from highest damage to lowest damage
- Update the rank numbers (column 1) to reflect the sorted order for each boss
- Players with 0 damage should be ranked last
- INCLUDE ALL PLAYERS: Make sure to include ALL players visible in the screenshot, even if they have 0 damage for all bosses
- COUNT VERIFICATION: Count the total number of players in the screenshot and ensure your CSV has exactly that many rows
- ZERO DAMAGE PLAYERS: If a player shows "N/A" or "0" damage for all bosses, still include them with "0" damage and "0" battles

Example format:
Rank,Player Name,Red Velvet Dragon Damage,Red Velvet Dragon Unit,Red Velvet Dragon Battles,Avatar of Destiny Damage,Avatar of Destiny Unit,Avatar of Destiny Battles,Living Abyss Damage,Living Abyss Unit,Living Abyss Battles,Guild Rank
1,RealPlayerName,123.4,Billions,5,67.8,Billions,3,45.6,Billions,2,Member`

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
