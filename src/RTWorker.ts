let width: number
let height: number
let buffer: SharedArrayBuffer

const functions: Record<string, Function> = {
  start(w: number, h: number, b: SharedArrayBuffer) {
    width = w
    height = h
    buffer = b
  },

  render(y: number) {
    const data = new Uint8ClampedArray(buffer, y * width * 4, width * 4)

    for (let x = 0; x < width; x++) {
      let r = x / (width-1)
      let g = y / (height-1)
      let b = 0

      let ir = (255.999*r)|0
      let ig = (255.999*g)|0
      let ib = (255.999*b)|0

      let idx = x * 4

      data[idx + 0] = ir  // red
      data[idx + 1] = ig  // green
      data[idx + 2] = ib  // blue
      data[idx + 3] = 255 // alpha
    }
  }
}

self.onmessage = async function onMessage(event: MessageEvent) {
  const [name, id, ...args]: [keyof typeof functions, string, ...unknown[]] = event.data

  self.postMessage([id, await functions[name](...args)])
}