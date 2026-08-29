import { describe, expect, it } from 'vitest'
import { PAYLOADS, type Fields, type PayloadKind } from '../src/payloads'
import { FILLED } from './fixtures'

const enc = (kind: PayloadKind, over: Fields = {}) =>
  PAYLOADS[kind].encode({ ...FILLED[kind], ...over })

const problem = (kind: PayloadKind, over: Fields = {}) =>
  PAYLOADS[kind].problem({ ...FILLED[kind], ...over })

describe('calendar event', () => {
  it('encodes a timed event', () => {
    expect(enc('event')).toBe(
      [
        'BEGIN:VEVENT',
        'SUMMARY:Quiet Zone launch',
        'DTSTART:20260901T090000',
        'DTEND:20260901T100000',
        'LOCATION:itenium HQ',
        'DESCRIPTION:Bring stickers',
        'END:VEVENT',
      ].join('\r\n'),
    )
  })

  it('encodes an all-day event as dates, ending the day after', () => {
    const out = enc('event', { allday: true })
    expect(out).toContain('DTSTART;VALUE=DATE:20260901')
    expect(out).toContain('DTEND;VALUE=DATE:20260902')
  })

  it('escapes commas and semicolons in the summary', () => {
    expect(enc('event', { title: 'Beer, chips; fun' })).toContain('SUMMARY:Beer\\, chips\\; fun')
  })

  it('refuses an event that ends before it starts', () => {
    expect(problem('event', { end: '2026-09-01T08:00' })).toMatch(/end/i)
  })
})

describe('geo', () => {
  it('encodes a plain coordinate', () => {
    expect(enc('geo', { label: '' })).toBe('geo:50.8503,4.3517')
  })

  it('adds a query when a label is given', () => {
    expect(enc('geo')).toBe('geo:50.8503,4.3517?q=50.8503,4.3517(itenium)')
  })

  it('rejects an out-of-range latitude', () => {
    expect(problem('geo', { lat: '91' })).toMatch(/latitude/i)
  })
})

describe('whatsapp', () => {
  it('strips everything but digits from the number', () => {
    expect(enc('whatsapp', { number: '+32 (470) 12 34 56' })).toBe('https://wa.me/32470123456?text=Ping%20me')
  })

  it('omits the query when there is no message', () => {
    expect(enc('whatsapp', { message: '' })).toBe('https://wa.me/32470123456')
  })
})

describe('mecard', () => {
  it('encodes name last-first and closes with a double semicolon', () => {
    expect(enc('mecard')).toBe(
      'MECARD:N:Van Schandevijl,Wouter;TEL:+32470123456;EMAIL:hello@itenium.be;URL:https://itenium.be;;',
    )
  })

  it('escapes the reserved characters', () => {
    expect(enc('mecard', { note: 'a;b,c' })).toContain('NOTE:a\\;b\\,c;')
  })
})

describe('app store smart link', () => {
  it('points at the generator’s own redirect page', () => {
    const out = enc('applink')
    expect(out.startsWith('https://itenium-be.github.io/QRGenerator/#/go?')).toBe(true)
    expect(out).toContain('w=https%3A%2F%2Fitenium.be')
    expect(out).toContain('i=https%3A%2F%2Fapps.apple.com%2Fapp%2Fid1')
  })

  it('needs a fallback destination', () => {
    expect(problem('applink', { web: '' })).toMatch(/fallback/i)
  })
})

describe('SEPA / EPC payment', () => {
  it('encodes the twelve-line block, trailing blanks trimmed', () => {
    expect(enc('epc')).toBe(
      ['BCD', '002', '1', 'SCT', 'BBRUBEBB', 'itenium BV', 'BE68539007547034', 'EUR12.34', '', '', 'Invoice 2026-004'].join('\n'),
    )
  })

  it('formats the amount to two decimals', () => {
    expect(enc('epc', { amount: '7' })).toContain('EUR7.00')
  })

  it('omits the amount line when there is none', () => {
    expect(enc('epc', { amount: '' }).split('\n')[7]).toBe('')
  })

  it('rejects an IBAN that fails the mod-97 check', () => {
    expect(problem('epc', { iban: 'BE68539007547035' })).toMatch(/IBAN/i)
  })

  it('rejects a payload over the 331-byte limit', () => {
    expect(problem('epc', { remittance: 'x'.repeat(200) })).toMatch(/too long/i)
  })
})

describe('Swiss QR-bill', () => {
  it('opens with the SPC header and closes with the EPD trailer', () => {
    const lines = enc('swiss').split('\r\n')
    expect(lines.slice(0, 4)).toEqual(['SPC', '0200', '1', 'CH9300762011623852957'])
    expect(lines[30]).toBe('EPD')
  })

  it('puts amount and currency at lines 19 and 20', () => {
    const lines = enc('swiss').split('\r\n')
    expect(lines[18]).toBe('50.00')
    expect(lines[19]).toBe('CHF')
  })

  it('rejects a QRR reference that is not 27 digits', () => {
    expect(problem('swiss', { refType: 'QRR', reference: '123' })).toMatch(/reference/i)
  })
})

