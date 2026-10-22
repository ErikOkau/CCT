import { createWorker, type Worker } from 'tesseract.js'

let worker: Worker | null = null

export async function getOcrWorker(): Promise<Worker> {
  if (!worker) {
    const lang = process.env.OCR_LANGUAGES?.trim() || 'eng'
    worker = await createWorker(lang)
  }
  return worker
}

export async function ocrBuffer(buffer: Buffer): Promise<string> {
  const w = await getOcrWorker()
  const { data } = await w.recognize(buffer)
  return data.text
}

export async function terminateOcrWorker(): Promise<void> {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
