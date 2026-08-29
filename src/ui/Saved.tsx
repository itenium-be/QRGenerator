import { renderSvg } from '../qr/render'
import type { QrDesign } from '../qr/types'
import type { SavedDesign } from '../state/saved'

type Props = {
  items: SavedDesign[]
  onLoad: (design: QrDesign) => void
  onRemove: (id: string) => void
  onClose: () => void
}

export default function Saved({ items, onLoad, onRemove, onClose }: Props) {
  return (
    <>
      <div>
        <h2>Saved designs.</h2>
      </div>

      {items.length === 0 ? (
        <p className="hint">Nothing saved yet. The export step has the button.</p>
      ) : (
        <div className="saved-grid">
          {items.map(item => (
            <div key={item.id} className="saved-card">
              <button className="saved-open" onClick={() => onLoad(item.design)} title={`Open ${item.name}`}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: renderSvg({ ...item.design, margin: 2, mark: { type: 'none' } }),
                  }}
                />
                <span className="meta">
                  <b>{item.name}</b>
                  <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                </span>
              </button>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                title={`Delete ${item.name}`}
                onClick={() => onRemove(item.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="navrow">
        <button className="btn btn-ghost" onClick={onClose}>← Back to the wizard</button>
        <span />
      </div>
    </>
  )
}