describe('crypto', () => {
  it('builds a BIP-21 style URI', () => {
    expect(enc('crypto')).toBe('bitcoin:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4?amount=0.005&label=itenium')
  })

  it('switches scheme with the coin', () => {
    expect(enc('crypto', { coin: 'ethereum' }).startsWith('ethereum:')).toBe(true)
  })
})

describe('TOTP', () => {
  it('encodes issuer, account and secret', () => {
    expect(enc('otp')).toBe('otpauth://totp/itenium:wouter?secret=JBSWY3DPEHPK3PXP&issuer=itenium')
  })

  it('only spells out non-default parameters', () => {
    expect(enc('otp', { digits: '8', period: '60' })).toContain('&digits=8&period=60')
  })

  it('encodes a counter for HOTP', () => {
    const out = enc('otp', { type: 'hotp', counter: '3' })
    expect(out.startsWith('otpauth://hotp/')).toBe(true)
    expect(out).toContain('&counter=3')
  })

  it('rejects a secret that is not base32', () => {
    expect(problem('otp', { secret: 'not-base32!' })).toMatch(/base32/i)
  })
})

describe('GS1 Digital Link', () => {
  it('builds the path from GTIN, lot and serial with expiry in the query', () => {
    expect(enc('gs1')).toBe('https://id.gs1.org/01/09506000134352/10/LOT42/21/SER7?17=271231')
  })

  it('rejects a GTIN with a bad check digit', () => {
    expect(problem('gs1', { gtin: '09506000134353' })).toMatch(/check digit/i)
  })
})

describe('UPI', () => {
  it('encodes the virtual payment address', () => {
    expect(enc('upi')).toBe('upi://pay?pa=itenium@okaxis&pn=itenium&am=250.00&cu=INR&tn=Invoice%20404')
  })
})

describe('EMVCo codes', () => {
  it('closes a Pix payload with a valid CRC', () => {
    const out = enc('pix')
    expect(out.startsWith('000201')).toBe(true)
    expect(out).toContain('0014br.gov.bcb.pix')
    expect(out.slice(-8, -4)).toBe('6304')
    expect(out.slice(-4)).toMatch(/^[0-9A-F]{4}$/)
  })

  it('marks a PromptPay code with an amount as one-time', () => {
    expect(enc('promptpay').slice(0, 12)).toBe('000201010212')
    expect(enc('promptpay', { amount: '' }).slice(0, 12)).toBe('000201010211')
  })

  it('normalises a Thai mobile number to 13 digits', () => {
    expect(enc('promptpay')).toContain('01130066812345678')
  })
})

describe('small URI payloads', () => {
  it('bookmark escapes the URL colon', () => {
    expect(enc('bookmark')).toBe('MEBKM:TITLE:itenium;URL:https\\://itenium.be;;')
  })

  it('skype', () => {
    expect(enc('skype')).toBe('skype:wouter?call')
    expect(enc('skype', { action: 'chat' })).toBe('skype:wouter?chat')
  })

  it('facetime', () => {
    expect(enc('facetime')).toBe('facetime:+32470123456')
    expect(enc('facetime', { audio: true })).toBe('facetime-audio:+32470123456')
  })

  it('zoom', () => {
    expect(enc('zoom')).toBe('https://zoom.us/j/1234567890?pwd=hunter2')
    expect(enc('zoom', { pwd: '' })).toBe('https://zoom.us/j/1234567890')
  })
})

describe('Wi-Fi enterprise', () => {
  it('encodes WPA3 as SAE', () => {
    expect(enc('wifi', { security: 'SAE' })).toContain('T:SAE;')
  })

  it('carries the EAP fields', () => {
    const out = enc('wifi', {
      security: 'WPA2-EAP', eap: 'PEAP', identity: 'wouter', anonymous: 'anon', phase2: 'MSCHAPV2',
    })
    expect(out).toContain('E:PEAP;')
    expect(out).toContain('I:wouter;')
    expect(out).toContain('A:anon;')
    expect(out).toContain('PH2:MSCHAPV2;')
  })
})

describe('vCard', () => {
  it('carries the address, birthday and note', () => {
    const out = enc('vcard')
    expect(out).toContain('ADR;TYPE=WORK:;;Bergensesteenweg 709;Anderlecht;;1600;Belgium')
    expect(out).toContain('BDAY:19850612')
    expect(out).toContain('NOTE:Bring stroopwafels')
  })

  it('switches to 4.0 syntax on request', () => {
    const out = enc('vcard', { version: '4.0' })
    expect(out).toContain('VERSION:4.0')
    expect(out).toContain('TEL;TYPE=cell;VALUE=uri:tel:+32470123456')
  })
})

describe('every kind', () => {
  it('is grouped as common or other', () => {
    for (const [kind, spec] of Object.entries(PAYLOADS))
      expect(spec.group, kind).toMatch(/^(common|other)$/)
  })

  it('accepts its own filled fixture', () => {
    for (const kind of Object.keys(PAYLOADS) as PayloadKind[])
      expect(PAYLOADS[kind].problem(FILLED[kind]), kind).toBeNull()
  })
})
