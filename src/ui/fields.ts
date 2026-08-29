import type { PayloadKind } from '../payloads'

export type FieldDef = {
  name: string
  label: string
  type?: 'text' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime-local'
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Hidden when the predicate fails, e.g. a password on an open network. */
  when?: (fields: Record<string, string | boolean>) => boolean
  wide?: boolean
}

const opts = (...values: string[]) => values.map(value => ({ value, label: value }))

const isEap = (f: Record<string, string | boolean>) => f.security === 'WPA2-EAP'

export const FIELDS: Record<PayloadKind, FieldDef[]> = {
  url: [{ name: 'url', label: 'Destination', placeholder: 'itenium.be', wide: true }],

  text: [{ name: 'text', label: 'Text', type: 'textarea', placeholder: 'Anything you like', wide: true }],

  wifi: [
    { name: 'ssid', label: 'Network name', wide: true },
    {
      name: 'security',
      label: 'Security',
      type: 'select',
      options: [
        { value: 'WPA', label: 'WPA / WPA2' },
        { value: 'SAE', label: 'WPA3' },
        { value: 'WPA2-EAP', label: 'Enterprise (EAP)' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'None' },
      ],
    },
    { name: 'password', label: 'Password', type: 'password', when: f => f.security !== 'nopass' },
    { name: 'eap', label: 'EAP method', type: 'select', options: opts('PEAP', 'TTLS', 'TLS', 'PWD'), when: isEap },
    { name: 'identity', label: 'Identity', when: isEap },
    { name: 'anonymous', label: 'Anonymous identity', when: isEap },
    { name: 'phase2', label: 'Phase 2', type: 'select', options: opts('MSCHAPV2', 'PAP', 'GTC'), when: isEap },
    { name: 'hidden', label: 'Hidden network', type: 'checkbox', wide: true },
  ],

  vcard: [
    { name: 'version', label: 'vCard version', type: 'select', options: opts('3.0', '4.0') },
    { name: 'first', label: 'First name' },
    { name: 'last', label: 'Last name' },
    { name: 'org', label: 'Organisation' },
    { name: 'title', label: 'Job title' },
    { name: 'tel', label: 'Mobile', placeholder: '+32470123456' },
    { name: 'telWork', label: 'Work phone' },
    { name: 'email', label: 'Email' },
    { name: 'url', label: 'Website' },
    { name: 'street', label: 'Street', wide: true },
    { name: 'zip', label: 'Postal code' },
    { name: 'city', label: 'Town' },
    { name: 'region', label: 'Region' },
    { name: 'country', label: 'Country' },
    { name: 'bday', label: 'Birthday', type: 'date' },
    { name: 'note', label: 'Note', type: 'textarea', wide: true },
  ],

  email: [
    { name: 'to', label: 'To', wide: true },
    { name: 'subject', label: 'Subject', wide: true },
    { name: 'body', label: 'Message', type: 'textarea', wide: true },
  ],

  sms: [
    { name: 'number', label: 'Number', placeholder: '+32470123456' },
    { name: 'message', label: 'Message', wide: true },
  ],

  tel: [{ name: 'number', label: 'Number', placeholder: '+32470123456', wide: true }],

  event: [
    { name: 'title', label: 'Title', wide: true },
    { name: 'start', label: 'Starts', type: 'datetime-local' },
    { name: 'end', label: 'Ends', type: 'datetime-local' },
    { name: 'allday', label: 'All day — the times are ignored', type: 'checkbox', wide: true },
    { name: 'location', label: 'Location', wide: true },
    { name: 'description', label: 'Description', type: 'textarea', wide: true },
  ],

  geo: [
    { name: 'lat', label: 'Latitude', placeholder: '50.8503' },
    { name: 'lon', label: 'Longitude', placeholder: '4.3517' },
    { name: 'label', label: 'Label', placeholder: 'Shown as the pin name', wide: true },
  ],

  whatsapp: [
    { name: 'number', label: 'Number', placeholder: '+32470123456' },
    { name: 'message', label: 'Prefilled message', wide: true },
  ],

  mecard: [
    { name: 'first', label: 'First name' },
    { name: 'last', label: 'Last name' },
    { name: 'tel', label: 'Phone', placeholder: '+32470123456' },
    { name: 'email', label: 'Email' },
    { name: 'url', label: 'Website', wide: true },
    { name: 'address', label: 'Address', wide: true },
    { name: 'note', label: 'Note', wide: true },
  ],

  applink: [
    { name: 'web', label: 'Fallback website', placeholder: 'itenium.be', wide: true },
    { name: 'ios', label: 'App Store link', placeholder: 'https://apps.apple.com/app/id…', wide: true },
    { name: 'android', label: 'Play Store link', placeholder: 'https://play.google.com/store/apps/details?id=…', wide: true },
  ],

  epc: [
    { name: 'name', label: 'Beneficiary', wide: true },
    { name: 'iban', label: 'IBAN', placeholder: 'BE68 5390 0754 7034', wide: true },
    { name: 'amount', label: 'Amount', placeholder: 'EUR, blank lets the payer choose' },
    { name: 'bic', label: 'BIC', placeholder: 'Optional' },
    { name: 'remittance', label: 'Communication', wide: true },
    { name: 'purpose', label: 'Purpose code', placeholder: 'Optional, e.g. GDDS' },
  ],

  swiss: [
    { name: 'iban', label: 'Creditor IBAN', placeholder: 'CH93 0076 2011 6238 5295 7', wide: true },
    { name: 'name', label: 'Creditor', wide: true },
    { name: 'street', label: 'Street' },
    { name: 'building', label: 'Number' },
    { name: 'zip', label: 'Postal code' },
    { name: 'city', label: 'Town' },
    { name: 'country', label: 'Country', placeholder: 'CH' },
    { name: 'amount', label: 'Amount' },
    { name: 'currency', label: 'Currency', type: 'select', options: opts('CHF', 'EUR') },
    {
      name: 'refType',
      label: 'Reference type',
      type: 'select',
      options: [
        { value: 'NON', label: 'None' },
        { value: 'QRR', label: 'QR reference (27 digits)' },
        { value: 'SCOR', label: 'Creditor reference (RF…)' },
      ],
    },
    { name: 'reference', label: 'Reference', when: f => f.refType !== 'NON', wide: true },
    { name: 'message', label: 'Message', wide: true },
    { name: 'debtorName', label: 'Debtor', placeholder: 'Optional', wide: true },
    { name: 'debtorStreet', label: 'Debtor street' },
    { name: 'debtorBuilding', label: 'Debtor number' },
    { name: 'debtorZip', label: 'Debtor postal code' },
    { name: 'debtorCity', label: 'Debtor town' },
    { name: 'debtorCountry', label: 'Debtor country' },
  ],

  crypto: [
    {
      name: 'coin',
      label: 'Coin',
      type: 'select',
      options: [
        { value: 'bitcoin', label: 'Bitcoin' },
        { value: 'ethereum', label: 'Ethereum' },
        { value: 'litecoin', label: 'Litecoin' },
        { value: 'dogecoin', label: 'Dogecoin' },
        { value: 'solana', label: 'Solana' },
      ],
    },
    { name: 'amount', label: 'Amount' },
    { name: 'address', label: 'Wallet address', wide: true },
    { name: 'label', label: 'Label' },
    { name: 'message', label: 'Message' },
  ],

  otp: [
    {
      name: 'type',
      label: 'Kind',
      type: 'select',
      options: [
        { value: 'totp', label: 'Time based (TOTP)' },
        { value: 'hotp', label: 'Counter based (HOTP)' },
      ],
    },
    { name: 'issuer', label: 'Issuer', placeholder: 'itenium' },
    { name: 'account', label: 'Account', placeholder: 'wouter' },
    { name: 'secret', label: 'Secret', type: 'password', placeholder: 'Base32', wide: true },
    { name: 'algorithm', label: 'Algorithm', type: 'select', options: opts('SHA1', 'SHA256', 'SHA512') },
    { name: 'digits', label: 'Digits', type: 'select', options: opts('6', '8') },
    { name: 'period', label: 'Period', type: 'select', options: opts('30', '60'), when: f => f.type !== 'hotp' },
    { name: 'counter', label: 'Counter', when: f => f.type === 'hotp' },
  ],

  gs1: [
    { name: 'domain', label: 'Domain', placeholder: 'https://id.gs1.org', wide: true },
    { name: 'gtin', label: 'GTIN' },
    { name: 'expiry', label: 'Expiry', placeholder: 'YYMMDD' },
    { name: 'lot', label: 'Lot' },
    { name: 'serial', label: 'Serial' },
  ],

  upi: [
    { name: 'vpa', label: 'UPI ID', placeholder: 'name@bank', wide: true },
    { name: 'name', label: 'Payee' },
    { name: 'amount', label: 'Amount' },
    { name: 'note', label: 'Note', wide: true },
  ],

  pix: [
    { name: 'key', label: 'Pix key', wide: true },
    { name: 'name', label: 'Payee' },
    { name: 'city', label: 'City' },
    { name: 'amount', label: 'Amount' },
    { name: 'txid', label: 'Transaction ID', placeholder: '***' },
  ],

  promptpay: [
    {
      name: 'method',
      label: 'Identified by',
      type: 'select',
      options: [
        { value: 'phone', label: 'Mobile number' },
        { value: 'nid', label: 'National ID' },
        { value: 'ewallet', label: 'e-Wallet ID' },
      ],
    },
    { name: 'target', label: 'Number' },
    { name: 'amount', label: 'Amount', placeholder: 'THB' },
  ],

  bookmark: [
    { name: 'title', label: 'Title' },
    { name: 'url', label: 'Address', placeholder: 'itenium.be' },
  ],

  skype: [
    { name: 'user', label: 'Skype name' },
    {
      name: 'action',
      label: 'Opens',
      type: 'select',
      options: [
        { value: 'call', label: 'A call' },
        { value: 'chat', label: 'A chat' },
      ],
    },
  ],

  facetime: [
    { name: 'target', label: 'Number or Apple ID', placeholder: '+32470123456', wide: true },
    { name: 'audio', label: 'Audio only', type: 'checkbox', wide: true },
  ],

  zoom: [
    { name: 'meeting', label: 'Meeting ID' },
    { name: 'pwd', label: 'Passcode' },
  ],
}
