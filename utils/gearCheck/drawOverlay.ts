import { statusColor } from './compare'
import type { ComparisonRow } from './types'

export function drawGearOverlay(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  comparisons: ComparisonRow[]
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  const w = canvas.width
  const h = canvas.height

  for (const row of comparisons) {
    if (!row.box) continue
    const x = row.box.x * w
    const y = row.box.y * h
    const bw = Math.max(row.box.w * w, 40)
    const bh = Math.max(row.box.h * h, 18)
    const color = statusColor(row.status)

    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = `${color}33`
    ctx.lineWidth = Math.max(2, w / 400)
    roundRect(ctx, x, y, bw, bh, 4)
    ctx.fill()
    ctx.stroke()

    ctx.font = `${Math.max(11, w / 55)}px system-ui, sans-serif`
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    const tag = `${row.label}: ${row.scannedLabel} → ${row.targetLabel}`
    ctx.strokeText(tag, x, y - 4)
    ctx.fillText(tag, x, y - 4)
    ctx.restore()
  }

  drawLegend(ctx, comparisons, w, h)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawLegend(ctx: CanvasRenderingContext2D, comparisons: ComparisonRow[], w: number, h: number) {
  const pad = 12
  const lineH = Math.max(16, h / 40)
  const boxW = Math.min(280, w * 0.35)
  const boxH = pad * 2 + comparisons.length * lineH + 20
  const x = w - boxW - pad
  const y = pad

  ctx.save()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'
  roundRect(ctx, x, y, boxW, boxH, 8)
  ctx.fill()

  ctx.fillStyle = '#f8fafc'
  ctx.font = `bold ${Math.max(12, w / 60)}px system-ui`
  ctx.fillText('CCT targets', x + pad, y + pad + 14)

  ctx.font = `${Math.max(11, w / 65)}px system-ui`
  comparisons.forEach((row, i) => {
    const ly = y + pad + 28 + i * lineH
    ctx.fillStyle = statusColor(row.status)
    ctx.fillRect(x + pad, ly - 10, 8, 8)
    ctx.fillStyle = '#e2e8f0'
    const text = `${row.label} ${row.scannedLabel} / ${row.targetLabel}`
    ctx.fillText(text.length > 34 ? `${text.slice(0, 31)}…` : text, x + pad + 14, ly)
  })
  ctx.restore()
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
