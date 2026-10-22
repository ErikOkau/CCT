import assert from 'node:assert/strict'
import {
  parseBossHeadersFromText,
  parseNumericTail,
  parseParticipantsFullText,
  isPlausiblePlayerName,
  parsePlayerNameFromCell,
  parseSeasonIdFromText
} from '../../../utils/guildBattleOcrParse.ts'
import { buildSeasonSheetGrid, damageToBillionCell, mergeOcrPlayers } from '../../../utils/guildBattleSheet.ts'
import { normalizeRoleName } from '../src/roleGate.ts'
import { buildCoverageReport, runSanityChecks } from '../../../utils/guildBattleImportChecks.ts'
import { mergeOcrPlayersUnique } from '../../../utils/guildBattlePlayerMerge.ts'
import { parseVisionModelJson } from '../../../utils/guildBattleVisionParse.ts'

assert.equal(parseSeasonIdFromText("Destiny's Flight 33-2"), '33-2')
assert.equal(parseSeasonIdFromText('35-1'), '35-1')

const numeric = parseNumericTail(
  'x9 245,001,284,351 x9 304,766,990,577 x18 549,768,274,928',
  2
)
assert.equal(numeric.bosses[0].battles, 9)
assert.equal(numeric.bosses[0].damage, 245_001_284_351)
assert.equal(numeric.bosses[1].battles, 9)
assert.equal(numeric.bosses[1].damage, 304_766_990_577)

assert.equal(damageToBillionCell(245_001_284_351), '245 Billion')

const name = parsePlayerNameFromCell('Lv. 73\nThe Cream Path\nThickCreamyMess')
assert.equal(name, 'ThickCreamyMess')

const headers33 = parseBossHeadersFromText('Red Velvet Dragon Living Abyss Season Total', 33)
assert.deepEqual(headers33.slice(0, 2), ['redVelvetDragon', 'livingAbyss'])

const headers35 = parseBossHeadersFromText('Machine-God Avatar of Destiny Season Total', 35)
assert.deepEqual(headers35.slice(0, 2), ['machineGod', 'avatarOfDestiny'])

const merged = mergeOcrPlayers([
  {
    playerName: 'Alpha',
    stats: { machineGod: { damage: 100, battles: 9 } }
  },
  {
    playerName: 'alpha',
    stats: { avatarOfDestiny: { damage: 200, battles: 9 } }
  }
])
assert.equal(merged.length, 1)

const grid = buildSeasonSheetGrid('35-1', [
  {
    playerName: 'TestPlayer',
    stats: {
      machineGod: { damage: 317_600_000_000, battles: 9 },
      avatarOfDestiny: { damage: 266_200_000_000, battles: 9 }
    }
  }
])
assert.ok(grid[0][22]?.includes('Machine'))
assert.ok(grid.length >= 32)

const fromText = parseParticipantsFullText(
  `x9 x9 x18 Member
ThickCreamyMess 245,001,284,351 304,766,990,577 549,768,274,928`,
  ['redVelvetDragon', 'livingAbyss']
)
assert.equal(fromText.rows[0]?.playerName, 'ThickCreamyMess')
assert.equal(fromText.rows[0]?.stats.redVelvetDragon?.damage, 245_001_284_351)

const vision = parseVisionModelJson(
  JSON.stringify({
    seasonId: '33-2',
    bossColumns: ['redVelvetDragon', 'livingAbyss'],
    players: [
      {
        playerName: 'ThickCreamyMess',
        stats: [
          { boss: 'redVelvetDragon', damage: '245,001,284,351', battles: 9 },
          { boss: 'livingAbyss', damage: 304766990577, battles: 9 }
        ]
      }
    ]
  }),
  { seasonIdHint: '33-2' }
)
assert.equal(vision.rows[0]?.playerName, 'ThickCreamyMess')
assert.equal(vision.rows[0]?.stats.redVelvetDragon?.damage, 245_001_284_351)

const kanaDup = mergeOcrPlayersUnique([
  {
    playerName: 'Xいやんx',
    stats: {
      redVelvetDragon: { damage: 201_961_625_886, battles: 9 },
      livingAbyss: { damage: 224_069_311_664, battles: 9 }
    }
  },
  {
    playerName: 'Xいゃんx',
    stats: {
      redVelvetDragon: { damage: 201_961_625_886, battles: 9 },
      livingAbyss: { damage: 224_069_311_664, battles: 9 }
    }
  }
])
assert.equal(kanaDup.length, 1)
assert.equal(kanaDup[0]?.stats.redVelvetDragon?.damage, 201_961_625_886)

const cov = buildCoverageReport(23, 5)
assert.ok(cov.headline.includes('23/30'))
const sanity = runSanityChecks(
  [
    {
      playerName: 'Test',
      stats: {
        redVelvetDragon: { damage: 100e9, battles: 7 },
        livingAbyss: { damage: 100e9, battles: 9 }
      }
    }
  ],
  ['redVelvetDragon', 'livingAbyss']
)
assert.ok(sanity.some(w => w.includes('battles')))

assert.ok(normalizeRoleName('CCT Guild Officer ⭐️').includes('cct guild officer'))
assert.ok(normalizeRoleName('Website Manager 💻').includes('website manager'))

assert.equal(isPlausiblePlayerName('hi'), true)
assert.equal(isPlausiblePlayerName('XP'), true)
assert.equal(isPlausiblePlayerName('salt'), true)

const covUi = buildCoverageReport(28, 6, 30, 29)
assert.ok(covUi.warnings.some(w => w.includes('29')))

const covExtra = buildCoverageReport(30, 6, 30, 29, 1)
assert.ok(covExtra.headline.includes('30') && covExtra.headline.includes('29'))
assert.ok(covExtra.detail.includes('no damage'))

console.log('✅ All unit checks passed')
