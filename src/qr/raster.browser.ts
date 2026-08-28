import type { Rasterizer } from './verify'

/** Rasterizes through an <img> and a canvas — no dependency beyond the DOM. */
export const canvasRasterizer: Rasterizer = (svg, px) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = px
      canvas.height = px
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('no 2d context'))
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, px, px)
      ctx.drawImage(img, 0, 0, px, px)
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('canvas produced no blob'))
        blob.arrayBuffer().then(b => resolve(new Uint8Array(b)), reject)
      }, 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('svg failed to load'))
    }
    img.src = url
  })
