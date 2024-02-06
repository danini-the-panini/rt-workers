import Camera from "./Camera"
import IHittable, { DeserializeData, deserializeHittable } from "./IHittable"

let width: number
let height: number
let camera: Camera
let world: IHittable
let buffer: SharedArrayBuffer


const functions: Record<string, Function> = {
  start(cam: typeof Camera.prototype.serialize, w: DeserializeData, b: SharedArrayBuffer) {
    camera = Camera.deserialize(cam)
    width = camera.imageWidth
    height = camera.imageHeight
    world = deserializeHittable(w)
    buffer = b
  },

  async render(y: number) {
    camera.render(world, buffer, y)
  }
}

self.onmessage = async function onMessage(event: MessageEvent) {
  const [name, id, ...args]: [keyof typeof functions, string, ...unknown[]] = event.data

  self.postMessage([id, await functions[name](...args)])
}