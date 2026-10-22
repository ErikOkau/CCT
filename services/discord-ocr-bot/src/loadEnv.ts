import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const botRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(botRoot, '../..')

// Repo root `.env` (local dev) then bot-local `.env` overrides (worker/Railway copy).
dotenv.config({ path: resolve(repoRoot, '.env') })
dotenv.config({ path: resolve(botRoot, '.env') })
