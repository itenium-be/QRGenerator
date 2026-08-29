import { PAYLOADS, type Fields, type PayloadKind } from '../src/payloads'
import type { QrDesign } from '../src/qr/types'
import { initialDesign } from '../src/state/design'

/** Every kind filled in, so each one actually encodes. */
export const FILLED: Record<PayloadKind, Fields> = {
  url: { url: 'https://itenium.be' },
  text: { text: 'Meet me at the coffee machine at 14:00' },
  wifi: {
    ssid: 'Itenium Guest', security: 'WPA', password: 'tulip-mango-42', hidden: false,
    eap: '', identity: '', anonymous: '', phase2: '',
  },
  vcard: {
    version: '3.0', first: 'Wouter', last: 'Van Schandevijl', org: 'itenium', title: 'Developer',
    tel: '+32470123456', telWork: '', email: 'hello@itenium.be', url: 'https://itenium.be',
    street: 'Bergensesteenweg 709', city: 'Anderlecht', region: '', zip: '1600', country: 'Belgium',
    bday: '1985-06-12', note: 'Bring stroopwafels',
  },
  email: { to: 'hello@itenium.be', subject: 'Quiet Zone', body: 'Nice QR' },
  sms: { number: '+32470123456', message: 'Ping me when you land' },
  tel: { number: '+32470123456' },
  event: {
    title: 'Quiet Zone launch', allday: false, start: '2026-09-01T09:00', end: '2026-09-01T10:00',
    location: 'itenium HQ', description: 'Bring stickers',
  },
  geo: { lat: '50.8503', lon: '4.3517', label: 'itenium' },
  whatsapp: { number: '+32470123456', message: 'Ping me' },
  mecard: {
    first: 'Wouter', last: 'Van Schandevijl', tel: '+32470123456',
    email: 'hello@itenium.be', url: 'https://itenium.be', address: '', note: '',
  },
  applink: {
    ios: 'https://apps.apple.com/app/id1',
    android: 'https://play.google.com/store/apps/details?id=be.itenium',
    web: 'https://itenium.be',
  },
  epc: {
    name: 'itenium BV', iban: 'BE68539007547034', amount: '12.34',
    remittance: 'Invoice 2026-004', bic: 'BBRUBEBB', purpose: '',
  },
  swiss: {
    iban: 'CH9300762011623852957', name: 'itenium AG', street: 'Bahnhofstrasse', building: '12',
    zip: '8001', city: 'Zurich', country: 'CH', amount: '50', currency: 'CHF',
    refType: 'NON', reference: '', message: 'Invoice 2026-004',
    debtorName: '', debtorStreet: '', debtorBuilding: '', debtorZip: '', debtorCity: '', debtorCountry: '',
  },
  crypto: {
    coin: 'bitcoin', address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    amount: '0.005', label: 'itenium', message: '',
  },
  otp: {
    type: 'totp', issuer: 'itenium', account: 'wouter', secret: 'JBSWY3DPEHPK3PXP',
    algorithm: 'SHA1', digits: '6', period: '30', counter: '0',
  },
  gs1: { domain: 'https://id.gs1.org', gtin: '09506000134352', lot: 'LOT42', serial: 'SER7', expiry: '271231' },
  upi: { vpa: 'itenium@okaxis', name: 'itenium', amount: '250', note: 'Invoice 404' },
  pix: { key: 'hello@itenium.be', name: 'itenium', city: 'Brussels', amount: '', txid: '' },
  promptpay: { method: 'phone', target: '0812345678', amount: '100' },
  bookmark: { title: 'itenium', url: 'https://itenium.be' },
  skype: { user: 'wouter', action: 'call' },
  facetime: { target: '+32470123456', audio: false },
  zoom: { meeting: '1234567890', pwd: 'hunter2' },
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
