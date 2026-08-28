import { renderSvg, type RenderExtras } from './render'
import type { QrDesign } from './types'
import { verifyScannable, type Decoder, type Rasterizer } from './verify'

/**
 * Largest mark size that still decodes, to 0.01. Returns null when even the
 * smallest mark breaks the code — which means the payload needs less data or
 * more error correction, not a smaller icon.
 */
export async function fitMarkSize(
  design: QrDesign,
  extras: RenderExtras,
  rasterize: Rasterizer,
  decode: Decoder,
  { min = 0.1, max = 0.45 } = {},
): Promise<number | null> {
  const scans = async (markSize: number) =>
    (await verifyScannable(renderSvg({ ...design, markSize }, extras), rasterize, decode)) !== null

  if (!(await scans(min))) return null

  let lo = min
  let hi = max
  while (hi - lo > 0.01) {
    const mid = (lo + hi) / 2
    if (await scans(mid)) lo = mid
    else hi = mid
  }

  /* Decoding near the boundary is not monotonic, so the rounded answer is
     re-checked rather than assumed. */
  for (let size = Math.floor(lo * 100) / 100; size >= min; size = Math.round((size - 0.01) * 100) / 100)
    if (await scans(size)) return size
  return null
}
