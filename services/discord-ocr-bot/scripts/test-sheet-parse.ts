import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseSpreadsheetRowsToPlayers } from '../../../utils/sheetPlayerParse.ts'
import { zeroInactiveBossStats } from '../../../utils/seasonConfig.ts'

const dir = dirname(fileURLToPath(import.meta.url))
const fixture = JSON.parse(
  readFileSync(join(dir, '../../../tests/fixtures/sheet-35-3-sample.json'), 'utf8')
) as unknown[][]

const players = parseSpreadsheetRowsToPlayers(fixture)
const jam = players.find(p => p.playerName.toLowerCase().includes('jamm'))
assert.ok(jam, 'Jammifyvx merged')
const z = zeroInactiveBossStats(
  {
    rank: 1,
    playerName: jam!.playerName,
    redVelvetDragon: jam!.redVelvetDragon,
    avatarOfDestiny: jam!.avatarOfDestiny,
    livingAbyss: jam!.livingAbyss,
    machineGod: jam!.machineGod
  },
  35,
  3
)
assert.ok(z.livingAbyss.damage > 0, 'LA damage')
assert.ok(z.machineGod.damage > 0, 'MG damage')
console.log('✅ Sheet fixture parse OK')
