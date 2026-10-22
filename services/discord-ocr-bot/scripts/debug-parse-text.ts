import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { createWorker } from 'tesseract.js'
import { parseParticipantsFullText } from '../../../utils/guildBattleOcrParse.ts'

const p = process.argv[2]
const buf = readFileSync(p)
const meta = await sharp(buf).metadata()
const w = meta.width ?? 875
const h = meta.height ?? 540
const tableBuf = await sharp(buf)
  .extract({ left: 0, top: Math.floor(0.12 * h), width: w, height: Math.floor(0.78 * h) })
  .grayscale()
  .normalize()
  .resize({ width: 1800 })
  .png()
  .toBuffer()

const worker = await createWorker('eng')
const { data } = await worker.recognize(tableBuf)
await worker.terminate()

console.log('--- OCR ---')
console.log(data.text)
console.log('--- PARSED ---')
const parsed = parseParticipantsFullText(data.text, ['redVelvetDragon', 'livingAbyss'])
console.log(JSON.stringify(parsed, null, 2))
