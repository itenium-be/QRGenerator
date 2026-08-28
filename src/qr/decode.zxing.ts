import { readBarcodes } from 'zxing-wasm/reader'
import type { Decoder } from './verify'

export const zxingDecoder: Decoder = async png => {
  const results = await readBarcodes(new Blob([png as BlobPart], { type: 'image/png' }), {
    formats: ['QRCode'],
    tryHarder: true,
  })
  return results[0]?.text ?? null
}
