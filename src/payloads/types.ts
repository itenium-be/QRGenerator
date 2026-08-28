export type PayloadKind = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'tel'

export type Fields = Record<string, string | boolean>

export type PayloadSpec = {
  label: string
  defaults: Fields
  /** Why the payload can't be encoded yet, or null when it can. */
  problem: (f: Fields) => string | null
  encode: (f: Fields) => string
}
