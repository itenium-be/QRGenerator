import { useMemo, useState } from 'react'
import { search, type IconEntry } from '../../icons'
import type { Mark, QrDesign } from '../../qr/types'
import { useDebounced } from '../hooks'

type Props = {
  design: QrDesign
  index: IconEntry[] | null
  bodies: Map<string, string>
  onMark: (mark: Mark) => void
  onSet: (patch: Partial<QrDesign>) => void
  onNeedBodies: (entries: IconEntry[]) => void
}

const MAX_UPLOAD = 2_000_000

export default function MarkStep({ design, index, bodies, onMark, onSet, onNeedBodies }: Props) {
  const [query, setQuery] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const held = useDebounced(query, 150)

  const results = useMemo(() => {
    if (!index) return []
    const found = search(index, held)
    onNeedBodies(found)
    return found
  }, [index, held, onNeedBodies])

  const picked = design.mark.type === 'icon' ? design.mark.slug : null
  const brandHex = picked ? index?.find(e => e.s === picked && e.k === 'b')?.h : undefined
  const tintable = design.mark.type !== 'upload' || design.mark.tintable

  async function upload(file: File) {
    setUploadError(null)
    if (file.size > MAX_UPLOAD) return setUploadError('That file is over 2 MB. Shrink it first.')
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.onerror = () => reject(new Error('read failed'))
      r.readAsDataURL(file)
    })
    /* Only a single-colour SVG can be recoloured; anything else keeps its own colours. */
    const isSvg = file.type === 'image/svg+xml'
    const text = isSvg ? atob(dataUrl.split(',')[1] ?? '') : ''
    const colours = new Set(text.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/g) ?? [])
    onMark({ type: 'upload', name: file.name, dataUrl, tintable: isSvg && colours.size <= 1 })
  }

  return (
    <>
      <div>
        <h2>Put something in the middle.</h2>
        <p className="lede">
          Error correction rebuilds what the mark covers, up to a point. Adding one locks error correction to H and
          keeps the mark at a size that still decodes.
        </p>
      </div>

      <div className="chipset">
        <button
          className="chip tint"
          aria-pressed={design.mark.type === 'icon'}
          onClick={() => onMark({ type: 'icon', set: 'g', slug: 'wifi' })}
        >
          Icon library
        </button>
        <label className="chip tint" aria-pressed={design.mark.type === 'upload'} style={{ cursor: 'pointer' }}>
          Upload
          <input
            type="file"
            accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
            hidden
            onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
        <button className="chip tint" aria-pressed={design.mark.type === 'none'} onClick={() => onMark({ type: 'none' })}>
          None
        </button>
      </div>

      {uploadError && <p className="note note-warn"><span aria-hidden="true">▲</span><span>{uploadError}</span></p>}

      {design.mark.type === 'upload' && (
        <p className="hint">
          {design.mark.name} · {tintable ? 'single colour, so it can be tinted' : "keeps its own colours"}
        </p>
      )}

      {design.mark.type !== 'upload' && (
        <>
          <div className="field">
            <label htmlFor="icon-q">Search {index ? index.length.toLocaleString() : '…'} icons</label>
            <div className="tf">
              <input id="icon-q" value={query} placeholder="wifi, coffee, github…" onChange={e => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="iconpick">
            {results.map(entry => (
              <button
                key={`${entry.k}${entry.s}`}
                title={entry.k === 'b' ? entry.t : entry.s}
                aria-pressed={picked === entry.s}
                onClick={() => onMark({ type: 'icon', set: entry.k, slug: entry.s })}
              >
                <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: bodies.get(`${entry.k}${entry.s}`) ?? '' }} />
              </button>
            ))}
            {index && results.length === 0 && <p className="hint">Nothing matches “{held}”.</p>}
          </div>
        </>
      )}

      {design.mark.type !== 'none' && (
        <>
          <div className="field">
            <label>Mark colour</label>
            <div className="chipset">
              <button className="chip tint" aria-pressed={design.markColor === 'inherit'} disabled={!tintable} onClick={() => onSet({ markColor: 'inherit' })}>
                Inherit modules
              </button>
              <button className="chip tint" aria-pressed={design.markColor === 'brand'} disabled={!brandHex} onClick={() => onSet({ markColor: 'brand' })}>
                Brand colour
              </button>
              <button className="chip tint" aria-pressed={design.markColor === '#15161B'} disabled={!tintable} onClick={() => onSet({ markColor: '#15161B' })}>
                Ink
              </button>
            </div>
            <div className="tf" style={{ marginTop: 8 }}>
              <input
                type="color"
                disabled={!tintable}
                value={design.markColor.startsWith('#') ? design.markColor : brandHex ?? design.fg}
                onChange={e => onSet({ markColor: e.target.value })}
              />
              <input value={design.markColor} readOnly />
            </div>
            <span className="hint">
              {!tintable
                ? "This image brings its own colours, so there's nothing to tint."
                : brandHex
                  ? `${picked} ships ${brandHex} as its official colour.`
                  : 'This icon has no official colour.'}
            </span>
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="m-size">Size · {Math.round(design.markSize * 100)}% of the width</label>
              <input id="m-size" className="range" type="range" min={0.1} max={0.45} step={0.01}
                value={design.markSize} onChange={e => onSet({ markSize: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label htmlFor="m-clear">Clearance · {design.markClearance.toFixed(1)} modules</label>
              <input id="m-clear" className="range" type="range" min={0} max={3} step={0.2}
                value={design.markClearance} onChange={e => onSet({ markClearance: Number(e.target.value) })} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
