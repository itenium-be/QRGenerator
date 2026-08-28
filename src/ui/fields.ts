import type { PayloadKind } from '../payloads'

export type FieldDef = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'checkbox'
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Hidden when the predicate fails, e.g. a password on an open network. */
  when?: (fields: Record<string, string | boolean>) => boolean
  wide?: boolean
}

export const FIELDS: Record<PayloadKind, FieldDef[]> = {
  url: [{ name: 'url', label: 'Destination', placeholder: 'itenium.be', wide: true }],

  text: [{ name: 'text', label: 'Text', type: 'textarea', placeholder: 'Anything you like', wide: true }],

  wifi: [
    { name: 'ssid', label: 'Network name', placeholder: 'Itenium Guest', wide: true },
    {
      name: 'security',
      label: 'Security',
      type: 'select',
      options: [
        { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'None' },
      ],
    },
    { name: 'password', label: 'Password', when: f => f.security !== 'nopass' },
    { name: 'hidden', label: 'Hidden network', type: 'checkbox', wide: true },
  ],

  vcard: [
    { name: 'first', label: 'First name' },
    { name: 'last', label: 'Last name' },
    { name: 'org', label: 'Organisation' },
    { name: 'title', label: 'Job title' },
    { name: 'tel', label: 'Phone', placeholder: '+32470123456' },
    { name: 'email', label: 'Email' },
    { name: 'url', label: 'Website', wide: true },
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
}
