/** Whether a cell at these coordinates is painted; out of range reads false. */
export type Cell = (r: number, c: number) => boolean

export type Corners = { nw: boolean; ne: boolean; se: boolean; sw: boolean }

/** Half a module — an isolated one then rounds into a circle. */
const K = 0.5

export function roundedCorners(dark: Cell, r: number, c: number): Corners {
  const n = dark(r - 1, c)
  const s = dark(r + 1, c)
  const w = dark(r, c - 1)
  const e = dark(r, c + 1)
  return { nw: !n && !w, ne: !n && !e, se: !s && !e, sw: !s && !w }
}

/**
 * Corners of a *light* cell that the dark shape curves into, smoothing the right
 * angle two dark neighbours would otherwise leave. `open` keeps this out of cells
 * that are deliberately blank — the finders and the clearance around the mark.
 */
export function filletCorners(dark: Cell, open: Cell, r: number, c: number): Corners {
  if (dark(r, c) || !open(r, c)) return { nw: false, ne: false, se: false, sw: false }
  const n = dark(r - 1, c)
  const s = dark(r + 1, c)
  const w = dark(r, c - 1)
  const e = dark(r, c + 1)
  return { nw: n && w, ne: n && e, se: s && e, sw: s && w }
}

function modulePath(x: number, y: number, k: Corners): string {
  const x1 = x + 1
  const y1 = y + 1
  const arc = (px: number, py: number) => `A${K} ${K} 0 0 1 ${px} ${py}`
  return (
    `M${k.nw ? x + K : x} ${y}` +
    `H${k.ne ? x1 - K : x1}${k.ne ? arc(x1, y + K) : ''}` +
    `V${k.se ? y1 - K : y1}${k.se ? arc(x1 - K, y1) : ''}` +
    `H${k.sw ? x + K : x}${k.sw ? arc(x, y1 - K) : ''}` +
    `V${k.nw ? y + K : y}${k.nw ? arc(x + K, y) : ''}` +
    'Z'
  )
}

function filletPath(x: number, y: number, k: Corners): string {
  const x1 = x + 1
  const y1 = y + 1
  const wedge = (cx: number, cy: number, ax: number, ay: number, bx: number, by: number) =>
    `M${cx} ${cy}L${ax} ${ay}A${K} ${K} 0 0 0 ${bx} ${by}Z`
  return (
    (k.nw ? wedge(x, y, x + K, y, x, y + K) : '') +
    (k.ne ? wedge(x1, y, x1, y + K, x1 - K, y) : '') +
    (k.se ? wedge(x1, y1, x1 - K, y1, x1, y1 - K) : '') +
    (k.sw ? wedge(x, y1, x, y1 - K, x + K, y1) : '')
  )
}

const any = (k: Corners) => k.nw || k.ne || k.se || k.sw

/** One merged outline for the whole matrix: neighbours share a straight seam. */
export function fluidPath(dark: Cell, open: Cell, n: number, q: number): string {
  let d = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = c + q
      const y = r + q
      if (dark(r, c)) {
        d += modulePath(x, y, roundedCorners(dark, r, c))
        continue
      }
      const fillets = filletCorners(dark, open, r, c)
      if (any(fillets)) d += filletPath(x, y, fillets)
    }
  }
  return d ? `<path d="${d}"/>` : ''
}
