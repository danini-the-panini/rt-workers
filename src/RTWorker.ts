import Color from "./Color"
import writeColor from "./writeColor"

let width: number
let height: number
let buffer: SharedArrayBuffer

const functions: Record<string, Function> = {
  start(w: number, h: number, b: SharedArrayBuffer) {
    width = w
    height = h
    buffer = b
  },

  async render(y: number) {
    const data = new Uint8ClampedArray(buffer, y * width * 4, width * 4)

    for (let x = 0; x < width; x++) {
      const pixelColor = new Color(x / (width-1), y / (height-1), 0)

      writeColor(data, width, x, 0, pixelColor)
    }
  }
}

self.onmessage = async function onMessage(event: MessageEvent) {
  const [name, id, ...args]: [keyof typeof functions, string, ...unknown[]] = event.data

  self.postMessage([id, await functions[name](...args)])
}