import { useState } from 'react'
import { PAYLOADS, PAYLOAD_KINDS, type PayloadKind } from '../../payloads'
import type { QrDesign } from '../../qr/types'
import { FIELDS } from '../fields'
import { EyeGlyph, EyeOffGlyph } from '../glyphs'

type Props = {
  design: QrDesign
  onKind: (kind: PayloadKind) => void
  onField: (name: string, value: string | boolean) => void
}

export default function Content({ design, onKind, onField }: Props) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const fields = design.fields[design.kind]
  const defs = FIELDS[design.kind].filter(d => !d.when || d.when(fields))

  return (
    <>
      <div>
        <h2>What should it open?</h2>
      </div>

      <div className="chipset">
        {PAYLOAD_KINDS.map(kind => (
          <button
            key={kind}
            className="chip tint"
            aria-pressed={design.kind === kind}
            onClick={() => onKind(kind)}
          >
            {PAYLOADS[kind].label}
          </button>
        ))}
      </div>

      <div className="two">
        {defs.map(def => (
          <div key={def.name} className="field" style={def.wide ? { gridColumn: '1 / -1' } : undefined}>
            {def.type === 'checkbox' ? (
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(fields[def.name])}
                  onChange={e => onField(def.name, e.target.checked)}
                />
                {def.label}
              </label>
            ) : (
              <>
                <label htmlFor={`f-${def.name}`}>{def.label}</label>
                <div className="tf">
                  {def.type === 'textarea' ? (
                    <textarea
                      id={`f-${def.name}`}
                      value={String(fields[def.name] ?? '')}
                      placeholder={def.placeholder}
                      onChange={e => onField(def.name, e.target.value)}
                    />
                  ) : def.type === 'select' ? (
                    <select
                      id={`f-${def.name}`}
                      value={String(fields[def.name] ?? '')}
                      onChange={e => onField(def.name, e.target.value)}
                    >
                      {def.options?.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        id={`f-${def.name}`}
                        type={def.type === 'password' && !revealed[def.name] ? 'password' : 'text'}
                        value={String(fields[def.name] ?? '')}
                        placeholder={def.placeholder}
                        onFocus={e => e.target.select()}
                        onChange={e => onField(def.name, e.target.value)}
                      />
                      {def.type === 'password' && (
                        <button
                          className="reveal"
                          type="button"
                          aria-label={revealed[def.name] ? 'Hide the password' : 'Show the password'}
                          aria-pressed={Boolean(revealed[def.name])}
                          onClick={() => setRevealed(r => ({ ...r, [def.name]: !r[def.name] }))}
                        >
                          {revealed[def.name] ? <EyeOffGlyph /> : <EyeGlyph />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
