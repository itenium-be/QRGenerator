import { describe, expect, it } from 'vitest'
import { encodePayload, renderSvg } from '../src/qr/render'
import { fromHash, toHash } from '../src/state/hash'
import { PRESETS, reduce } from '../src/state/design'
import { verifyScannable } from '../src/qr/verify'
import { zxingDecoder } from '../src/qr/decode.zxing'
import { resvgRasterizer } from './raster.node'
import { baseDesign } from './fixtures'

const bgRect = (svg: string) => svg.match(/<rect width="\d+" height="\d+" fill="([^"]+)"/)?.[1]

describe('transparent background', () => {
  it('paints the background when it is opaque', () => {
    expect(bgRect(renderSvg(baseDesign({ bg: '#F2F7F3' })))).toBe('#F2F7F3')
  })

  it('leaves the background out entirely, so the SVG carries real alpha', () => {
    expect(bgRect(renderSvg(baseDesign({ bg: '#F2F7F3', transparent: true })))).toBeUndefined()
  })

  it('still decodes once something light is behind it', async () => {
    const design = baseDesign({ transparent: true })
    const decoded = await verifyScannable(renderSvg(design), resvgRasterizer, zxingDecoder)
    expect(decoded).toBe(encodePayload(design))
  })

  it('round-trips through a share link', () => {
    expect(fromHash('#' + toHash(baseDesign({ transparent: true })))?.transparent).toBe(true)
    expect(fromHash('#' + toHash(baseDesign({ transparent: false })))?.transparent).toBe(false)
  })
})

describe('presets', () => {
  it('turn the background back on, since each one names a colour', () => {
    const back = reduce(baseDesign({ transparent: true }), { type: 'preset', index: 2 })
    expect(back.transparent).toBe(false)
    expect(back.bg).toBe(PRESETS[2].bg)
  })
})
