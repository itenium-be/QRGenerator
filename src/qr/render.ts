import qrcode from 'qrcode-generator'
import { PAYLOADS } from '../payloads'
import type { QrDesign } from './types'

/* qrcode-generator's own stringToBytes truncates each char to one byte, which
   mangles anything outside latin-1. Scanners read byte mode as UTF-8. */
qrcode.stringToBytes = (s: string) => Array.from(new TextEncoder().encode(s))

export type Matrix = { size: number; dark: (r: number, c: number) => boolean }

export function matrix(text: string, ecc: QrDesign['ecc']): Matrix {
  const qr = qrcode(0, ecc)
  qr.addData(text)
  qr.make()
  return { size: qr.getModuleCount(), dark: (r, c) => qr.isDark(r, c) }
}

export function encodePayload(design: QrDesign): string {
  return PAYLOADS[design.kind].encode(design.fields[design.kind])
}

export function payloadProblem(design: QrDesign): string | null {
  return PAYLOADS[design.kind].problem(design.fields[design.kind])
}

function modulePath(style: QrDesign['dot'], x: number, y: number): string {
  switch (style) {
    case 'dots':
      return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.46"/>`
    case 'rounded':
      return `<rect x="${x + 0.04}" y="${y + 0.04}" width="0.92" height="0.92" rx="0.3"/>`
    case 'extra-rounded':
      return `<rect x="${x + 0.02}" y="${y + 0.02}" width="0.96" height="0.96" rx="0.46"/>`
    case 'classy':
      return `<path d="M${x + 0.5} ${y}H${x + 1}V${y + 0.5}A0.5 0.5 0 0 1 ${x + 0.5} ${y + 1}H${x}V${y + 0.5}A0.5 0.5 0 0 1 ${x + 0.5} ${y}Z"/>`
    default:
      return `<rect x="${x}" y="${y}" width="1" height="1"/>`
  }
}

function eye(frame: QrDesign['eyeFrame'], dot: QrDesign['eyeDot'], r: number, c: number): string {
  const rx = frame === 'extra-rounded' ? 2.2 : frame === 'rounded' ? 1.2 : frame === 'dot' ? 3.5 : 0
  const drx = dot === 'dot' ? 1.5 : dot === 'rounded' ? 0.9 : 0
  return (
    `<rect x="${c + 0.5}" y="${r + 0.5}" width="6" height="6" rx="${rx}" fill="none" stroke="currentColor" stroke-width="1"/>` +
    `<rect x="${c + 2}" y="${r + 2}" width="3" height="3" rx="${drx}"/>`
  )
}

export function resolveMarkColor(design: QrDesign, brandHex?: string): string {
  if (design.markColor === 'inherit') return design.fg
  if (design.markColor === 'brand') return brandHex ?? design.fg
  return design.markColor
}

export type RenderExtras = {
  /** 24x24 SVG fragment for an icon mark. */
  markBody?: string
  /** Official hex of the picked brand icon, for markColor: 'brand'. */
  brandHex?: string
}

export function renderSvg(design: QrDesign, extras: RenderExtras = {}): string {
  const text = encodePayload(design)
  const m = matrix(text, design.ecc)
  const n = m.size
  const q = design.margin
  const view = n + q * 2
  const finders: [number, number][] = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]
  const inFinder = (r: number, c: number) =>
    finders.some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7)

  const showMark = design.mark.type !== 'none' && (extras.markBody || design.mark.type === 'upload')
  const side = n * design.markSize
  const hole = showMark
    ? { lo: (n - side) / 2 - design.markClearance + q, hi: (n + side) / 2 + design.markClearance + q }
    : null

  let mods = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!m.dark(r, c) || inFinder(r, c)) continue
      const x = c + q
      const y = r + q
      if (hole && x + 1 > hole.lo && x < hole.hi && y + 1 > hole.lo && y < hole.hi) continue
      mods += modulePath(design.dot, x, y)
    }
  }

  /* Several codes share one document — the preview and every preset thumbnail —
     so a fixed id would make them all resolve to whichever rendered first. */
  const gradientId = `qz-${design.fg}${design.fg2}`.replace(/[^a-z0-9]/gi, '')
  const gradient = design.fg2
    ? `<linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${design.fg}"/><stop offset="1" stop-color="${design.fg2}"/></linearGradient>`
    : ''
  const eyeColor = design.eye ?? design.fg
  const markColor = resolveMarkColor(design, extras.brandHex)
  const offset = view / 2 - side / 2

  let mark = ''
  if (showMark && design.mark.type === 'upload') {
    mark = `<image x="${offset}" y="${offset}" width="${side}" height="${side}" preserveAspectRatio="xMidYMid meet" href="${design.mark.dataUrl}"/>`
  } else if (showMark && extras.markBody) {
    mark = `<g transform="translate(${offset} ${offset}) scale(${side / 24})" color="${markColor}" fill="${markColor}">${extras.markBody}</g>`
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${view} ${view}" shape-rendering="geometricPrecision">` +
    `<defs>${gradient}</defs>` +
    `<rect width="${view}" height="${view}" fill="${design.bg}"/>` +
    `<g fill="${design.fg2 ? `url(#${gradientId})` : design.fg}">${mods}</g>` +
    `<g color="${eyeColor}" fill="${eyeColor}">${finders.map(([r, c]) => eye(design.eyeFrame, design.eyeDot, r + q, c + q)).join('')}</g>` +
    mark +
    '</svg>'
  )
}
