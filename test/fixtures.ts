import { PAYLOADS, type Fields, type PayloadKind } from '../src/payloads'
import type { QrDesign } from '../src/qr/types'
import { initialDesign } from '../src/state/design'

/** Every kind filled in, so each one actually encodes. */
export const FILLED: Record<PayloadKind, Fields> = {
  url: { url: 'https://itenium.be' },
  text: { text: 'Meet me at the coffee machine at 14:00' },
  wifi: { ssid: 'Itenium Guest', security: 'WPA', password: 'tulip-mango-42', hidden: false },
  vcard: {
    first: 'Wouter', last: 'Van Schandevijl', org: 'itenium', title: 'Developer',
    tel: '+32470123456', email: 'hello@itenium.be', url: 'https://itenium.be',
  },
  email: { to: 'hello@itenium.be', subject: 'Quiet Zone', body: 'Nice QR' },
  sms: { number: '+32470123456', message: 'Ping me when you land' },
  tel: { number: '+32470123456' },
}

export const baseDesign = (over: Partial<QrDesign> = {}): QrDesign => ({
  ...initialDesign(),
  fields: Object.fromEntries(
    (Object.keys(PAYLOADS) as PayloadKind[]).map(k => [k, { ...FILLED[k] }]),
  ) as QrDesign['fields'],
  dot: 'square',
  eyeFrame: 'square',
  eyeDot: 'square',
  fg: '#15161B',
  margin: 4,
  ...over,
})

/** A stand-in mark: a solid block is the worst case for error correction. */
export const MARK_BODY = '<g fill="currentColor"><rect x="2" y="2" width="20" height="20"/></g>'
