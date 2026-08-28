import type { QrDesign } from '../qr/types'

const KEY = 'qrgen.saved.v1'
/** localStorage is a few megabytes; a bigger upload is dropped rather than silently failing. */
const MAX_UPLOAD_BYTES = 100_000

export type SavedDesign = { id: string; name: string; savedAt: number; design: QrDesign }
export type SaveResult = { saved: SavedDesign; uploadDropped: boolean }

function read(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as SavedDesign[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function write(list: SavedDesign[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* full or blocked: the design stays in the session, just not on disk */
  }
}

export const list = (): SavedDesign[] => read().sort((a, b) => b.savedAt - a.savedAt)

export function save(name: string, design: QrDesign): SaveResult {
  let stored = design
  let uploadDropped = false
  if (design.mark.type === 'upload' && design.mark.dataUrl.length > MAX_UPLOAD_BYTES) {
    stored = { ...design, mark: { type: 'none' } }
    uploadDropped = true
  }
  const saved: SavedDesign = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled',
    savedAt: Date.now(),
    design: stored,
  }
  write([saved, ...read()])
  return { saved, uploadDropped }
}

export function rename(id: string, name: string) {
  write(read().map(s => (s.id === id ? { ...s, name: name.trim() || s.name } : s)))
}

export function remove(id: string) {
  write(read().filter(s => s.id !== id))
}
