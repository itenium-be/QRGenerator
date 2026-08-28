/* Generates the icon index and per-letter body shards into public/icons.
   Bodies are 24x24 fragments so the app can drop them straight into an SVG. */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = 'public/icons'
const SI = 'node_modules/simple-icons/icons'
const LU = 'node_modules/lucide-static/icons'

type Entry = { s: string; t: string; k: 'b' | 'g'; h?: string }

const shardKey = (slug: string) => (/^[a-z]/.test(slug[0]) ? slug[0] : '_')

async function brands() {
  const titles: Record<string, { title: string; hex: string }> = {}
  const raw = JSON.parse(await readFile('node_modules/simple-icons/data/simple-icons.json', 'utf8'))
  const list: { title: string; slug?: string; hex: string }[] = Array.isArray(raw) ? raw : raw.icons
  for (const i of list) titles[slugify(i.title, i.slug)] = { title: i.title, hex: i.hex }

  const files = (await readdir(SI)).filter(f => f.endsWith('.svg'))
  const entries: Entry[] = []
  const bodies: Record<string, Record<string, string>> = {}
  for (const f of files) {
    const slug = f.replace(/\.svg$/, '')
    const svg = await readFile(join(SI, f), 'utf8')
    const d = svg.match(/ d="([^"]+)"/)?.[1]
    if (!d) continue
    const meta = titles[slug]
    entries.push({ s: slug, t: meta?.title ?? slug, k: 'b', h: meta?.hex ? '#' + meta.hex : undefined })
    ;(bodies[shardKey(slug)] ??= {})[slug] = `<g fill="currentColor"><path d="${d}"/></g>`
  }
  return { entries, bodies }
}

/* simple-icons' own slugification, enough of it for the names we index. */
function slugify(title: string, given?: string) {
  if (given) return given
  return title.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '')
}

async function generic() {
  let tags: Record<string, string[]> = {}
  try { tags = JSON.parse(await readFile('node_modules/lucide-static/tags.json', 'utf8')) } catch {}
  const files = (await readdir(LU)).filter(f => f.endsWith('.svg'))
  const entries: Entry[] = []
  const bodies: Record<string, Record<string, string>> = {}
  for (const f of files) {
    const slug = f.replace(/\.svg$/, '')
    const svg = await readFile(join(LU, f), 'utf8')
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim()
    if (!inner) continue
    const words = [slug.replace(/-/g, ' '), ...(tags[slug] ?? []).slice(0, 6)].join(' ')
    entries.push({ s: slug, t: words, k: 'g' })
    ;(bodies[shardKey(slug)] ??= {})[slug] =
      `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`
  }
  return { entries, bodies }
}

const b = await brands()
const g = await generic()

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })
await writeFile(join(OUT, 'index.json'), JSON.stringify([...b.entries, ...g.entries]))
for (const [set, shards] of [['b', b.bodies], ['g', g.bodies]] as const)
  for (const [letter, map] of Object.entries(shards))
    await writeFile(join(OUT, `${set}-${letter}.json`), JSON.stringify(map))

console.log(`icons: ${b.entries.length} brands, ${g.entries.length} generic`)
