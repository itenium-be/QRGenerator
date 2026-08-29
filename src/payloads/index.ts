import { BASIC } from './basic'
import { CODES } from './codes'
import { CONTACT } from './contact'
import { EVENT } from './event'
import { PAYMENT } from './payment'
import type { PayloadKind, PayloadSpec } from './types'
import { WIFI } from './wifi'

/** Declaration order is chip order: the everyday kinds first, the specialist ones after. */
export const PAYLOADS: Record<PayloadKind, PayloadSpec> = {
  url: BASIC.url,
  text: BASIC.text,
  wifi: WIFI.wifi,
  vcard: CONTACT.vcard,
  email: BASIC.email,
  sms: BASIC.sms,
  tel: BASIC.tel,
  event: EVENT.event,
  geo: BASIC.geo,
  whatsapp: BASIC.whatsapp,

  mecard: CONTACT.mecard,
  applink: BASIC.applink,
  epc: PAYMENT.epc,
  swiss: PAYMENT.swiss,
  crypto: PAYMENT.crypto,
  otp: CODES.otp,
  gs1: CODES.gs1,
  upi: PAYMENT.upi,
  pix: PAYMENT.pix,
  promptpay: PAYMENT.promptpay,
  bookmark: BASIC.bookmark,
  skype: BASIC.skype,
  facetime: BASIC.facetime,
  zoom: BASIC.zoom,
}

export const PAYLOAD_KINDS = Object.keys(PAYLOADS) as PayloadKind[]

export const COMMON_KINDS = PAYLOAD_KINDS.filter(k => PAYLOADS[k].group === 'common')
export const OTHER_KINDS = PAYLOAD_KINDS.filter(k => PAYLOADS[k].group === 'other')

export { SMART_LINK_BASE } from './basic'
export type { Fields, PayloadKind, PayloadSpec } from './types'
