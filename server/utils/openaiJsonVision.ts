export async function callOpenAiVisionJson(
  apiKey: string,
  model: string,
  prompt: string,
  imageDataUrl: string,
  maxTokens = 2048
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenAI vision failed (${response.status}): ${errText.slice(0, 300)}`)
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}
