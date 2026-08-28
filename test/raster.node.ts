import { Resvg } from '@resvg/resvg-js'
import type { Rasterizer } from '../src/qr/verify'

export const resvgRasterizer: Rasterizer = async (svg, px) => {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: px }, background: 'white' })
  return r.render().asPng()
}
