import { useState } from 'react'
import { copyImage, download, toBlob } from '../../qr/export'
import type { Format, QrDesign } from '../../qr/types'
import type { ScanState } from '../hooks'

type Props = {
  design: QrDesign
  svg: string | null
  scan: ScanState
  shareUrl: string
  onSet: (patch: Partial<QrDesign>) => void
  onSave: (name: string) => void
}

const FORMATS: Format[] = ['svg', 'png', 'jpg', 'webp']

export default function Export({ design, svg, scan, shareUrl, onSet, onSave }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  const [name, setName] = useState('')

  async function saveFile() {
    if (!svg) return
    download(await toBlob(svg, design.format, design.pixelSize), design.fileName, design.format)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied('link')
    setTimeout(() => setCopied(null), 1500)
  }

  async function copyPng() {
    if (!svg) return
    setCopied((await copyImage(svg, design.pixelSize)) ? 'image' : 'failed')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <>
      <div>
        <h2>Take it away.</h2>
        <p className="lede">SVG for print and anything that scales. PNG for slides and chat.</p>
      </div>

      {scan === 'ok' && (
        <p className="note note-ok">
          <span aria-hidden="true">✓</span>
          <span>Decoded back to your payload just now, at 640 px. Print it larger than you think you need.</span>
        </p>
      )}

      {design.transparent && design.format === 'jpg' && (
        <p className="note note-warn">
          <span aria-hidden="true">▲</span>
          <span>JPG has no alpha. This one exports on white — pick PNG, WebP or SVG to keep it transparent.</span>
        </p>
      )}

      <div className="field">
        <label>Format</label>
        <div className="chipset">
          {FORMATS.map(format => (
            <button key={format} className="chip tint" aria-pressed={design.format === format} onClick={() => onSet({ format })}>
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="two">
        <div className="field">
          <label htmlFor="e-px">Pixel size</label>
          <div className="tf">
            <input id="e-px" type="number" min={128} max={4096} step={64} value={design.pixelSize}
              onChange={e => onSet({ pixelSize: Number(e.target.value) })} disabled={design.format === 'svg'} />
            <span className="unit">px</span>
          </div>
          {design.format === 'svg' && <span className="hint">SVG scales on its own.</span>}
        </div>
        <div className="field">
          <label htmlFor="e-name">File name</label>
          <div className="tf">
            <input id="e-name" value={design.fileName} onChange={e => onSet({ fileName: e.target.value })} />
            <span className="unit">.{design.format}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" disabled={!svg} onClick={saveFile}>
          Download {design.format.toUpperCase()}
        </button>
        <button className="btn btn-ghost" disabled={!svg} onClick={copyPng}>
          {copied === 'image' ? 'Copied' : copied === 'failed' ? "Browser said no" : 'Copy image'}
        </button>
        <button className="btn btn-ghost" onClick={copyLink}>{copied === 'link' ? 'Copied' : 'Copy link'}</button>
      </div>

      <div className="sharel"><span>{shareUrl}</span></div>

      <div className="field">
        <label htmlFor="e-save">Save this design</label>
        <div className="tf">
          <input id="e-save" value={name} placeholder="Name it" onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onSave(name); setName('') } }} />
          <button className="btn btn-ghost btn-sm" disabled={!name.trim()} onClick={() => { onSave(name); setName('') }}>
            Save
          </button>
        </div>
        <span className="hint">Kept in this browser only.</span>
      </div>
    </>
  )
}
