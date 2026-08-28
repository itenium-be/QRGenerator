import { describe, expect, it } from 'vitest'
import { fromHash, toHash } from '../src/state/hash'
import { baseDesign } from './fixtures'

describe('share links', () => {
  it('round-trips a styled design', () => {
    const design = baseDesign({
      kind: 'wifi', dot: 'dots', eyeFrame: 'dot', eyeDot: 'rounded',
      fg: '#2B4BF2', fg2: '#8B2BF2', bg: '#F2F7F3', eye: '#8A1B2B',
      mark: { type: 'icon', set: 'b', slug: 'github' }, markColor: 'brand',
      markSize: 0.18, margin: 3, ecc: 'Q', format: 'png', pixelSize: 2048, fileName: 'guest-wifi',
    })
    const back = fromHash('#' + toHash(design))
    expect(back).not.toBeNull()
    expect({ ...back!, fields: back!.fields.wifi }).toMatchObject({
      kind: 'wifi', dot: 'dots', fg2: '#8B2BF2', eye: '#8A1B2B', markColor: 'brand',
      mark: { type: 'icon', set: 'b', slug: 'github' }, ecc: 'Q', pixelSize: 2048, fileName: 'guest-wifi',
      fields: { ssid: 'Itenium Guest', security: 'WPA', password: 'tulip-mango-42' },
    })
  })

  it('keeps a cleared gradient cleared', () => {
    const back = fromHash('#' + toHash(baseDesign({ fg2: null, eye: null })))
    expect(back?.fg2).toBeNull()
    expect(back?.eye).toBeNull()
  })

  it('ignores a link from a future version instead of half-reading it', () => {
    expect(fromHash('#v=99&k=url')).toBeNull()
  })

  it('ignores keys it does not know', () => {
    const back = fromHash('#' + toHash(baseDesign()) + '&zz=1')
    expect(back?.kind).toBe('url')
  })
})
