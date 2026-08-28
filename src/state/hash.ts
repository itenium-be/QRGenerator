import { PAYLOADS, type PayloadKind } from '../payloads'
import type { QrDesign } from '../qr/types'
import { initialDesign } from './design'

const V = 1

/** Short keys keep shared links readable; the version guards future changes. */
const KEYS = {
  k: 'kind', d: 'dot', ef: 'eyeFrame', ed: 'eyeDot', f: 'fg', f2: 'fg2', b: 'bg',
  e: 'eye', mc: 'markColor', ms: 'markSize', mp: 'markClearance', q: 'margin',
  c: 'ecc', fm: 'format', px: 'pixelSize', fn: 'fileName',
} as const

export function toHash(design: QrDesign): string {
  const p = new URLSearchParams()
  p.set('v', String(V))
  for (const [short, long] of Object.entries(KEYS)) {
    const value = design[long as keyof QrDesign]
    if (value === null || value === undefined) continue
    p.set(short, String(value))
  }
  if (design.mark.type === 'icon') p.set('mi', `${design.mark.set}:${design.mark.slug}`)
  const fields = design.fields[design.kind]
  for (const [name, value] of Object.entries(fields))
    if (value !== '' && value !== false) p.set(`x.${name}`, String(value))
  return p.toString()
}

export function fromHash(hash: string): QrDesign | null {
  const raw = hash.replace(/^#/, '')
  if (!raw) return null
  const p = new URLSearchParams(raw)
  if (p.get('v') !== String(V)) return null

  const base = initialDesign()
  const kind = (p.get('k') ?? base.kind) as PayloadKind
  if (!PAYLOADS[kind]) return null
  const design: QrDesign = { ...base, kind }

  for (const [short, long] of Object.entries(KEYS)) {
    const value = p.get(short)
    if (value === null) continue
    if (long === 'kind') continue
    const numeric = long === 'markSize' || long === 'markClearance' || long === 'margin' || long === 'pixelSize'
    ;(design as Record<string, unknown>)[long] = numeric ? Number(value) : value
  }
  if (design.fg2 === 'null') design.fg2 = null
  if (design.eye === 'null') design.eye = null

  const mi = p.get('mi')
  if (mi) {
    const [set, slug] = mi.split(':')
    if ((set === 'b' || set === 'g') && slug) design.mark = { type: 'icon', set, slug }
  }

  const fields: Record<string, string | boolean> = { ...PAYLOADS[kind].defaults }
  for (const [key, value] of p.entries()) {
    if (!key.startsWith('x.')) continue
    const name = key.slice(2)
    fields[name] = typeof fields[name] === 'boolean' ? value === 'true' : value
  }
  design.fields = { ...base.fields, [kind]: fields }
  return design
}
