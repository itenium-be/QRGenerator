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

/* What people actually put in the middle of a QR code, in the order they'd look for it.
   LinkedIn is missing because Simple Icons dropped it over a trademark request. */
const SUGGESTED: [string, IconEntry['k']][] = [
  ['itenium', 'b'], ['wifi', 'g'], ['phone', 'g'], ['mail', 'g'], ['message-circle', 'g'],
  ['user', 'g'], ['map-pin', 'g'], ['globe', 'g'], ['link', 'g'], ['calendar', 'g'],
  ['whatsapp', 'b'], ['instagram', 'b'], ['facebook', 'b'], ['youtube', 'b'], ['x', 'b'],
  ['tiktok', 'b'], ['github', 'b'], ['spotify', 'b'], ['telegram', 'b'], ['discord', 'b'],
  ['snapchat', 'b'], ['pinterest', 'b'], ['threads', 'b'], ['twitch', 'b'],
  ['googlemaps', 'b'], ['googleplay', 'b'], ['appstore', 'b'], ['paypal', 'b'],
  ['tripadvisor', 'b'], ['airbnb', 'b'],
  ['utensils', 'g'], ['coffee', 'g'], ['wine', 'g'], ['store', 'g'], ['shopping-cart', 'g'],
  ['credit-card', 'g'], ['ticket', 'g'], ['music', 'g'], ['camera', 'g'], ['video', 'g'],
  ['image', 'g'], ['gift', 'g'], ['heart', 'g'], ['star', 'g'], ['house', 'g'],
  ['car', 'g'], ['book-open', 'g'], ['briefcase', 'g'],
]

let byKey: Map<string, IconEntry> | null = null
const lookup = (entries: IconEntry[]) => {
  byKey ??= new Map(entries.map(e => [`${e.k}${e.s}`, e]))
  return byKey
}

export function search(entries: IconEntry[], query: string, limit = 48): IconEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    const found = lookup(entries)
    return SUGGESTED.map(([s, k]) => found.get(`${k}${s}`)).filter((e): e is IconEntry => Boolean(e)).slice(0, limit)
  }

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
