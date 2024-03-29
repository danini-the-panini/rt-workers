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
import Dielectric from './Dielectric'
import { rand } from './util'
import IMaterial from './IMaterial'
import BVHNode from './BVHNode'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const progress = document.getElementById('progress') as HTMLProgressElement

const width = canvas.width
const height = canvas.height

progress.max = height

const baseWorld = new HittableList()

const groundMaterial = new Lambertian(new Color(0.5, 0.5, 0.5))
baseWorld.add(new Sphere({ center: new Vec3(0, -1000, 0), radius: 1000, material: groundMaterial }))

for (let a = -11; a < 11; a++) {
  for (let b = -11; b < 11; b++) {
    const chooseMat = rand()
    const center = new Vec3(a + 0.9*rand(), 0.2, b + 0.9*rand())

    if (center.minus(new Vec3(4, 0.2, 0)).length > 0.9) {
      let sphereMaterial: IMaterial

      if (chooseMat < 0.8) {
        // diffuse
        const albedo = Color.random().timesV(Color.random())
        sphereMaterial = new Lambertian(albedo)
        const center2 = center.plus(new Vec3(0, rand(0, 0.5), 0))
        baseWorld.add(new Sphere({ center1: center, center2, radius: 0.2, material: sphereMaterial }))
      } else if (chooseMat < 0.95) {
        // metal
        const albedo = Color.random(0.5, 1)
        const fuzz = rand(0, 0.5)
        sphereMaterial = new Metal(albedo, fuzz)
        baseWorld.add(new Sphere({ center, radius: 0.2, material: sphereMaterial }))
      } else {
        // glass
        sphereMaterial = new Dielectric(1.5)
        baseWorld.add(new Sphere({ center, radius: 0.2, material: sphereMaterial }))
      }
    }
  }
}

const material1 = new Dielectric(1.5)
baseWorld.add(new Sphere({ center: new Vec3(0, 1, 0), radius: 1.0, material: material1 }))

const material2 = new Lambertian(new Color(0.4, 0.2, 0.1))
baseWorld.add(new Sphere({ center: new Vec3(-4, 1, 0), radius: 1.0, material: material2 }))

const material3 = new Metal(new Color(0.7, 0.6, 0.5), 0.0)
baseWorld.add(new Sphere({ center: new Vec3(4, 1, 0), radius: 1.0, material: material3 }))

const world = new BVHNode(baseWorld.objects)

const camera = new Camera(
  width, height,
  new Vec3(13,2,3), new Vec3(0,0,0), new Vec3(0,1,0),
  {
    vfov: 20,
    samplesPerPixel: 4,
    maxDepth: 50,
    defocusAngle: 0.6,
    focusDist: 10.0
  }
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