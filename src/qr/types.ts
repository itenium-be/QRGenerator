import type { Fields, PayloadKind } from '../payloads'

export type DotStyle = 'square' | 'rounded' | 'extra-rounded' | 'dots' | 'classy' | 'fluid'
export type EyeFrame = 'square' | 'rounded' | 'extra-rounded' | 'dot'
export type EyeDot = 'square' | 'rounded' | 'dot'
export type Ecc = 'L' | 'M' | 'Q' | 'H'
export type Format = 'svg' | 'png' | 'jpg' | 'webp'

export type Mark =
  | { type: 'none' }
  | { type: 'icon'; slug: string; set: 'b' | 'g' }
  | { type: 'upload'; name: string; dataUrl: string; tintable: boolean }

/** 'inherit' follows the module colour, 'brand' the icon's official hex, anything else is a hex. */
export type MarkColor = 'inherit' | 'brand' | string

export type QrDesign = {
  kind: PayloadKind
  fields: Record<PayloadKind, Fields>
  dot: DotStyle
  eyeFrame: EyeFrame
  eyeDot: EyeDot
  fg: string
  fg2: string | null
  bg: string
  eye: string | null
  mark: Mark
  markColor: MarkColor
  markSize: number
  markClearance: number
  margin: number
  ecc: Ecc
  format: Format
  pixelSize: number
  fileName: string
}
