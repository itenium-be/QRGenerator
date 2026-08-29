import { describe, expect, it } from 'vitest'
import { PAYLOADS } from '../src/payloads'
import { resolveSmartLink } from '../src/state/smartlink'
import { FILLED } from './fixtures'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9)'
const DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64)'

const hash = (over = {}) =>
  '#' + PAYLOADS.applink.encode({ ...FILLED.applink, ...over }).split('#')[1]

describe('smart link', () => {
  it('sends each platform to its own store', () => {
    expect(resolveSmartLink(hash(), IPHONE)).toBe('https://apps.apple.com/app/id1')
    expect(resolveSmartLink(hash(), ANDROID)).toBe('https://play.google.com/store/apps/details?id=be.itenium')
    expect(resolveSmartLink(hash(), DESKTOP)).toBe('https://itenium.be')
  })

  it('falls back to the website when the platform has no link', () => {
    expect(resolveSmartLink(hash({ ios: '' }), IPHONE)).toBe('https://itenium.be')
  })

  it('leaves an ordinary design hash alone', () => {
    expect(resolveSmartLink('#v=1&k=url&x.url=https://itenium.be', IPHONE)).toBeNull()
    expect(resolveSmartLink('', IPHONE)).toBeNull()
  })

  it('refuses a destination that is not http', () => {
    expect(resolveSmartLink('#/go?w=javascript%3Aalert(1)', DESKTOP)).toBeNull()
  })
})
