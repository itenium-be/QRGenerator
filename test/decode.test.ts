import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { initialDesign } from '../src/state/design'
import { PAYLOADS, PAYLOAD_KINDS } from '../src/payloads'
import { fitMarkSize } from '../src/qr/fit'
import { encodePayload, renderSvg } from '../src/qr/render'
import type { DotStyle, Ecc, EyeDot, EyeFrame, QrDesign } from '../src/qr/types'
import { verifyScannable } from '../src/qr/verify'
import { zxingDecoder } from '../src/qr/decode.zxing'
import { resvgRasterizer } from './raster.node'
import { MARK_BODY, baseDesign } from './fixtures'

const ICON_MARK = { type: 'icon', set: 'g', slug: 'block' } as const

const scan = (over: Partial<QrDesign> = {}, markBody?: string) => {
  const design = baseDesign(over)
  return verifyScannable(
    renderSvg(design, { markBody }),
    resvgRasterizer,
    zxingDecoder,
  ).then(text => ({ text, expected: encodePayload(design) }))
}

const scansBack = async (over?: Partial<QrDesign>, markBody?: string) => {
  const { text, expected } = await scan(over, markBody)
  return text === expected
}

describe('every payload kind round-trips through a decoder', () => {
  it.each(PAYLOAD_KINDS)('%s', async kind => {
    const { text, expected } = await scan({ kind })
    expect(PAYLOADS[kind].problem(baseDesign({ kind }).fields[kind])).toBeNull()
    expect(text).toBe(expected)
  })

  it('keeps non-latin text byte-exact', async () => {
    const text = 'Café ☕ — 日本語 — ÅÄÖ'
    const design = baseDesign({ kind: 'text' })
    design.fields.text = { text }
    const decoded = await verifyScannable(renderSvg(design), resvgRasterizer, zxingDecoder)
    expect(decoded).toBe(text)
  })
})

describe('styling never breaks the code', () => {
  const dots: DotStyle[] = ['square', 'rounded', 'extra-rounded', 'dots', 'classy', 'fluid']
  const frames: EyeFrame[] = ['square', 'rounded', 'extra-rounded', 'dot']
  const eyeDots: EyeDot[] = ['square', 'rounded', 'dot']

  it.each(dots)('module style %s', async dot => {
    expect(await scansBack({ dot })).toBe(true)
  })

  it.each(frames)('eye frame %s', async eyeFrame => {
    expect(await scansBack({ eyeFrame })).toBe(true)
  })

  it.each(eyeDots)('eye centre %s', async eyeDot => {
    expect(await scansBack({ eyeDot })).toBe(true)
  })

  it.each(['L', 'M', 'Q', 'H'] as Ecc[])('error correction %s', async ecc => {
    expect(await scansBack({ ecc })).toBe(true)
  })

  it.each([0, 1, 2, 4, 8])('quiet zone %i', async margin => {
    expect(await scansBack({ margin })).toBe(true)
  })

  it('survives a gradient and custom eye colour', async () => {
    expect(await scansBack({ fg: '#2B4BF2', fg2: '#8B2BF2', eye: '#8A1B2B', bg: '#FFFFFF' })).toBe(true)
  })

  it('survives every module style at once with a mark', async () => {
    for (const dot of dots)
      expect(await scansBack({ dot, mark: ICON_MARK, markSize: 0.2, ecc: 'H' }, MARK_BODY)).toBe(true)
  })
})

describe('centre mark', () => {
  it('decodes at the default size on a short payload', async () => {
    expect(await scansBack({ mark: ICON_MARK, markSize: 0.2, ecc: 'H' }, MARK_BODY)).toBe(true)
  })

  it('takes a larger mark on a denser payload', async () => {
    expect(await scansBack({ kind: 'vcard', mark: ICON_MARK, markSize: 0.3, ecc: 'H' }, MARK_BODY)).toBe(true)
  })

  it('fits itself to the largest size that still decodes', async () => {
    const design = baseDesign({ mark: ICON_MARK, ecc: 'H' })
    const fitted = await fitMarkSize(design, { markBody: MARK_BODY }, resvgRasterizer, zxingDecoder)
    expect(fitted).not.toBeNull()
    expect(await scansBack({ ...design, markSize: fitted! }, MARK_BODY)).toBe(true)
    expect(await scansBack({ ...design, markSize: fitted! + 0.06 }, MARK_BODY)).toBe(false)
  })

  it('leaves an uploaded image out of the modules it covers', async () => {
    const dataUrl =
      'data:image/svg+xml;base64,' +
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="#8A1B2B"/></svg>').toString('base64')
    expect(
      await scansBack({ mark: { type: 'upload', name: 'x.svg', dataUrl, tintable: false }, markSize: 0.2, ecc: 'H' }),
    ).toBe(true)
  })
})

describe("the app's own defaults", () => {
  it('ships the itenium mark and decodes with it', async () => {
    const shard = JSON.parse(await readFile('public/icons/b-i.json', 'utf8'))
    const index: { s: string; h?: string }[] = JSON.parse(await readFile('public/icons/index.json', 'utf8'))
    const body = shard.itenium
    expect(body).toBeTruthy()
    expect(index.find(e => e.s === 'itenium')?.h).toBe('#E78200')

    const design = baseDesign({ ...initialDesign(), fields: baseDesign().fields })
    const svg = renderSvg(design, { markBody: body, brandHex: '#E78200' })
    expect(svg).toContain('#E78200')
    expect(await verifyScannable(svg, resvgRasterizer, zxingDecoder)).toBe(encodePayload(design))
  })
})

describe('gradients', () => {
  it('gives each colour pair its own gradient id, so codes on one page do not steal each others', () => {
    const a = renderSvg(baseDesign({ fg: '#2B4BF2', fg2: '#8B2BF2' }))
    const b = renderSvg(baseDesign({ fg: '#1B6B4A', fg2: '#E78200' }))
    const idOf = (svg: string) => svg.match(/<linearGradient id="([^"]+)"/)?.[1]
    expect(idOf(a)).toBeTruthy()
    expect(idOf(a)).not.toBe(idOf(b))
    expect(a).toContain(`url(#${idOf(a)})`)
    expect(b).toContain(`url(#${idOf(b)})`)
  })
})
