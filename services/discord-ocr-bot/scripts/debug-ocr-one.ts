import { readFileSync } from 'node:fs'
import { createWorker } from 'tesseract.js'
import sharp from 'sharp'

const p = process.argv[2]
if (!p) {
  console.error('Usage: tsx scripts/debug-ocr-one.ts <image>')
  process.exit(1)
}

const buf = readFileSync(p)
const meta = await sharp(buf).metadata()
console.log('size', meta.width, meta.height)

const worker = await createWorker('eng')
const { data } = await worker.recognize(buf)
console.log('--- full ---')
console.log(data.text)
await worker.terminate()
