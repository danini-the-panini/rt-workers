import Camera from "./Camera"
import IHittable from "./IHittable"
import { HittableData, deserializeHittable } from "./deserialize"

let camera: Camera
let world: IHittable
let buffer: SharedArrayBuffer

const functions: Record<string, Function> = {
  start(cam: typeof Camera.prototype.serialize, w: HittableData, b: SharedArrayBuffer) {
    camera = Camera.deserialize(cam)
    world = deserializeHittable(w) as IHittable
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