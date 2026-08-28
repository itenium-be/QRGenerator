import type { Format } from './types'

const MIME: Record<Format, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
}

export async function toBlob(svg: string, format: Format, px: number): Promise<Blob> {
  if (format === 'svg') return new Blob([svg], { type: MIME.svg })

  const url = URL.createObjectURL(new Blob([svg], { type: MIME.svg }))
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('svg failed to load'))
      i.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = px
    canvas.height = px
    const ctx = canvas.getContext('2d')!
    /* jpg has no alpha, so a transparent background would come out black. */
    if (format === 'jpg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, px, px)
    }
    ctx.drawImage(img, 0, 0, px, px)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('export failed'))), MIME[format], 0.95),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function download(blob: Blob, fileName: string, format: Format) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName || 'qr'}.${format}`
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyImage(svg: string, px: number): Promise<boolean> {
  try {
    const blob = await toBlob(svg, 'png', px)
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    return false
  }
}
