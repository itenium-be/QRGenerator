export type IconEntry = { s: string; t: string; k: 'b' | 'g'; h?: string }

const base = import.meta.env.BASE_URL
let index: Promise<IconEntry[]> | null = null
const shards = new Map<string, Promise<Record<string, string>>>()

export function loadIndex(): Promise<IconEntry[]> {
  index ??= fetch(`${base}icons/index.json`).then(r => r.json())
  return index
}

const shardKey = (slug: string) => (/^[a-z]/.test(slug[0]) ? slug[0] : '_')

export function loadBody(entry: IconEntry): Promise<string | undefined> {
  const name = `${entry.k}-${shardKey(entry.s)}`
  let shard = shards.get(name)
  if (!shard) {
    shard = fetch(`${base}icons/${name}.json`).then(r => r.json())
    shards.set(name, shard)
  }
  return shard.then(map => map[entry.s])
}

export function search(entries: IconEntry[], query: string, limit = 48): IconEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries.filter(e => e.k === 'g').slice(0, limit)

  const scored: { e: IconEntry; score: number }[] = []
  for (const e of entries) {
    const slug = e.s
    const text = e.t.toLowerCase()
    let score = -1
    if (slug === q) score = 0
    else if (slug.startsWith(q)) score = 1
    else if (text.startsWith(q)) score = 2
    else if (slug.includes(q)) score = 3
    else if (text.includes(q)) score = 4
    if (score >= 0) scored.push({ e, score: score * 100 + slug.length })
    if (scored.length > 800) break
  }
  return scored.sort((a, b) => a.score - b.score).slice(0, limit).map(s => s.e)
}
