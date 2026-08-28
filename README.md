# Quiet Zone

QR codes with a colour scheme and an icon in the middle, in the browser only.

**[itenium-be.github.io/QRGenerator](https://itenium-be.github.io/QRGenerator/)**

| Does | Detail |
|---|---|
| Payloads   | Link, text, Wi-Fi, contact (vCard 3.0), email, SMS, phone |
| Styling    | Module and eye shapes, solid or gradient colour, separate eye colour, quiet zone |
| Centre mark| 5,492 icons (Simple Icons brands + Lucide), or your own SVG/PNG, tintable, brand colours built in |
| Verifying  | Every preview is rasterized and decoded — the badge is a real read, not a promise |
| Export     | SVG, PNG, JPG, WebP |
| Sharing    | The whole design lives in the URL hash; saved designs live in localStorage |

## Commands

| | |
|---|---|
| `bun install`  | install |
| `bun run dev`  | dev server |
| `bun test`     | render, rasterize, decode — the suite that matters |
| `bun run build`| production build into `dist/` |

`bun run icons` regenerates `public/icons` from the npm packages; `dev`, `build` and `test` do it for you.

## How the mark size is decided

Error correction rebuilds what the mark covers, but not linearly: on a short link a 30% mark
fails while the same mark on a vCard reads fine, and scannability is not monotonic in size (a
0.38 mark can read where 0.35 does not). So nothing is assumed — adding a mark forces error
correction to H, and "shrink the mark to fit" searches for a size that a decoder actually reads
back.

offered by [itenium.be](https://itenium.be)
