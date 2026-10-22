import { createWorker, type Worker } from 'tesseract.js'

let worker: Worker | null = null

export async function getOcrWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('eng+jpn')
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
