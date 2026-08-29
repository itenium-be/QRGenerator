import type { PayloadSpec } from './types'
import { base32Valid, digits, gtinValid, query, str } from './util'

const otp: PayloadSpec = {
  label: 'One-time password',
  group: 'other',
  hint: 'The secret is encoded in the image itself — anyone who can see the code can enrol.',
  defaults: {
    type: 'totp', issuer: '', account: '', secret: '',
    algorithm: 'SHA1', digits: '6', period: '30', counter: '0',
  },
  problem: f => {
    if (!str(f, 'account').trim()) return 'Enter the account the code belongs to.'
    if (!str(f, 'secret').trim()) return 'Enter the shared secret.'
    if (!base32Valid(str(f, 'secret'))) return 'The secret must be base32 — A to Z and 2 to 7.'
    return null
  },
  encode: f => {
    const issuer = str(f, 'issuer').trim()
    const account = str(f, 'account').trim()
    const label = [issuer, account].filter(Boolean).map(encodeURIComponent).join(':')
    return (
      `otpauth://${str(f, 'type')}/${label}` +
      query([
        ['secret', str(f, 'secret').replace(/\s/g, '').toUpperCase()],
        ['issuer', encodeURIComponent(issuer)],
        ['algorithm', str(f, 'algorithm') === 'SHA1' ? '' : str(f, 'algorithm')],
        ['digits', str(f, 'digits') === '6' ? '' : str(f, 'digits')],
        ['period', str(f, 'type') === 'hotp' || str(f, 'period') === '30' ? '' : str(f, 'period')],
        ['counter', str(f, 'type') === 'hotp' ? str(f, 'counter') : ''],
      ])
    )
  },
}

const gs1: PayloadSpec = {
  label: 'GS1 Digital Link',
  group: 'other',
  defaults: { domain: 'https://id.gs1.org', gtin: '', lot: '', serial: '', expiry: '' },
  problem: f => {
    const gtin = digits(str(f, 'gtin'))
    if (!gtin) return 'Enter the GTIN.'
    if (!gtinValid(gtin)) return 'That GTIN fails its check digit.'
    if (str(f, 'expiry') && !/^\d{6}$/.test(digits(str(f, 'expiry')))) return 'Expiry is six digits, YYMMDD.'
    return null
  },
  encode: f =>
    str(f, 'domain').trim().replace(/\/+$/, '') +
    `/01/${digits(str(f, 'gtin'))}` +
    (str(f, 'lot').trim() ? `/10/${encodeURIComponent(str(f, 'lot').trim())}` : '') +
    (str(f, 'serial').trim() ? `/21/${encodeURIComponent(str(f, 'serial').trim())}` : '') +
    query([['17', digits(str(f, 'expiry'))]]),
}

export const CODES = { otp, gs1 }
