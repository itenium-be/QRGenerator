import type { Fields } from './types'

export const str = (f: Fields, k: string) => String(f[k] ?? '')
export const digits = (s: string) => s.replace(/\D/g, '')

/** Backslash escaping, over the character set the format reserves. */
export const escaper = (chars: string) => {
  const re = new RegExp(`([\\\\${chars}])`, 'g')
  return (s: string) => s.replace(re, '\\$1').replace(/\r?\n/g, '\\n')
}

export const escVcard = escaper(';,')
export const escIcal = escaper(';,')
/* MECARD readers split on the first colon, so an escaped one in a URL breaks
   more parsers than it fixes. MEBKM is the opposite: DoCoMo specifies it. */
export const escMecard = escaper(';,')
export const escMebkm = escaper(';,:')

export const query = (pairs: [string, string][]) => {
  const q = pairs.filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('&')
  return q ? `?${q}` : ''
}

/** Two decimals, or empty when there is no amount to state. */
export function money(raw: string): string {
  const n = Number(raw.replace(',', '.'))
  return raw.trim() === '' || !Number.isFinite(n) ? '' : n.toFixed(2)
}

export function ibanValid(raw: string): boolean {
  const iban = raw.replace(/\s/g, '').toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false
  const shifted = iban.slice(4) + iban.slice(0, 4)
  const numeric = shifted.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55))
  let rest = 0
  for (const d of numeric) rest = (rest * 10 + Number(d)) % 97
  return rest === 1
}

/** GS1 modulo-10: weights alternate 3 and 1 from the check digit leftwards. */
export function gtinValid(raw: string): boolean {
  if (!/^\d{8}$|^\d{12,14}$/.test(raw)) return false
  const body = raw.slice(0, -1).split('').reverse()
  const sum = body.reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === Number(raw.slice(-1))
}

export const base32Valid = (s: string) => /^[A-Z2-7]+=*$/i.test(s.replace(/\s/g, ''))

/** CRC16/CCITT-FALSE, the checksum every EMVCo merchant code ends with. */
export function crc16(s: string): string {
  let crc = 0xffff
  for (const ch of s) {
    crc ^= ch.charCodeAt(0) << 8
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** One EMVCo tag-length-value field; length is two decimal digits. */
export const tlv = (tag: string, value: string) =>
  value === '' ? '' : tag + String(value.length).padStart(2, '0') + value

/** Appends tag 63, whose length and position are part of the checksummed text. */
export const withCrc = (body: string) => body + '6304' + crc16(body + '6304')
