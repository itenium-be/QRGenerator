import { contrastRatio } from '../qr/contrast'
import { matrix } from '../qr/render'
import type { QrDesign } from '../qr/types'
import type { ScanState } from './hooks'

type Props = {
  design: QrDesign
  svg: string | null
  problem: string | null
  payload: string
  scan: ScanState
  onShrink?: () => void
}

const SCAN_LABEL: Record<ScanState, string> = {
  checking: 'checking…',
  ok: 'scans clean',
  unreadable: "doesn't scan",
  unknown: '',
}

export default function Preview({ design, svg, problem, payload, scan, onShrink }: Props) {
  const size = svg ? matrix(payload, design.ecc).size : 0
  const ratio = contrastRatio(design.fg, design.bg)

  return (
    <>
      <div className="stage">
        {svg ? (
          <>
            <span className="badge">
              {size}×{size}
              {SCAN_LABEL[scan] && ` · ${SCAN_LABEL[scan]}`}
            </span>
            {/* A white plate keeps a light-coloured code honest in dark mode. */}
            <div className={design.transparent ? 'plate alpha' : 'plate'} dangerouslySetInnerHTML={{ __html: svg }} />
          </>
        ) : (
          <p className="empty">{problem}</p>
        )}
      </div>

      {svg && design.transparent && (
        <p className="note note-warn">
          <span aria-hidden="true">▲</span>
          <span>
            No background, so whatever you place this on becomes the background. Cameras want at least <b>3:1</b>{' '}
            against it, and a light one — most scanners expect dark modules on light.
          </span>
        </p>
      )}

      {svg && !design.transparent && ratio < 3 && (
        <p className="note note-warn">
          <span aria-hidden="true">▲</span>
          <span>
            Contrast is <b>{ratio.toFixed(1)}:1</b>. Cameras want at least 3:1 — darken the modules or lighten the
            background.
          </span>
        </p>
      )}

      {scan === 'unreadable' && (
        <p className="note note-warn">
          <span aria-hidden="true">▲</span>
          <span>
            This doesn't decode. {design.mark.type !== 'none' && 'The centre mark is covering too much. '}
            {onShrink && design.mark.type !== 'none' && (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={onShrink}>
                Shrink the mark to fit
              </button>
            )}
          </span>
        </p>
      )}
    </>
  )
}
