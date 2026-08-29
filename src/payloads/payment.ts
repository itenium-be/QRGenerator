import type { Fields, PayloadSpec } from './types'
import { digits, ibanValid, money, query, str, tlv, withCrc } from './util'

/** EPC069-12 caps the whole block; over it, banks reject the code. */
const EPC_MAX_BYTES = 331

const epc: PayloadSpec = {
  label: 'SEPA payment',
  group: 'other',
  defaults: { name: '', iban: '', amount: '', remittance: '', bic: '', purpose: '' },
  problem: f => {
    if (!str(f, 'name').trim()) return 'Enter the beneficiary name.'
    if (!ibanValid(str(f, 'iban'))) return 'That IBAN does not check out.'
    if (str(f, 'remittance').length > 140) return 'The remittance is too long — 140 characters at most.'
    if (new TextEncoder().encode(epc.encode(f)).length > EPC_MAX_BYTES)
      return `The payment is too long — EPC codes hold ${EPC_MAX_BYTES} bytes.`
    return null
  },
  encode: f => {
    const amount = money(str(f, 'amount'))
    const lines = [
      'BCD', '002', '1', 'SCT',
      str(f, 'bic').trim().toUpperCase(),
      str(f, 'name').trim(),
      str(f, 'iban').replace(/\s/g, '').toUpperCase(),
      amount ? `EUR${amount}` : '',
      str(f, 'purpose').trim().toUpperCase(),
      '',
      str(f, 'remittance').trim(),
      '',
    ]
    while (lines.length && lines[lines.length - 1] === '') lines.pop()
    return lines.join('\n')
  },
}

const swissAddress = (f: Fields, prefix: string) => {
  const get = (k: string) => str(f, prefix + k)
  const empty = !['Name', 'Street', 'Building', 'Zip', 'City', 'Country'].some(k => get(k).trim())
  return empty
    ? ['', '', '', '', '', '', '']
    : ['S', get('Name'), get('Street'), get('Building'), get('Zip'), get('City'), get('Country').toUpperCase()]
}

const swiss: PayloadSpec = {
  label: 'Swiss QR-bill',
  group: 'other',
  hint: 'A payable bill also needs the Swiss cross as the centre mark and error correction M.',
  defaults: {
    iban: '', name: '', street: '', building: '', zip: '', city: '', country: 'CH',
    amount: '', currency: 'CHF', refType: 'NON', reference: '', message: '',
    debtorName: '', debtorStreet: '', debtorBuilding: '', debtorZip: '', debtorCity: '', debtorCountry: 'CH',
  },
  problem: f => {
    const iban = str(f, 'iban').replace(/\s/g, '').toUpperCase()
    if (!/^(CH|LI)/.test(iban) || !ibanValid(iban)) return 'A QR-bill needs a valid Swiss or Liechtenstein IBAN.'
    if (!str(f, 'name').trim()) return 'Enter the creditor name.'
    if (!str(f, 'city').trim()) return 'Enter the creditor town.'
    const ref = digits(str(f, 'reference'))
    if (str(f, 'refType') === 'QRR' && ref.length !== 27) return 'A QRR reference is 27 digits.'
    if (str(f, 'refType') === 'SCOR' && !/^RF/i.test(str(f, 'reference').trim()))
      return 'A SCOR reference starts with RF.'
    if (str(f, 'message').length > 140) return 'The message is too long — 140 characters at most.'
    return null
  },
  encode: f => {
    const creditor = ['S', str(f, 'name'), str(f, 'street'), str(f, 'building'),
      str(f, 'zip'), str(f, 'city'), str(f, 'country').toUpperCase()]
    return [
      'SPC', '0200', '1',
      str(f, 'iban').replace(/\s/g, '').toUpperCase(),
      ...creditor,
      ...Array<string>(7).fill(''), // ultimate creditor: reserved, must stay empty
      money(str(f, 'amount')),
      str(f, 'currency'),
      ...swissAddress(f, 'debtor'),
      str(f, 'refType'),
      str(f, 'reference').replace(/\s/g, ''),
      str(f, 'message'),
      'EPD',
    ].join('\r\n')
  },
}

