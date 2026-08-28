import { useEffect, useRef, useState } from 'react'
import { loadBody, loadIndex, type IconEntry } from '../icons'
import { browserDecoder } from '../qr/decode.browser'
import { canvasRasterizer } from '../qr/raster.browser'
import { encodePayload, payloadProblem, renderSvg } from '../qr/render'
import type { QrDesign } from '../qr/types'
import { verifyScannable } from '../qr/verify'

export function useDebounced<T>(value: T, ms: number): T {
  const [held, setHeld] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setHeld(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return held
}

export function useIconIndex() {
  const [index, setIndex] = useState<IconEntry[] | null>(null)
  useEffect(() => {
    let live = true
    loadIndex().then(i => live && setIndex(i), () => live && setIndex([]))
    return () => {
      live = false
    }
  }, [])
  return index
}

/** The picked icon's 24x24 fragment and its official colour, if it has one. */
export function useMark(design: QrDesign, index: IconEntry[] | null) {
  const [body, setBody] = useState<string | undefined>()
  const mark = design.mark
  const slug = mark.type === 'icon' ? mark.slug : null
  const set = mark.type === 'icon' ? mark.set : null

  useEffect(() => {
    if (!slug || !set) return setBody(undefined)
    let live = true
    loadBody({ s: slug, t: '', k: set }).then(b => live && setBody(b))
    return () => {
      live = false
    }
  }, [slug, set])

  const brandHex = slug ? index?.find(e => e.s === slug && e.k === 'b')?.h : undefined
  return { markBody: body, brandHex }
}

export type Render = { svg: string | null; problem: string | null; payload: string }

export function useRender(design: QrDesign, markBody?: string, brandHex?: string): Render {
  const problem = payloadProblem(design)
  if (problem) return { svg: null, problem, payload: '' }
  return { svg: renderSvg(design, { markBody, brandHex }), problem: null, payload: encodePayload(design) }
}

export type ScanState = 'checking' | 'ok' | 'unreadable' | 'unknown'

/** Decodes the rendered code the way a camera would, so the badge is a fact. */
export function useScanCheck(svg: string | null, expected: string): ScanState {
  const held = useDebounced(svg, 350)
  const [state, setState] = useState<ScanState>('unknown')
  const run = useRef(0)

  useEffect(() => {
    if (!held) return setState('unknown')
    const id = ++run.current
    setState('checking')
    verifyScannable(held, canvasRasterizer, browserDecoder)
      .then(text => {
        if (run.current === id) setState(text === expected ? 'ok' : 'unreadable')
      })
      .catch(() => {
        if (run.current === id) setState('unknown')
      })
  }, [held, expected])

  return state
}
