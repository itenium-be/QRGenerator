import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { loadBody, type IconEntry } from '../icons'
import { browserDecoder } from '../qr/decode.browser'
import { fitMarkSize } from '../qr/fit'
import { canvasRasterizer } from '../qr/raster.browser'
import type { Mark, QrDesign } from '../qr/types'
import { initialDesign, reduce } from '../state/design'
import { fromHash, toHash } from '../state/hash'
import * as store from '../state/saved'
import { applyTheme, initTheme, type Theme } from '../state/theme'
import { GithubGlyph, IteniumLogo, MoonGlyph, SunGlyph, Wordmark } from './glyphs'
import { useDebounced, useIconIndex, useMark, useRender, useScanCheck } from './hooks'
import Preview from './Preview'
import Saved from './Saved'
import Content from './steps/Content'
import Export from './steps/Export'
import MarkStep from './steps/MarkStep'
import Style from './steps/Style'

const REPO = 'https://github.com/itenium-be/QRGenerator'

const STEPS = [
  { n: 1, title: 'Content', hint: (d: QrDesign) => d.kind },
  { n: 2, title: 'Style', hint: (d: QrDesign) => `${d.dot} · ${d.fg}` },
  { n: 3, title: 'Centre mark', hint: (d: QrDesign) => (d.mark.type === 'icon' ? d.mark.slug : d.mark.type) },
  { n: 4, title: 'Export', hint: (d: QrDesign) => d.format.toUpperCase() },
]

export default function App() {
  const [design, dispatch] = useReducer(reduce, undefined, () => fromHash(location.hash) ?? initialDesign())
  const [step, setStep] = useState(1)
  const [theme, setTheme] = useState<Theme>('light')
  const [saved, setSaved] = useState<store.SavedDesign[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [bodies, setBodies] = useState<Map<string, string>>(new Map())
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setTheme(initTheme())
    setSaved(store.list())
  }, [])

  const index = useIconIndex()
  const { markBody, brandHex } = useMark(design, index)
  const { svg, problem, payload } = useRender(design, markBody, brandHex)
  const scan = useScanCheck(svg, payload)

  /* The hash is the share link, so it trails the design rather than driving it. */
  const hash = useDebounced(toHash(design), 300)
  useEffect(() => {
    history.replaceState(null, '', `#${hash}`)
  }, [hash])

  const shareUrl = `${location.origin}${location.pathname}#${hash}`

  const onSet = useCallback((patch: Partial<QrDesign>) => dispatch({ type: 'set', patch }), [])
  const onMark = useCallback((mark: Mark) => dispatch({ type: 'mark', mark }), [])

  const needBodies = useCallback(
    (entries: IconEntry[]) => {
      const missing = entries.filter(e => !bodies.has(`${e.k}${e.s}`))
      if (missing.length === 0) return
      Promise.all(missing.map(async e => [`${e.k}${e.s}`, (await loadBody(e)) ?? ''] as const)).then(pairs => {
        setBodies(prev => {
          const next = new Map(prev)
          for (const [key, body] of pairs) next.set(key, body)
          return next
        })
      })
    },
    [bodies],
  )

  async function shrinkMark() {
    const fitted = await fitMarkSize(design, { markBody, brandHex }, canvasRasterizer, browserDecoder)
    if (fitted === null) setNotice('Even the smallest mark breaks this code. Shorten the payload instead.')
    else onSet({ markSize: fitted })
  }

  function saveDesign(name: string) {
    const { uploadDropped } = store.save(name, design)
    setSaved(store.list())
    setShowSaved(true)
    if (uploadDropped) setNotice('Saved without the uploaded image — it was too large to keep in this browser.')
  }

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  const accent = useMemo(() => design.fg, [design.fg])
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent)
  }, [accent])

  return (
    <div className="shell">
      <header className="appbar">
        <div className="wordmark">
          <Wordmark />
          <h1>QR Generator</h1>
          <span>by itenium</span>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" aria-expanded={showSaved} onClick={() => setShowSaved(v => !v)}>
          Saved{saved.length ? ` · ${saved.length}` : ''}
        </button>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          {theme === 'dark' ? <SunGlyph /> : <MoonGlyph />}
        </button>
      </header>

      {notice && (
        <p className="note note-warn" style={{ margin: '12px 24px 0' }}>
          <span aria-hidden="true">▲</span>
          <span>{notice}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setNotice(null)}>Dismiss</button>
        </p>
      )}

      <div className="work">
        <nav className="rail" aria-label="Steps">
          {STEPS.map(s => (
            <button key={s.n} className="step" aria-current={step === s.n ? 'step' : undefined}
              data-done={s.n < step ? '' : undefined} onClick={() => setStep(s.n)}>
              <span className="n">{s.n}</span>
              <span className="t">
                {s.title}
                <small>{s.hint(design)}</small>
              </span>
            </button>
          ))}
          <hr />
          <div style={{ padding: '0 20px' }}>
            <span className="eyebrow">Saved designs</span>
            <div style={{ marginTop: 10 }}>
              {showSaved ? (
                <Saved
                  items={saved}
                  onLoad={d => { dispatch({ type: 'load', design: d }); setShowSaved(false) }}
                  onRemove={id => { store.remove(id); setSaved(store.list()) }}
                />
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSaved(true)}>
                  Show {saved.length || 'none'}
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="pane">
          {step === 1 && (
            <Content design={design} onKind={kind => dispatch({ type: 'kind', kind })}
              onField={(name, value) => dispatch({ type: 'field', name, value })} />
          )}
          {step === 2 && <Style design={design} onSet={onSet} onPreset={i => dispatch({ type: 'preset', index: i })} />}
          {step === 3 && (
            <MarkStep design={design} index={index} bodies={bodies} onMark={onMark} onSet={onSet} onNeedBodies={needBodies} />
          )}
          {step === 4 && (
            <Export design={design} svg={svg} scan={scan} shareUrl={shareUrl} onSet={onSet} onSave={saveDesign} />
          )}

          <div className="navrow">
            {step > 1 ? (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← {STEPS[step - 2].title}</button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button className="btn btn-primary" disabled={step === 1 && Boolean(problem)} onClick={() => setStep(step + 1)}>
                {STEPS[step].title} →
              </button>
            ) : (
              <span />
            )}
          </div>
        </main>

        <aside className="aside">
          <div className="sticky">
            <Preview design={design} svg={svg} problem={problem} payload={payload} scan={scan} onShrink={shrinkMark} />
            <dl className="sum">
              <dt>kind</dt><dd>{design.kind}</dd>
              <dt>payload</dt><dd title={payload}>{payload || '—'}</dd>
              <dt>bytes</dt><dd>{new TextEncoder().encode(payload).length}</dd>
              <dt>ecc</dt><dd>{design.ecc}</dd>
              <dt>mark</dt><dd>{design.mark.type === 'icon' ? design.mark.slug : design.mark.type}</dd>
            </dl>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <a href="https://itenium.be" target="_blank" rel="noreferrer noopener">
          <span>offered by</span>
          <IteniumLogo />
        </a>
        <span style={{ flex: 1 }} />
        <a href={REPO} target="_blank" rel="noreferrer noopener" aria-label="Source on GitHub">
          <GithubGlyph />
          <span>Source</span>
        </a>
      </footer>
    </div>
  )
}
