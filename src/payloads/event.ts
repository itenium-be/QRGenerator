import type { PayloadSpec } from './types'
import { escIcal, str } from './util'

/** 2026-09-01T09:00 -> 20260901T090000, floating local time so it lands in the scanner's own zone. */
const ical = (v: string) => v.replace(/[-:]/g, '').replace(/T(\d{4})$/, 'T$100')
const day = (v: string) => v.slice(0, 10).replace(/-/g, '')

const nextDay = (v: string) => {
  const d = new Date(`${v.slice(0, 10)}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

const event: PayloadSpec = {
  label: 'Event',
  group: 'common',
  defaults: { title: '', allday: false, start: '', end: '', location: '', description: '' },
  problem: f => {
    if (!str(f, 'title').trim()) return 'Give the event a title.'
    if (!str(f, 'start')) return 'Pick a start.'
    if (!str(f, 'end')) return 'Pick an end.'
    if (str(f, 'end') < str(f, 'start')) return 'The event ends before it starts.'
    return null
  },
  encode: f => {
    const allDay = Boolean(f.allday)
    return [
      'BEGIN:VEVENT',
      `SUMMARY:${escIcal(str(f, 'title'))}`,
      allDay
        ? `DTSTART;VALUE=DATE:${day(str(f, 'start'))}`
        : `DTSTART:${ical(str(f, 'start'))}`,
      allDay
        ? `DTEND;VALUE=DATE:${nextDay(str(f, 'end'))}`
        : `DTEND:${ical(str(f, 'end'))}`,
      str(f, 'location') && `LOCATION:${escIcal(str(f, 'location'))}`,
      str(f, 'description') && `DESCRIPTION:${escIcal(str(f, 'description'))}`,
      'END:VEVENT',
    ]
      .filter(Boolean)
      .join('\r\n')
  },
}

export const EVENT = { event }
