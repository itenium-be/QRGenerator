import type { Fields, PayloadSpec } from './types'
import { escMecard, escVcard, str } from './util'

const stamp = (iso: string) => iso.replace(/-/g, '')

const adr = (f: Fields) =>
  [str(f, 'street'), str(f, 'city'), str(f, 'region'), str(f, 'zip'), str(f, 'country')].some(Boolean)
    ? `ADR;TYPE=WORK:;;${[
        str(f, 'street'), str(f, 'city'), str(f, 'region'), str(f, 'zip'), str(f, 'country'),
      ].map(escVcard).join(';')}`
    : ''

const vcard: PayloadSpec = {
  label: 'Contact',
  group: 'common',
  defaults: {
    version: '3.0', first: '', last: '', org: '', title: '', tel: '', telWork: '', email: '',
    url: '', street: '', city: '', region: '', zip: '', country: '', bday: '', note: '',
  },
  problem: f => ((str(f, 'first') + str(f, 'last')).trim() ? null : 'Enter at least a name.'),
  encode: f => {
    const v4 = str(f, 'version') === '4.0'
    const full = `${str(f, 'first')} ${str(f, 'last')}`.trim()
    const phone = (type: string, number: string) =>
      v4 ? `TEL;TYPE=${type};VALUE=uri:tel:${number}` : `TEL;TYPE=${type.toUpperCase()}:${number}`
    return [
      'BEGIN:VCARD',
      `VERSION:${v4 ? '4.0' : '3.0'}`,
      `N:${escVcard(str(f, 'last'))};${escVcard(str(f, 'first'))};;;`,
      `FN:${escVcard(full)}`,
      str(f, 'org') && `ORG:${escVcard(str(f, 'org'))}`,
      str(f, 'title') && `TITLE:${escVcard(str(f, 'title'))}`,
      str(f, 'tel') && phone('cell', str(f, 'tel')),
      str(f, 'telWork') && phone('work', str(f, 'telWork')),
      str(f, 'email') && `EMAIL:${str(f, 'email')}`,
      str(f, 'url') && `URL:${str(f, 'url')}`,
      adr(f),
      str(f, 'bday') && `BDAY:${stamp(str(f, 'bday'))}`,
      str(f, 'note') && `NOTE:${escVcard(str(f, 'note'))}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n')
  },
}

const mecard: PayloadSpec = {
  label: 'MeCard',
  group: 'other',
  defaults: { first: '', last: '', tel: '', email: '', url: '', address: '', note: '' },
  problem: f => ((str(f, 'first') + str(f, 'last')).trim() ? null : 'Enter at least a name.'),
  encode: f => {
    const name = [str(f, 'last'), str(f, 'first')].map(escMecard).filter(Boolean).join(',')
    const parts = [
      `N:${name}`,
      str(f, 'tel') && `TEL:${str(f, 'tel')}`,
      str(f, 'email') && `EMAIL:${str(f, 'email')}`,
      str(f, 'url') && `URL:${str(f, 'url')}`,
      str(f, 'address') && `ADR:${escMecard(str(f, 'address'))}`,
      str(f, 'note') && `NOTE:${escMecard(str(f, 'note'))}`,
    ].filter(Boolean) as string[]
    return `MECARD:${parts.map(p => `${p};`).join('')};`
  },
}

export const CONTACT = { vcard, mecard }
