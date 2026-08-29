import type { PayloadSpec } from './types'
import { escaper, str } from './util'

const escWifi = escaper(';,:"')

const field = (tag: string, value: string) => (value ? `${tag}:${escWifi(value)};` : '')

const wifi: PayloadSpec = {
  label: 'Wi-Fi',
  group: 'common',
  defaults: {
    ssid: '', security: 'WPA', password: '', hidden: false,
    eap: '', identity: '', anonymous: '', phase2: '',
  },
  problem: f => {
    const security = str(f, 'security')
    if (!str(f, 'ssid').trim()) return 'Enter the network name.'
    if (security !== 'nopass' && !str(f, 'password')) return 'Enter the password, or set security to none.'
    if (security === 'WPA2-EAP' && !str(f, 'identity')) return 'Enter the identity the network authenticates.'
    return null
  },
  encode: f => {
    const security = str(f, 'security')
    const open = security === 'nopass'
    const eap = security === 'WPA2-EAP'
    return (
      'WIFI:' +
      field('T', security) +
      field('S', str(f, 'ssid')) +
      (open ? '' : field('P', str(f, 'password'))) +
      (eap ? field('E', str(f, 'eap')) + field('I', str(f, 'identity')) +
        field('A', str(f, 'anonymous')) + field('PH2', str(f, 'phase2')) : '') +
      (f.hidden ? 'H:true;' : '') +
      ';'
    )
  },
}

export const WIFI = { wifi }
