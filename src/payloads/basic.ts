import type { PayloadSpec } from './types'
import { digits, escMebkm, query, str } from './util'

/** Smart links resolve on the deployed generator, so the host is fixed, not the current origin. */
export const SMART_LINK_BASE = 'https://itenium-be.github.io/QRGenerator/'

const url: PayloadSpec = {
  label: 'Link',
  group: 'common',
  defaults: { url: 'https://itenium.be' },
  problem: f => (str(f, 'url').trim().length > 2 ? null : 'Enter a web address.'),
  encode: f => {
    const v = str(f, 'url').trim()
    return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`
  },
}

const text: PayloadSpec = {
  label: 'Text',
  group: 'common',
  defaults: { text: '' },
  problem: f => (str(f, 'text').length > 0 ? null : 'Type something to encode.'),
  encode: f => str(f, 'text'),
}

const email: PayloadSpec = {
  label: 'Email',
  group: 'common',
  defaults: { to: '', subject: '', body: '' },
  problem: f => (/.+@.+\..+/.test(str(f, 'to')) ? null : 'Enter a valid address.'),
  encode: f =>
    `mailto:${str(f, 'to')}` +
    query([
      ['subject', encodeURIComponent(str(f, 'subject'))],
      ['body', encodeURIComponent(str(f, 'body'))],
    ]),
}

const sms: PayloadSpec = {
  label: 'SMS',
  group: 'common',
  defaults: { number: '', message: '' },
  problem: f => (digits(str(f, 'number')).length >= 6 ? null : 'Enter a phone number.'),
  /** SMSTO: is the form both Android and iOS accept. */
  encode: f => `SMSTO:${str(f, 'number')}:${str(f, 'message')}`,
}

const tel: PayloadSpec = {
  label: 'Phone',
  group: 'common',
  defaults: { number: '' },
  problem: f => (digits(str(f, 'number')).length >= 6 ? null : 'Enter a phone number.'),
  encode: f => `tel:${str(f, 'number')}`,
}

const geo: PayloadSpec = {
  label: 'Location',
  group: 'common',
  defaults: { lat: '', lon: '', label: '' },
  problem: f => {
    const lat = Number(str(f, 'lat'))
    const lon = Number(str(f, 'lon'))
    if (!str(f, 'lat').trim() || !Number.isFinite(lat) || Math.abs(lat) > 90)
      return 'Latitude must be a number between -90 and 90.'
    if (!str(f, 'lon').trim() || !Number.isFinite(lon) || Math.abs(lon) > 180)
      return 'Longitude must be a number between -180 and 180.'
    return null
  },
  encode: f => {
    const at = `${str(f, 'lat')},${str(f, 'lon')}`
    const label = str(f, 'label').trim()
    return label ? `geo:${at}?q=${at}(${label})` : `geo:${at}`
  },
}

const whatsapp: PayloadSpec = {
  label: 'WhatsApp',
  group: 'common',
  defaults: { number: '', message: '' },
  problem: f => (digits(str(f, 'number')).length >= 8 ? null : 'Enter the number in full, including the country code.'),
  encode: f =>
    `https://wa.me/${digits(str(f, 'number'))}` +
    query([['text', encodeURIComponent(str(f, 'message'))]]),
}

const applink: PayloadSpec = {
  label: 'App link',
  group: 'other',
  hint: 'Resolved by this generator, so a printed code keeps working only while this site is up.',
  defaults: { ios: '', android: '', web: '' },
  problem: f => (str(f, 'web').trim() ? null : 'Enter a fallback web address for desktops.'),
  encode: f => {
    const p = new URLSearchParams()
    p.set('w', str(f, 'web').trim())
    if (str(f, 'ios').trim()) p.set('i', str(f, 'ios').trim())
    if (str(f, 'android').trim()) p.set('a', str(f, 'android').trim())
    return `${SMART_LINK_BASE}#/go?${p}`
  },
}

const bookmark: PayloadSpec = {
  label: 'Bookmark',
  group: 'other',
  defaults: { title: '', url: '' },
  problem: f => (str(f, 'url').trim() ? null : 'Enter the address to bookmark.'),
  encode: f => `MEBKM:TITLE:${escMebkm(str(f, 'title'))};URL:${escMebkm(str(f, 'url').trim())};;`,
}

const skype: PayloadSpec = {
  label: 'Skype',
  group: 'other',
  defaults: { user: '', action: 'call' },
  problem: f => (str(f, 'user').trim() ? null : 'Enter a Skype name.'),
  encode: f => `skype:${str(f, 'user').trim()}?${str(f, 'action')}`,
}

const facetime: PayloadSpec = {
  label: 'FaceTime',
  group: 'other',
  defaults: { target: '', audio: false },
  problem: f => (str(f, 'target').trim() ? null : 'Enter a phone number or Apple ID.'),
  encode: f => `${f.audio ? 'facetime-audio' : 'facetime'}:${str(f, 'target').trim()}`,
}

const zoom: PayloadSpec = {
  label: 'Zoom',
  group: 'other',
  defaults: { meeting: '', pwd: '' },
  problem: f => (digits(str(f, 'meeting')).length >= 9 ? null : 'Enter the meeting ID.'),
  encode: f =>
    `https://zoom.us/j/${digits(str(f, 'meeting'))}` +
    query([['pwd', encodeURIComponent(str(f, 'pwd'))]]),
}

export const BASIC = { url, text, email, sms, tel, geo, whatsapp, applink, bookmark, skype, facetime, zoom }
