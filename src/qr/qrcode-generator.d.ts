declare module 'qrcode-generator' {
  type QRCode = {
    addData: (data: string, mode?: string) => void
    make: () => void
    getModuleCount: () => number
    isDark: (row: number, col: number) => boolean
  }
  type Factory = {
    (typeNumber: number, errorCorrectionLevel: string): QRCode
    stringToBytes: (s: string) => number[]
  }
  const qrcode: Factory
  export default qrcode
}
