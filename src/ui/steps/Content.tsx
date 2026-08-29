import { useState } from 'react'
import { COMMON_KINDS, OTHER_KINDS, PAYLOADS, type PayloadKind } from '../../payloads'
import type { QrDesign } from '../../qr/types'
import { FIELDS, type FieldDef } from '../fields'
import { EyeGlyph, EyeOffGlyph } from '../glyphs'

type Props = {
  design: QrDesign
  onKind: (kind: PayloadKind) => void
  onField: (name: string, value: string | boolean) => void
}

const inputType = (def: FieldDef, revealed: boolean) => {
  if (def.type === 'password') return revealed ? 'text' : 'password'
  return def.type === 'date' || def.type === 'datetime-local' ? def.type : 'text'
}

export default function Content({ design, onKind, onField }: Props) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [showOther, setShowOther] = useState(false)
  const fields = design.fields[design.kind]
  const defs = FIELDS[design.kind].filter(d => !d.when || d.when(fields))
  const spec = PAYLOADS[design.kind]
  const otherOpen = showOther || spec.group === 'other'

  const chip = (kind: PayloadKind) => (
    <button key={kind} className="chip tint" aria-pressed={design.kind === kind} onClick={() => onKind(kind)}>
      {PAYLOADS[kind].label}
    </button>
  )

  return (
    <>
      <div>
        <h2>What should it open?</h2>
      </div>

      <div className="chipset">
        {COMMON_KINDS.map(chip)}
        <button className="chip" aria-expanded={otherOpen} onClick={() => setShowOther(v => !v)}>
          Other <span className="count">{OTHER_KINDS.length}</span>
        </button>
      </div>

      {otherOpen && <div className="chipset">{OTHER_KINDS.map(chip)}</div>}

      {spec.hint && <p className="hint">{spec.hint}</p>}

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
                        type={inputType(def, Boolean(revealed[def.name]))}
                        value={String(fields[def.name] ?? '')}
                        placeholder={def.placeholder}
                        /* select() throws on date inputs, which have no text range. */
                        onFocus={e => e.target.type !== 'date' && e.target.type !== 'datetime-local' && e.target.select()}
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
