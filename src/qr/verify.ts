/** Rasterizes an SVG to PNG bytes at the given pixel width. */
export type Rasterizer = (svg: string, px: number) => Promise<Uint8Array>

/** Decodes PNG bytes, returning the payload or null when nothing scans. */
export type Decoder = (png: Uint8Array) => Promise<string | null>

/**
 * The scannability check: what a phone camera would read back, or null.
 * Rasterizer and decoder are injected so the same check runs in node and the browser.
 */
export async function verifyScannable(
  svg: string,
  rasterize: Rasterizer,
  decode: Decoder,
  px?: number,
): Promise<string | null> {
  return decode(await rasterize(svg, px ?? rasterWidth(svg)))
}

/** Enough pixels per module that antialiasing isn't what decides the verdict. */
export function rasterWidth(svg: string, perModule = 16, min = 640, max = 1600): number {
  const view = Number(svg.match(/viewBox="0 0 (\d+(?:\.\d+)?)/)?.[1] ?? 0)
  return Math.min(max, Math.max(min, Math.round(view * perModule)))
}
