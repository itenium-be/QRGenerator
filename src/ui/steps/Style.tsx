import { PRESETS } from '../../state/design'
import { renderSvg } from '../../qr/render'
import type { DotStyle, EyeDot, EyeFrame, QrDesign } from '../../qr/types'

type Props = {
  design: QrDesign
  onSet: (patch: Partial<QrDesign>) => void
  onPreset: (index: number) => void
}

const DOTS: DotStyle[] = ['square', 'rounded', 'extra-rounded', 'dots', 'classy']
const FRAMES: EyeFrame[] = ['square', 'rounded', 'extra-rounded', 'dot']
const EYE_DOTS: EyeDot[] = ['square', 'rounded', 'dot']
const NAME: Record<string, string> = {
  square: 'Square', rounded: 'Rounded', 'extra-rounded': 'Soft', dots: 'Dots', classy: 'Classy', dot: 'Circle',
}

export default function Style({ design, onSet, onPreset }: Props) {
  const matches = (p: (typeof PRESETS)[number]) =>
    p.dot === design.dot && p.eyeFrame === design.eyeFrame && p.eyeDot === design.eyeDot &&
    p.fg === design.fg && p.fg2 === design.fg2 && p.bg === design.bg

  return (
    <>
      <div>
        <h2>Make it yours.</h2>
      </div>

      <div className="field">
        <label>Presets</label>
        <div className="presets">
          {PRESETS.map((p, i) => (
            <button key={p.name} className="preset" aria-pressed={matches(p)} onClick={() => onPreset(i)}>
              <span
                dangerouslySetInnerHTML={{
                  __html: renderSvg({ ...design, ...p, margin: 1, mark: { type: 'none' }, kind: 'url' }),
                }}
              />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="two">
        <div className="field">
          <label htmlFor="c-fg">Modules</label>
          <div className="tf">
            <input id="c-fg" type="color" value={design.fg} onChange={e => onSet({ fg: e.target.value })} />
            <input value={design.fg} onChange={e => onSet({ fg: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="c-bg">Background</label>
          <div className="tf">
            <input id="c-bg" type="color" value={design.bg} onChange={e => onSet({ bg: e.target.value })} />
            <input value={design.bg} onChange={e => onSet({ bg: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="field">
        <label>Module shape</label>
        <div className="chipset">
          {DOTS.map(dot => (
            <button key={dot} className="chip" aria-pressed={design.dot === dot} onClick={() => onSet({ dot })}>
              {NAME[dot]}
            </button>
          ))}
        </div>
      </div>

      <div className="two">
        <div className="field">
          <label>Eye frame</label>
          <div className="chipset">
            {FRAMES.map(eyeFrame => (
              <button key={eyeFrame} className="chip" aria-pressed={design.eyeFrame === eyeFrame} onClick={() => onSet({ eyeFrame })}>
                {NAME[eyeFrame]}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Eye centre</label>
          <div className="chipset">
            {EYE_DOTS.map(eyeDot => (
              <button key={eyeDot} className="chip" aria-pressed={design.eyeDot === eyeDot} onClick={() => onSet({ eyeDot })}>
                {NAME[eyeDot]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <details>
        <summary className="eyebrow" style={{ cursor: 'pointer' }}>More: gradient, eye colour, quiet zone</summary>
        <div className="two" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="c-fg2">Second colour</label>
            <div className="tf">
              <input id="c-fg2" type="color" value={design.fg2 ?? design.fg} onChange={e => onSet({ fg2: e.target.value })} />
              <input value={design.fg2 ?? ''} placeholder="no gradient" onChange={e => onSet({ fg2: e.target.value || null })} />
              {design.fg2 && (
                <button className="btn btn-ghost btn-sm" onClick={() => onSet({ fg2: null })}>Clear</button>
              )}
            </div>
          </div>
          <div className="field">
            <label htmlFor="c-eye">Eye colour</label>
            <div className="tf">
              <input id="c-eye" type="color" value={design.eye ?? design.fg} onChange={e => onSet({ eye: e.target.value })} />
              <input value={design.eye ?? ''} placeholder="inherits modules" onChange={e => onSet({ eye: e.target.value || null })} />
              {design.eye && (
                <button className="btn btn-ghost btn-sm" onClick={() => onSet({ eye: null })}>Clear</button>
              )}
            </div>
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="c-margin">Quiet zone · {design.margin} modules</label>
          <input
            id="c-margin"
            className="range"
            type="range"
            min={0}
            max={8}
            step={1}
            value={design.margin}
            onChange={e => onSet({ margin: Number(e.target.value) })}
          />
        </div>
      </details>
    </>
  )
}
