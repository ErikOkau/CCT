/**
 * OCR participants images → grid preview / optional sheet write (no Discord).
 * Usage: npx tsx scripts/backfill-season.ts 35-3 ./screenshots/*.png [--dry-run]
 */
import '../src/loadEnv.ts'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseParticipantsImages } from '../src/parseScreenshot.ts'
import { mergeOcrPlayers, buildSeasonSheetGrid } from '../../../utils/guildBattleSheet.ts'
import { createSeasonTabFromOcr } from '../src/sheetsClient.ts'

const seasonId = process.argv[2]
const dryRun = process.argv.includes('--dry-run')
const paths = process.argv.slice(3).filter(a => !a.startsWith('--'))

async function main() {
  if (!seasonId || !/^\d+-\d+$/.test(seasonId)) {
    console.error('Usage: backfill-season.ts <season-id> <image paths...> [--dry-run]')
    process.exit(1)
  }

  let files = paths.map(p => resolve(p))
  if (files.length === 1) {
    try {
      files = readdirSync(files[0]!)
        .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
        .map(f => resolve(files[0]!, f))
    } catch {
      /* single file */
    }
  }

  if (files.length === 0) {
    console.error('No images found')
    process.exit(1)
  }

  const buffers = files.map(f => readFileSync(f))
  const parsed = await parseParticipantsImages(buffers, seasonId)
  const merged = mergeOcrPlayers(parsed.rows)
  console.log(`Parsed ${merged.length} players from ${files.length} image(s)`)
  parsed.warnings.forEach(w => console.warn('⚠️', w))

  if (dryRun) {
    const grid = buildSeasonSheetGrid(seasonId, merged)
    console.log('Dry-run grid rows:', grid.length)
    return
  }

  const result = await createSeasonTabFromOcr(seasonId, merged, { overwrite: true })
  console.log('✅', result)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
