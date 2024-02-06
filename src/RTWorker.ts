import Camera from "./Camera"
import Color from "./Color"
import Ray from "./Ray"
import writeColor from "./writeColor"

let width: number
let height: number
let camera: Camera
let buffer: SharedArrayBuffer

function rayColor(r: Ray) {
  const unitDirection = r.direction.unit
  const a = 0.5*(unitDirection.y + 1.0)
  return new Color(1.0, 1.0, 1.0).scale(1.0-a).add(new Color(0.5, 0.7, 1.0).scale(a))
}

const functions: Record<string, Function> = {
  start(cam: typeof Camera.prototype.serialize, b: SharedArrayBuffer) {
    camera = Camera.deserialize(cam)
    width = camera.imageWidth
    height = camera.imageHeight
    buffer = b
  },

  async render(y: number) {
    const data = new Uint8ClampedArray(buffer, y * width * 4, width * 4)

    for (let x = 0; x < width; x++) {
      const pixelCenter = camera.pixelZero.plus(camera.deltaU.times(x)).add(camera.deltaV.times(y))
      const rayDirection = pixelCenter.minus(camera.center)
      const r = new Ray(camera.center, rayDirection)

      const pixelColor = rayColor(r)
      writeColor(data, width, x, 0, pixelColor)
    }
  }
}

self.onmessage = async function onMessage(event: MessageEvent) {
  const [name, id, ...args]: [keyof typeof functions, string, ...unknown[]] = event.data

  self.postMessage([id, await functions[name](...args)])
}