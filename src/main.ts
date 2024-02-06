import './style.css'
import RTWorker from './RTWorker?worker'
import Deferred from './Deferred'
import WorkerHelper from './WorkerHelper'
import Camera from './Camera'
import Vec3 from './Vec3'
import HittableList from './HittableList'
import Sphere from './Sphere'
import Lambertian from './Lambertian'
import Color from './Color'
import Metal from './Metal'
import Dialectric from './Dialectric'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const progress = document.getElementById('progress') as HTMLProgressElement

const width = canvas.width
const height = canvas.height

progress.max = height

const world = new HittableList()

const R = Math.cos(Math.PI/4)

const materialGround = new Lambertian(new Color(0.8, 0.8, 0.0))
const materialCenter = new Lambertian(new Color(0.1, 0.2, 0.5))
const materialLeft = new Dialectric(1.5)
const materialRight = new Metal(new Color(0.8, 0.6, 0.2), 0.0)

world.add(new Sphere(new Vec3( 0.0, -100.5, -1.0), 100.0, materialGround))
world.add(new Sphere(new Vec3( 0.0,    0.0, -1.0),   0.5, materialCenter))
world.add(new Sphere(new Vec3(-1.0,    0.0, -1.0),   0.5, materialLeft))
world.add(new Sphere(new Vec3(-1.0,    0.0, -1.0),  -0.4, materialLeft))
world.add(new Sphere(new Vec3( 1.0,    0.0, -1.0),   0.5, materialRight))

const camera = new Camera(
  width, height,
  new Vec3(-2,2,1), new Vec3(0,0,-1), new Vec3(0,1,0),
  { samplesPerPixel: 100, maxDepth: 50 }
)

const imageByteSize = width * height * 4
const buffer = new SharedArrayBuffer(imageByteSize)

const cpus = navigator.hardwareConcurrency

const workers = new Array<WorkerHelper>(cpus)

for (let i = 0; i < cpus; i++) {
  workers[i] = new WorkerHelper(new RTWorker())
}

await Promise.all(workers.map(async w => {
  await w.postMessage('start', camera.serialize, world.serialize, buffer)
}))

let y = 0
let done = 0
const deferred = new Deferred<void>()

function putImage(y: number) {
  ctx.putImageData(
    new ImageData(
      new Uint8ClampedArray(buffer, y * width * 4, width * 4).slice(),
      width,
      1,
    ),
    0,
    y
  )
}

function runOnWorker(w: WorkerHelper, i: number) {
  if (y < height) {
    const thisY = y
    y++
    w.postMessage('render', thisY).then(() => {
      putImage(thisY)
      done++
      progress.value = done
      if (done < height) {
        runOnWorker(w, i)
      } else {
        deferred.resolve()
      }
    })
  }
}
workers.forEach(runOnWorker)
await deferred.promise