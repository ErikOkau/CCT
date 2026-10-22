import '../src/loadEnv.ts'
import { parseGoogleSheetsCredentials } from '../src/googleCredentials.ts'

const token = !!process.env.DISCORD_BOT_TOKEN?.trim()
const chatgpt = !!process.env.CHATGPT_API?.trim()
const ocrProvider = chatgpt && process.env.OCR_PROVIDER?.toLowerCase() !== 'tesseract'
  ? 'openai (CHATGPT_API set)'
  : process.env.OCR_PROVIDER?.trim() || 'tesseract'
const prefix = process.env.DISCORD_COMMAND_PREFIX ?? '?'
const raw = process.env.GOOGLE_SHEETS_CREDENTIALS?.trim() ?? ''

console.log('DISCORD_BOT_TOKEN:', token ? 'set' : 'MISSING')
console.log('CHATGPT_API:', chatgpt ? 'set' : 'MISSING')
console.log('OCR provider:', ocrProvider)
console.log('DISCORD_COMMAND_PREFIX:', JSON.stringify(prefix))
console.log(
  'GOOGLE_SHEETS_CREDENTIALS:',
  raw.endsWith('.json') ? `file path (${raw})` : raw.startsWith('{') ? `inline JSON (${raw.length} chars)` : raw ? `other (${raw.length} chars)` : 'MISSING'
)

try {
  parseGoogleSheetsCredentials()
  console.log('✅ Credentials parse OK — npm start should be able to write sheets')
} catch (e: any) {
  console.error('❌ Credentials parse failed')
  console.error(e.message)
  process.exit(1)
}
