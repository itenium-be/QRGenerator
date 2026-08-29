import { PAYLOADS, type Fields, type PayloadKind } from '../payloads'
import type { Mark, QrDesign } from '../qr/types'

export const PRESETS = [
  { name: 'Ink',    dot: 'square',        eyeFrame: 'square',        eyeDot: 'square',  fg: '#15161B', fg2: null,      bg: '#FFFFFF' },
  { name: 'Bloom',  dot: 'dots',          eyeFrame: 'dot',           eyeDot: 'dot',     fg: '#2B4BF2', fg2: '#8B2BF2', bg: '#FFFFFF' },
  { name: 'Pebble', dot: 'extra-rounded', eyeFrame: 'extra-rounded', eyeDot: 'dot',     fg: '#1B6B4A', fg2: null,      bg: '#F2F7F3' },
  { name: 'Signal', dot: 'classy',        eyeFrame: 'rounded',       eyeDot: 'square',  fg: '#8A1B2B', fg2: null,      bg: '#FFFFFF' },
  { name: 'Slate',  dot: 'rounded',       eyeFrame: 'rounded',       eyeDot: 'rounded', fg: '#33414F', fg2: null,      bg: '#EDEEE9' },
] as const satisfies readonly (Partial<QrDesign> & { name: string })[]

export function initialDesign(): QrDesign {
  const fields = Object.fromEntries(
    (Object.keys(PAYLOADS) as PayloadKind[]).map(k => [k, { ...PAYLOADS[k].defaults }]),
  ) as Record<PayloadKind, Fields>

  return {
    kind: 'url',
    fields,
    dot: 'rounded',
    eyeFrame: 'extra-rounded',
    eyeDot: 'dot',
    fg: '#2B4BF2',
    fg2: null,
    bg: '#FFFFFF',
    transparent: false,
    eye: null,
    mark: { type: 'icon', set: 'b', slug: 'itenium' },
    markColor: 'brand',
    markSize: 0.2,
    markClearance: 1.2,
    margin: 4,
    ecc: 'H',
    format: 'svg',
    pixelSize: 1024,
    fileName: 'qr',
  }
}

export type Action =
  | { type: 'set'; patch: Partial<QrDesign> }
  | { type: 'field'; name: string; value: string | boolean }
  | { type: 'kind'; kind: PayloadKind }
  | { type: 'preset'; index: number }
  | { type: 'mark'; mark: Mark }
  | { type: 'load'; design: QrDesign }
  | { type: 'reset' }

export function reduce(design: QrDesign, action: Action): QrDesign {
  switch (action.type) {
    case 'set':
      return { ...design, ...action.patch }

    case 'field':
      return {
        ...design,
        fields: {
          ...design.fields,
          [design.kind]: { ...design.fields[design.kind], [action.name]: action.value },
        },
      }

    case 'kind':
      return { ...design, kind: action.kind }

    /* Every preset names a background, which a transparent code would ignore. */
    case 'preset': {
      const { name, ...rest } = PRESETS[action.index]
      return { ...design, ...rest, transparent: false }
    }

    /* A mark can only be rebuilt by error correction at level H, and 0.2 is the
       largest size that still decodes on a short payload. */
    case 'mark':
      return action.mark.type === 'none'
        ? { ...design, mark: action.mark }
        : { ...design, mark: action.mark, ecc: 'H', markSize: Math.min(design.markSize, 0.2) }

    case 'load':
      return action.design

    case 'reset':
      return initialDesign()
  }
}
