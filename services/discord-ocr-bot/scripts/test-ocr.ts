import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeOcrPlayers } from '../../../utils/guildBattleSheet.ts'
import { parseParticipantsImages } from '../src/parseScreenshot.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSET_DIRS = [
  join(__dirname, '../../../../assets'),
  '/Users/erikmsorheim/.cursor/projects/Users-erikmsorheim-Github-CCT/assets'
]

function findSampleImages(): string[] {
  for (const dir of ASSET_DIRS) {
    try {
      const files = readdirSync(dir)
        .filter(f => /^IMG_.*\.(jpg|jpeg|png)$/i.test(f))
        .map(f => join(dir, f))
      if (files.length > 0) return files
    } catch {
      /* try next */
    }
  }
  return []
}

const seasonId = process.argv[2] ?? '33-2'
const paths = findSampleImages()

if (paths.length === 0) {
  console.error('No sample IMG_* images found under assets/')
  process.exit(1)
}

console.log(`Running OCR on ${paths.length} image(s) as season ${seasonId}…`)

const buffers = paths.slice(0, 5).map(p => readFileSync(p))

;(async () => {
  const parsed = await parseParticipantsImages(buffers, seasonId)
  const merged = mergeOcrPlayers(parsed.rows)

  console.log('Headers:', parsed.headerBosses)
  console.log('Warnings:', parsed.warnings)
  console.log(`Players (${merged.length}):`)
  for (const p of merged) {
    const bits = Object.entries(p.stats)
      .filter(([, s]) => s && s.damage > 0)
      .map(([k, s]) => `${k}=${(s!.damage / 1e9).toFixed(1)}B x${s!.battles}`)
    console.log(`  ${p.playerName}: ${bits.join(', ')}`)
  }
})()
