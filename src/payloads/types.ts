export type PayloadKind =
  | 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'tel' | 'event' | 'geo' | 'whatsapp'
  | 'mecard' | 'applink' | 'epc' | 'swiss' | 'crypto' | 'otp' | 'gs1' | 'upi' | 'pix'
  | 'promptpay' | 'bookmark' | 'skype' | 'facetime' | 'zoom'

export type Fields = Record<string, string | boolean>

export type PayloadSpec = {
  label: string
  /** 'other' kinds hide behind a disclosure; only the everyday ones get a chip up front. */
  group: 'common' | 'other'
  /** A caveat the form itself can't express, shown above the fields. */
  hint?: string
  defaults: Fields
  /** Why the payload can't be encoded yet, or null when it can. */
  problem: (f: Fields) => string | null
  encode: (f: Fields) => string
}