const SCHEMES: Record<string, string> = {
  bitcoin: 'bitcoin', ethereum: 'ethereum', litecoin: 'litecoin', dogecoin: 'dogecoin', solana: 'solana',
}

const crypto: PayloadSpec = {
  label: 'Crypto',
  group: 'other',
  defaults: { coin: 'bitcoin', address: '', amount: '', label: '', message: '' },
  problem: f => (str(f, 'address').trim().length > 20 ? null : 'Enter the wallet address.'),
  encode: f =>
    `${SCHEMES[str(f, 'coin')] ?? 'bitcoin'}:${str(f, 'address').trim()}` +
    query([
      ['amount', str(f, 'amount').trim()],
      ['label', encodeURIComponent(str(f, 'label'))],
      ['message', encodeURIComponent(str(f, 'message'))],
    ]),
}

const upi: PayloadSpec = {
  label: 'UPI',
  group: 'other',
  defaults: { vpa: '', name: '', amount: '', note: '' },
  problem: f => (/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(str(f, 'vpa').trim()) ? null : 'Enter a UPI ID like name@bank.'),
  encode: f =>
    'upi://pay' +
    query([
      ['pa', str(f, 'vpa').trim()],
      ['pn', encodeURIComponent(str(f, 'name'))],
      ['am', money(str(f, 'amount'))],
      ['cu', 'INR'],
      ['tn', encodeURIComponent(str(f, 'note'))],
    ]),
}

const pix: PayloadSpec = {
  label: 'Pix',
  group: 'other',
  defaults: { key: '', name: '', city: '', amount: '', txid: '' },
  problem: f => {
    if (!str(f, 'key').trim()) return 'Enter the Pix key.'
    if (!str(f, 'name').trim()) return 'Enter the payee name.'
    if (!str(f, 'city').trim()) return 'Enter the payee city.'
    return null
  },
  encode: f =>
    withCrc(
      tlv('00', '01') +
        tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', str(f, 'key').trim())) +
        tlv('52', '0000') +
        tlv('53', '986') +
        tlv('54', money(str(f, 'amount'))) +
        tlv('58', 'BR') +
        tlv('59', str(f, 'name').trim().slice(0, 25).toUpperCase()) +
        tlv('60', str(f, 'city').trim().slice(0, 15).toUpperCase()) +
        tlv('62', tlv('05', str(f, 'txid').trim() || '***')),
    ),
}

/** PromptPay wants a 13-digit target: 0066 plus the mobile number without its trunk zero. */
const promptPayTarget = (method: string, raw: string) => {
  const d = digits(raw)
  if (method === 'phone') return `0066${d.replace(/^0/, '')}`
  return d
}

const promptpay: PayloadSpec = {
  label: 'PromptPay',
  group: 'other',
  defaults: { method: 'phone', target: '', amount: '' },
  problem: f => {
    const d = digits(str(f, 'target'))
    const method = str(f, 'method')
    if (method === 'phone' && d.length < 9) return 'Enter the Thai mobile number.'
    if (method === 'nid' && d.length !== 13) return 'A national ID is 13 digits.'
    if (method === 'ewallet' && d.length !== 15) return 'An e-wallet ID is 15 digits.'
    return null
  },
  encode: f => {
    const amount = money(str(f, 'amount'))
    const method = str(f, 'method')
    const subTag = method === 'phone' ? '01' : method === 'nid' ? '02' : '03'
    return withCrc(
      tlv('00', '01') +
        tlv('01', amount ? '12' : '11') +
        tlv('29', tlv('00', 'A000000677010111') + tlv(subTag, promptPayTarget(method, str(f, 'target')))) +
        tlv('53', '764') +
        tlv('54', amount) +
        tlv('58', 'TH'),
    )
  },
}

export const PAYMENT = { epc, swiss, crypto, upi, pix, promptpay }
