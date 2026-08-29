# Ideas

What this app could become. Everything above the [backend](#if-there-were-a-backend) line runs
in the browser on GitHub Pages — no server, no account, no tracking.

Effort is rough: **S** = an afternoon, **M** = a few days, **L** = a project of its own.

## Where it stands today

| Area        | Today                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Payloads    | 24 kinds — 10 everyday, 14 behind an *Other* disclosure (payments, GS1, TOTP, app links, …)                                                     |
| Style       | 6 module shapes (including fluid, merging neighbours), 4 eye frames, 3 eye centres, linear gradient, separate eye colour, quiet zone, 5 presets |
| Mark        | 5,492 icons (Simple Icons + Lucide), SVG/PNG upload, brand-hex tint, clearance, auto-fit                                                        |
| Verify      | Every preview rasterized and decoded with zxing-wasm; contrast ratio warning                                                                    |
| Export      | SVG, PNG, JPG, WebP, transparent background; copy image; copy share link                                                                        |
| Persistence | Design in the URL hash, saved designs in localStorage                                                                                           |

---

## 1. Payload types

All 24 are in, specs under `src/payloads/`. What is left from this section:

| Idea                | Detail                                                                | Effort |
| ------------------- | --------------------------------------------------------------------- | ------ |
| Payload templates   | Pre-filled examples per type — "try a sample" instead of a blank form | S      |
| Raw / advanced mode | Textarea with a byte counter and the chosen encoding mode shown       | S      |

## 2. Other symbologies

`zxing-wasm` is already a dependency and its `writeBarcode` can emit far more than QR. This is the
highest value-per-line item in the whole list.

| Idea                                | Detail                                                                     | Effort |
| ----------------------------------- | -------------------------------------------------------------------------- | ------ |
| Micro QR / rMQR                     | Tiny and rectangular codes for narrow labels and cable tags                | M      |
| Data Matrix, Aztec, PDF417          | Logistics, tickets, driver's licences                                      | M      |
| EAN-13, UPC-A, Code128, Code39, ITF | Retail and warehouse barcodes — same styling engine, same verify loop      | M      |
| Structured Append                   | Split one long payload across several linked QR codes                      | L      |
| Version / mask pinning              | Force a symbol version or mask pattern instead of letting the encoder pick | M      |

## 3. Styling

| Idea                            | Detail                                                                        | Effort |
| ------------------------------- | ----------------------------------------------------------------------------- | ------ |
| Frame with call-to-action       | "SCAN ME" plate around the code, a few frame shapes, custom label and colour  | M      |
| Radial and angled gradients     | Today: linear at a fixed 45°. Add angle, radial, and a 3+ stop editor         | S      |
| Gradient on eyes and background | Separate gradient targets, as `qr-code-styling` has                           | S      |
| Per-corner eye styling          | Each of the three finders its own shape and colour                            | S      |
| More module shapes              | Diamond, star, cross, vertical and horizontal bars                            | M      |
| Background image                | Photo behind the code with an opacity/scrim control, verified as always       | M      |
| Halftone / artistic QR          | Image mapped onto module density; each module a small tile                    | L      |
| Custom module image             | Tile a logo or emoji as the module glyph                                      | M      |
| Rounded outer container         | Corner radius + drop shadow + border on the exported canvas                   | S      |
| Colour extraction from logo     | Upload a logo, offer its dominant colours as the palette                      | M      |
| Palette suggestions             | Given `fg`, propose backgrounds that clear 3:1 and look intentional           | S      |
| Preset library                  | Many more than 5, grouped (corporate, playful, print, mono), each thumbnailed | S      |
| Invert / dark-mode variant      | Export a light-on-dark twin in one click                                      | S      |
| Mark shapes                     | Circle/rounded/square plate behind the mark, mark offset, mark rotation       | S      |

## 4. Scannability — the differentiator

Verifying with a real decoder is already this app's best idea. Push it further; nobody else does.

| Idea                          | Detail                                                                                                                       | Effort |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| Robustness grading            | Re-decode under blur, rotation, perspective, noise, low light. Report "scans through 40% blur" instead of a pass/fail badge  | M      |
| Multi-decoder agreement       | Verify with zxing **and** the browser's `BarcodeDetector` **and** jsQR — cross-scanner confidence, not one library's opinion | M      |
| Print size calculator         | Scan distance → minimum print size (the 10:1 rule), module size in mm, DPI check for the chosen pixel size                   | S      |
| Damage simulation             | Cover a corner, fold, scratch — show how much the current ECC really buys                                                    | M      |
| Move verification to a worker | `fitMarkSize` binary-searches ~10 rasterize+decode rounds on the main thread. A worker keeps typing smooth                   | M      |
| Auto-fix suggestions          | "Raise ECC to Q", "shorten this URL by 12 chars to drop a version", "darken fg to #1a3ad0" — one-click each                  | M      |
| Payload length budget         | Live "you have 41 characters before the code jumps a version"                                                                | S      |
| Quiet-zone lint               | Warn below 4 modules, explain why a scanner then misses it                                                                   | S      |
| CMYK / print warning          | Flag colours that shift badly in CMYK, or pure-black-on-white advice for offset print                                        | S      |

## 5. Decoding (read, not just write)

The decoder is already bundled. A "Scan" tab is nearly free and doubles the app's usefulness.

| Idea                            | Detail                                                                                      | Effort |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ------ |
| Decode from camera              | `getUserMedia` + zxing, live                                                                | M      |
| Decode from file / paste / drop | Drop a PNG, get the payload                                                                 | S      |
| Round-trip                      | Decode a code, parse the payload back into a design, edit and re-export it                  | M      |
| Payload inspector               | Pretty-print what a decoded vCard/Wi-Fi/EPC payload actually contains, flag suspicious URLs | S      |
| Safety check                    | Warn on IDN homographs, punycode, shortener chains, `javascript:` payloads                  | M      |

## 6. Batch and workflow

| Idea                          | Detail                                                                               | Effort |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------ |
| CSV bulk generation           | Upload a CSV, one QR per row, one shared design, ZIP download — entirely client-side | M      |
| Template variables            | `https://x.be/{{slug}}` filled per row                                               | S      |
| Print sheet export            | Avery label grids, cut marks, N-up PDF — the thing people actually want for events   | M      |
| PDF export                    | Real vector PDF, sized in mm, ready for a printer                                    | M      |
| EPS export                    | Still requested by print shops                                                       | M      |
| Undo / redo                   | The design reducer is already a clean action log — cheap to make time-travel         | S      |
| Keyboard shortcuts            | Step navigation, download, copy                                                      | S      |
| Import / export saved designs | JSON file in and out; today a localStorage wipe loses everything                     | S      |
| IndexedDB for uploads         | The 100 KB localStorage cap silently drops uploaded logos on save                    | S      |
| Shorter share links           | Compress the hash (LZ + base64url); the URL is unwieldy for a vCard                  | S      |
| Design diff / compare         | Two variants side by side, both verified                                             | M      |
| Named brand kit               | Lock colours + logo + shapes, then only the payload changes per code                 | S      |

## 7. Platform and polish

| Idea                 | Detail                                                                                                    | Effort |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| PWA / offline        | Service worker, installable, works on a stand at a conference with no Wi-Fi                               | M      |
| Web Share Target     | Share a URL from the phone straight into the generator                                                    | S      |
| Web Share API        | "Share" the PNG to WhatsApp/Slack from mobile                                                             | S      |
| Print stylesheet     | Ctrl+P gives a clean sheet, not the app chrome                                                            | S      |
| i18n                 | NL / FR / EN — itenium is Belgian, the audience is trilingual                                             | M      |
| Accessibility pass   | Alt text on the preview, live-region for the scan verdict, focus management between steps, reduced motion | M      |
| Deep link to a step  | `#…&step=3` so a shared link opens where you left it                                                      | S      |
| Onboarding           | A 20-second tour, or a "surprise me" random design                                                        | S      |
| Analytics-free badge | Say it out loud: nothing leaves the browser. It is a real differentiator                                  | S      |

## 8. Ship it as a library

| Idea              | Detail                                                                       | Effort |
| ----------------- | ---------------------------------------------------------------------------- | ------ |
| npm package       | `@itenium/qr` — the renderer and verifier, framework-free                    | M      |
| React component   | `<QrDesign design={…} />`                                                    | S      |
| Web Component     | `<itenium-qr payload="…">` for non-React sites                               | M      |
| CLI               | `bunx @itenium/qr --wifi … -o qr.svg`, using resvg (already a devDependency) | M      |
| GitHub Action     | Generate codes in CI from a CSV in a repo                                    | S      |
| Embeddable iframe | A widget other itenium sites drop in                                         | S      |

## 9. Engineering

| Idea                      | Detail                                                                                  | Effort |
| ------------------------- | --------------------------------------------------------------------------------------- | ------ |
| Visual regression tests   | Snapshot the SVG per preset; catch silent render drift                                  | S      |
| Fuzz the payload encoders | Unicode, emoji, semicolons, quotes, RTL — Wi-Fi and vCard escaping is where these break | S      |
| Decode matrix in CI       | Every preset × every shape × several payload lengths, all decoded                       | M      |
| Bundle budget             | The icon index is 5,492 entries — track what the first paint actually costs             | S      |
| Lighthouse in CI          | Perf and a11y as a gate                                                                 | S      |

---

## If there were a backend

Everything above is possible without one. These are not — they need state that outlives the tab
and a URL the app controls.

### Dynamic codes — the whole category

A dynamic code encodes a short link the app owns and can re-point later. Every feature below
follows from that one capability.

| Idea                   | Detail                                                                    |
| ---------------------- | ------------------------------------------------------------------------- |
| Editable destination   | Reprint nothing. The poster stays, the URL changes                        |
| Scan analytics         | Count, timestamp, coarse geo, device, OS, referrer; charts and CSV export |
| Custom short domain    | `qr.itenium.be/x7f` instead of a third party's brand on your poster       |
| Expiry and scheduling  | Live from Monday, dead after the event                                    |
| Geo and device routing | iOS→App Store, Android→Play, desktop→website; NL visitors→NL page         |
| A/B destinations       | Split traffic, measure which landing page wins                            |
| Password / access gate | Confidential documents behind a code                                      |
| Scan-limit codes       | One-time tickets, N-use vouchers                                          |
| Retargeting pixels     | Meta/Google/TikTok tags fired in the redirect hop                         |
| Scan notifications     | Email, webhook, or Slack on scan or on a traffic spike                    |

### Accounts and collaboration

| Idea              | Detail                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Real accounts     | Designs and codes follow you across devices; no more localStorage-only |
| Teams and roles   | Shared workspace, viewer/editor/admin, audit log                       |
| Shared brand kits | One locked corporate style everyone in the org generates against       |
| Asset library     | Logos hosted server-side, no 100 KB cap, reusable across codes         |
| SSO / SAML        | The thing that makes it sellable to an enterprise                      |

### Hosted content

| Idea                 | Detail                                                                              |
| -------------------- | ----------------------------------------------------------------------------------- |
| Landing page builder | vCard page, restaurant menu, event page, link-in-bio — QR points at a page you host |
| File hosting         | PDF menu or brochure behind the code, swappable without reprinting                  |
| Wi-Fi guest page     | Terms + password + a one-tap join, instead of raw `WIFI:`                           |
| Lead capture         | Form behind the code, results to CSV or a CRM                                       |

### API and scale

| Idea                  | Detail                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Image API             | `GET /qr.png?d=<design>` — QR codes inside emails, PDFs, and server-rendered docs             |
| Generation API + keys | Programmatic creation, rate-limited, SDKs                                                     |
| Async bulk jobs       | 50,000 codes, server-side ZIP, webhook when done                                              |
| Server-side rendering | resvg/Chromium for exact raster, true CMYK PDF and EPS                                        |
| Malware screening     | Safe Browsing check on every destination — the abuse vector for any redirector                |
| Abuse controls        | Rate limits, takedown flow, retention and GDPR policy                                         |
| AI artistic QR        | ControlNet-style image-conditioned codes; needs a GPU, verified with the existing decode loop |

### The cheap middle ground

Dynamic codes do not require a real server. Worth prototyping before committing to one:

| Approach                       | What you get                                                         | Cost                           |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------ |
| Redirect map in the repo       | `#/r/<id>` on Pages resolves against a committed JSON; edit = commit | Free, no analytics, public map |
| Cloudflare Worker + KV         | Real redirects, real edit, basic counters                            | Free tier covers a lot         |
| Netlify / Vercel edge function | Same, plus their analytics                                           | Free tier                      |
| Plausible or GoatCounter       | Scan counts without building an analytics stack                      | Cheap, GDPR-friendly           |

---

## If only three things

1. **Barcode formats via `writeBarcode`** — zxing-wasm is already installed; Data Matrix, Aztec, EAN and Code128 are mostly wiring.
2. **A Scan tab** — the decoder is already bundled and verified; reading codes doubles the app's reason to exist.
3. **Robustness grading instead of a pass/fail badge** — nobody else verifies at all, let alone tells you how much margin you have.
