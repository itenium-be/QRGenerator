# QR Generator by itenium

A static site that builds a styled QR code from a handful of payload kinds, with an icon or
uploaded image in the middle. No backend, no accounts, no tracking. Published to GitHub Pages
at `itenium-be.github.io/QRGenerator`.

## Flow

Four steps in a left rail, freely jumpable, with the preview docked beside them throughout:

| Step | Contains |
|---|---|
| 1 · Content     | Payload kind, then that kind's own field set                        |
| 2 · Style       | Presets, colours, module and eye shapes, gradient, quiet zone       |
| 3 · Centre mark | Icon search, upload, mark colour, size, clearance                   |
| 4 · Export      | Format, pixel size, file name, download, copy, share link, save     |

Only step 1 gates: Next is disabled until the payload is valid. Steps 2–4 are always reachable.

## Payloads

Each kind is a pure encoder, `fields → string`, with its own validity predicate.

| Kind | Fields | Encoding |
|---|---|---|
| Link    | url                                          | Prefixed with `https://` when no scheme is present; an existing scheme is left alone |
| Text    | text (multiline)                             | Raw                                                                  |
| Wi-Fi   | ssid, security (WPA/WEP/none), password, hidden | `WIFI:T:…;S:…;P:…;H:true;;` — `\ ; , : "` escaped with a backslash |
| Contact | first, last, org, title, tel, email, url     | vCard 3.0, CRLF line endings, `\ ; ,` escaped, newlines as `\n`      |
| Email   | to, subject, body                            | `mailto:` with URL-encoded query                                     |
| SMS     | number, message                              | `SMSTO:<number>:<message>` — the form Android and iOS both accept    |
| Phone   | number                                       | `tel:<number>`                                                       |

Switching kind keeps each kind's fields, so flipping back and forth loses nothing. The preview
renders only a valid payload; an invalid one shows the missing field, not a stale code.

## Design object

One `QrDesign` is the whole app state:

```
kind, fields{per kind}, dot, eyeFrame, eyeDot, fg, fg2|null, bg, eye|null,
markColor: 'inherit'|'brand'|hex, mark: {source:'icon'|'upload'|'none', ref}, markSize, markClearance,
margin, ecc, format, pixelSize, fileName
```

qr-code-styling was the first choice, but it needs a DOM, and decoding is the whole test suite —
so the renderer is a pure matrix-to-SVG function over qrcode-generator instead, which runs
identically in node and the browser.

`markColor: 'brand'` resolves to the icon's official hex and is only offered for brand icons.
A single-colour SVG upload tints; a multi-colour SVG or a raster image does not, and the control
says so instead of doing nothing. The plate behind the mark is always the QR background colour.

## Modules

| Module | Responsibility | Depends on |
|---|---|---|
| `payloads/`       | One encoder + validator per kind. Pure.                       | nothing           |
| `qr/render.ts`    | `QrDesign → SVG string`, over a matrix from qrcode-generator. | qrcode-generator  |
| `qr/verify.ts`    | `SVG → decoded string \| null`. Rasterize, then decode.       | injected          |
| `qr/fit.ts`       | Largest mark size that a decoder actually reads back.         | verify            |
| `state/design.ts` | Reducer over `QrDesign`; the only writer.                     | nothing           |
| `state/hash.ts`   | `QrDesign ⇄ URL hash`, versioned, tolerant of unknown keys.   | design types      |
| `state/saved.ts`  | localStorage CRUD for saved designs.                          | design types      |
| `icons/`          | Build-time index, runtime search, lazy SVG fetch.             | nothing           |
| `ui/steps/*`      | Four step components: read state, dispatch actions.           | state             |
| `ui/Preview.tsx`  | SVG, contrast check, scannability badge.                      | qr, verify        |

## Sharing and persistence

The design serializes to the URL hash, debounced, with short keys and a `v=1` marker; unknown
keys are ignored on read so old links never hard-fail. Uploaded images stay out of the hash —
a link says it dropped the image rather than silently losing it.

Saved designs live in localStorage under one versioned key: an array of `{id, name, savedAt,
design}`. The saved panel lists them with live-rendered thumbnails; selecting one replaces the
current design; delete and rename are inline. An upload is kept with the design when its data
URL is under 100 KB, otherwise the design saves without it and says so.

## Theming

`:root` carries the light palette as CSS custom properties; `[data-theme="dark"]` overrides the
same token names. The toggle writes `data-theme` and remembers it in localStorage, defaulting to
`prefers-color-scheme`. `--accent` stays bound to the chosen module colour in both themes.

QR colours are content, not theme: they never change with the toggle, and the preview keeps a
white plate under a light-coloured code so it can't lie about what exports.

## Visual direction

Monochrome UI whose only chroma is the user's own QR colour, which also tints the active
controls — plus itenium's orange, which belongs to their mark alone. Bricolage Grotesque display,
IBM Plex Sans body, IBM Plex Mono for data. Cool paper ground in light, ink ground in dark. The
steps are numbered because they are an actual sequence.

Footer: itenium's wordmark linking to itenium.be, and a GitHub icon linking to the repo. The app
is named plainly — "QR Generator", "by itenium" — so a stranger knows what the page is.

## The centre mark and error correction

Measured, not assumed: on a short link (29×29) a 0.30 mark fails at every ECC level, 0.20 needs
level H, and level L breaks at any mark size. The same 0.30 mark on a vCard (77×77) reads fine.
Scannability is not even monotonic in size — 0.38 can read where 0.35 does not.

So adding a mark forces ECC H and caps the size at 0.20, and "shrink the mark to fit" binary
searches for a size that decodes and then re-verifies the rounded answer rather than trusting the
search. Codes are judged at roughly 16 pixels per module, so antialiasing isn't what decides.

## Testing

Decoding is the test. A harness builds a design, renders the SVG, rasterizes it with
`@resvg/resvg-js`, decodes it with `zxing-wasm`, and asserts the decoded string equals the
encoded payload. It runs as a table across payload kinds × module styles × eye styles × ECC ×
mark size × quiet zone, plus a non-latin payload that has to come back byte-exact. Share links
get a round-trip test of their own, since a broken one silently loses work.

`verify.ts` also runs in the browser — the same code, a canvas rasterizer instead of resvg — so
the preview badge is a real decode rather than a promise. The reader's wasm ships from the same
origin; nothing is fetched from a CDN at runtime.

## Deploy

GitHub Actions on push to main: bun install, test, build with `base: '/QRGenerator/'`, upload to
Pages.

## Not building

Geo, calendar, crypto and OTP payloads. Batch generation. Dynamic or tracked QR codes. Any
server component.
