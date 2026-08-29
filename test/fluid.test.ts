import { describe, expect, it } from 'vitest'
import { filletCorners, fluidPath, roundedCorners } from '../src/qr/fluid'

/** '#' is a painted module, '.' an open light one, ' ' a cell nothing may paint in. */
const grid = (rows: string[]) => ({
  dark: (r: number, c: number) => rows[r]?.[c] === '#',
  open: (r: number, c: number) => rows[r]?.[c] === '#' || rows[r]?.[c] === '.',
})

const arcs = (path: string) => (path.match(/A/g) ?? []).length

describe('fluid module corners', () => {
  const lone = grid(['...', '.#.', '...'])

  it('rounds every corner of a module with no neighbours', () => {
    expect(roundedCorners(lone.dark, 1, 1)).toEqual({ nw: true, ne: true, se: true, sw: true })
  })

  it('squares off the corners a neighbour joins, so the two read as one shape', () => {
    const pair = grid(['...', '.##', '...'])
    expect(roundedCorners(pair.dark, 1, 1)).toEqual({ nw: true, ne: false, se: false, sw: true })
    expect(roundedCorners(pair.dark, 1, 2)).toEqual({ nw: false, ne: true, se: true, sw: false })
  })

  it('squares off all four corners inside a solid block', () => {
    const block = grid(['###', '###', '###'])
    expect(roundedCorners(block.dark, 1, 1)).toEqual({ nw: false, ne: false, se: false, sw: false })
  })
})

describe('fluid inner fillets', () => {
  it('fills the corner where two dark neighbours meet around a light cell', () => {
    const elbow = grid(['.#.', '##.', '...'])
    expect(filletCorners(elbow.dark, elbow.open, 0, 0)).toEqual({ nw: false, ne: false, se: true, sw: false })
  })

  it('leaves a light cell alone when only one neighbour is dark', () => {
    const lone = grid(['...', '.#.', '...'])
    expect(filletCorners(lone.dark, lone.open, 0, 1)).toEqual({ nw: false, ne: false, se: false, sw: false })
  })

  it('never paints into a cell that is closed, such as the mark clearance', () => {
    const hole = grid(['.#.', '# .', '...'])
    expect(filletCorners(hole.dark, hole.open, 1, 1)).toEqual({ nw: false, ne: false, se: false, sw: false })
  })
})

describe('fluid path', () => {
  it('draws a lone module as four arcs — a circle', () => {
    expect(arcs(fluidPath(grid(['...', '.#.', '...']).dark, () => true, 3, 0))).toBe(4)
  })

  it('drops the arcs on the seam between two neighbours', () => {
    expect(arcs(fluidPath(grid(['...', '.##', '...']).dark, () => true, 3, 0))).toBe(4)
  })

  it('offsets by the quiet zone', () => {
    expect(fluidPath(grid(['#']).dark, () => true, 1, 4)).toContain('d="M4.5 4H')
  })

  it('is empty when nothing is dark', () => {
    expect(fluidPath(() => false, () => true, 3, 0)).toBe('')
  })
})
