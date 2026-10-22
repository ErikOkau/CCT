import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const botRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(botRoot, '../..')

const SETUP_HINT = `Fix .env using ONE of these:

1) Path to key file (recommended):
   GOOGLE_SHEETS_CREDENTIALS=chaos-control-team-2d67cc3c1469.json
   (file in repo root; same JSON you use on Vercel)

2) Or:
   GOOGLE_SHEETS_CREDENTIALS_FILE=chaos-control-team-2d67cc3c1469.json

3) Inline JSON must be ONE line. Do NOT use:
   GOOGLE_SHEETS_CREDENTIALS="{\\n  "type": ..."
   Inner " quotes break dotenv. Use a .json file instead, or minified single-line JSON.`

function escapeControlCharsInJsonStrings(text: string): string {
  let out = ''
  let inString = false
  let escaped = false
  for (const ch of text) {
    if (escaped) {
      out += ch
      escaped = false
      continue
    }
    if (ch === '\\') {
      out += ch
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      out += ch
      continue
    }
    if (inString && ch === '\n') {
      out += '\\n'
      continue
    }
    if (inString && ch === '\r') continue
    if (inString && ch === '\t') {
      out += '\\t'
      continue
    }
    out += ch
  }
  return out
}

function tryParseJson(text: string): Record<string, unknown> {
  const parsed = JSON.parse(text) as Record<string, unknown>
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('JSON is missing client_email or private_key')
  }
  return parsed
}

function parseJsonText(text: string): Record<string, unknown> {
  const attempts = [
    text,
    escapeControlCharsInJsonStrings(text),
    // dotenv "\\n" sequences → real newlines, then re-escape for JSON.parse
    escapeControlCharsInJsonStrings(text.replace(/\\n/g, '\n').replace(/\\r/g, '\r'))
  ]

  for (const candidate of attempts) {
    try {
      return tryParseJson(candidate)
    } catch {
      /* next */
    }
  }

  try {
    return tryParseJson(Buffer.from(text, 'base64').toString('utf8'))
  } catch {
    /* fall through */
  }

  throw new Error('invalid JSON')
}

function readCredentialsFile(filePath: string): Record<string, unknown> {
  const content = readFileSync(filePath, 'utf8')
  return parseJsonText(content)
}

function resolveCredentialPath(value: string): string | null {
  const trimmed = value.replace(/^["']|["']$/g, '').trim()
  const candidates = [
    trimmed,
    resolve(process.cwd(), trimmed),
    resolve(repoRoot, trimmed),
    resolve(botRoot, trimmed)
  ]

  for (const p of candidates) {
    if (p.endsWith('.json') && existsSync(p)) return p
  }
  return null
}

export function parseGoogleSheetsCredentials(): Record<string, unknown> {
  const fileEnv = process.env.GOOGLE_SHEETS_CREDENTIALS_FILE?.trim()
  if (fileEnv) {
    const path = resolveCredentialPath(fileEnv)
    if (path) return readCredentialsFile(path)
    throw new Error(`GOOGLE_SHEETS_CREDENTIALS_FILE not found: ${fileEnv}\n\n${SETUP_HINT}`)
  }

  const raw = process.env.GOOGLE_SHEETS_CREDENTIALS?.trim()
  if (!raw) {
    throw new Error(`GOOGLE_SHEETS_CREDENTIALS is not set.\n\n${SETUP_HINT}`)
  }

  const path = resolveCredentialPath(raw)
  if (path) return readCredentialsFile(path)

  const jsonText = raw.replace(/^["']|["']$/g, '').trim()

  if (jsonText.startsWith('{') && !jsonText.includes('client_email')) {
    throw new Error(
      `GOOGLE_SHEETS_CREDENTIALS looks truncated (${jsonText.length} chars). ` +
        `Dotenv stopped at the first unescaped " inside your value.\n\n${SETUP_HINT}`
    )
  }

  try {
    return parseJsonText(jsonText)
  } catch {
    throw new Error(`Could not parse GOOGLE_SHEETS_CREDENTIALS.\n\n${SETUP_HINT}`)
  }
}
