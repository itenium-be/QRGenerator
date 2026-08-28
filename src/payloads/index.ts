import type { Fields, PayloadKind, PayloadSpec } from './types'

const str = (f: Fields, k: string) => String(f[k] ?? '')

/** WIFI: and vCard both use backslash escaping, over different character sets. */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1')
const escVcard = (s: string) => s.replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n')

const digits = (s: string) => s.replace(/\D/g, '')

export const PAYLOADS: Record<PayloadKind, PayloadSpec> = {
  url: {
    label: 'Link',
    defaults: { url: 'https://itenium.be' },
    problem: f => (str(f, 'url').trim().length > 2 ? null : 'Enter a web address.'),
    encode: f => {
      const v = str(f, 'url').trim()
      return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`
    },
  },

  text: {
    label: 'Text',
    defaults: { text: '' },
    problem: f => (str(f, 'text').length > 0 ? null : 'Type something to encode.'),
    encode: f => str(f, 'text'),
  },

  wifi: {
    label: 'Wi-Fi',
    defaults: { ssid: '', security: 'WPA', password: '', hidden: false },
    problem: f => {
      if (!str(f, 'ssid').trim()) return 'Enter the network name.'
      if (str(f, 'security') !== 'nopass' && !str(f, 'password')) return 'Enter the password, or set security to none.'
      return null
    },
    encode: f => {
      const open = str(f, 'security') === 'nopass'
      return (
        'WIFI:' +
        `T:${str(f, 'security')};` +
        `S:${escWifi(str(f, 'ssid'))};` +
        (open ? '' : `P:${escWifi(str(f, 'password'))};`) +
        (f.hidden ? 'H:true;' : '') +
        ';'
      )
    },
  },

  vcard: {
    label: 'Contact',
    defaults: { first: '', last: '', org: '', title: '', tel: '', email: '', url: '' },
    problem: f => ((str(f, 'first') + str(f, 'last')).trim() ? null : 'Enter at least a name.'),
    encode: f => {
      const full = `${str(f, 'first')} ${str(f, 'last')}`.trim()
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escVcard(str(f, 'last'))};${escVcard(str(f, 'first'))};;;`,
        `FN:${escVcard(full)}`,
        str(f, 'org') && `ORG:${escVcard(str(f, 'org'))}`,
        str(f, 'title') && `TITLE:${escVcard(str(f, 'title'))}`,
        str(f, 'tel') && `TEL;TYPE=CELL:${str(f, 'tel')}`,
        str(f, 'email') && `EMAIL:${str(f, 'email')}`,
        str(f, 'url') && `URL:${str(f, 'url')}`,
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\r\n')
    },
  },

  email: {
    label: 'Email',
    defaults: { to: '', subject: '', body: '' },
    problem: f => (/.+@.+\..+/.test(str(f, 'to')) ? null : 'Enter a valid address.'),
    encode: f => {
      const q = [
        str(f, 'subject') && `subject=${encodeURIComponent(str(f, 'subject'))}`,
        str(f, 'body') && `body=${encodeURIComponent(str(f, 'body'))}`,
      ]
        .filter(Boolean)
        .join('&')
      return `mailto:${str(f, 'to')}${q ? `?${q}` : ''}`
    },
  },

  sms: {
    label: 'SMS',
    defaults: { number: '', message: '' },
    problem: f => (digits(str(f, 'number')).length >= 6 ? null : 'Enter a phone number.'),
    /** SMSTO: is the form both Android and iOS accept. */
    encode: f => `SMSTO:${str(f, 'number')}:${str(f, 'message')}`,
  },

  tel: {
    label: 'Phone',
    defaults: { number: '' },
    problem: f => (digits(str(f, 'number')).length >= 6 ? null : 'Enter a phone number.'),
    encode: f => `tel:${str(f, 'number')}`,
  },
}

export const PAYLOAD_KINDS = Object.keys(PAYLOADS) as PayloadKind[]
export type { Fields, PayloadKind, PayloadSpec } from './types'
