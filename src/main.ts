import './style.css'
import RTWorker from './RTWorker?worker'
import Deferred from './Deferred'
import WorkerHelper from './WorkerHelper'
import Camera from './Camera'
import Vec3 from './Vec3'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const progress = document.getElementById('progress') as HTMLProgressElement

const width = canvas.width
const height = canvas.height

const camera = new Camera(1.0, 2.0, width, height, new Vec3(0, 0, 0))

const imageByteSize = width * height * 4

progress.max = height

const buffer = new SharedArrayBuffer(imageByteSize)

const cpus = navigator.hardwareConcurrency

const workers = new Array<WorkerHelper>(cpus)

for (let i = 0; i < cpus; i++) {
  workers[i] = new WorkerHelper(new RTWorker())
}

await Promise.all(workers.map(async w => {
  await w.postMessage('start', camera.serialize, buffer)
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