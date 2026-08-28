import { renderSvg } from '../qr/render'
import type { QrDesign } from '../qr/types'
import type { SavedDesign } from '../state/saved'

type Props = {
  items: SavedDesign[]
  onLoad: (design: QrDesign) => void
  onRemove: (id: string) => void
}

export default function Saved({ items, onLoad, onRemove }: Props) {
  if (items.length === 0) return <p className="hint">Nothing saved yet. Step 4 has the button.</p>

  return (
    <div className="saved">
      {items.map(item => (
        <div key={item.id} className="saved-row">
          <span
            dangerouslySetInnerHTML={{
              __html: renderSvg({ ...item.design, margin: 1, mark: { type: 'none' } }),
            }}
          />
          <span className="meta">
            <b>{item.name}</b>
            <span>{new Date(item.savedAt).toLocaleDateString()}</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => onLoad(item.design)}>Open</button>
          <button className="btn btn-ghost btn-sm btn-icon" title={`Delete ${item.name}`} onClick={() => onRemove(item.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
