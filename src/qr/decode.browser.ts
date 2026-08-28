import { prepareZXingModule } from 'zxing-wasm/reader'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'
import { zxingDecoder } from './decode.zxing'

/* Without this the reader fetches its wasm from a CDN. Everything here ships
   from the same origin instead. */
prepareZXingModule({ overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) } })

export { zxingDecoder as browserDecoder }
