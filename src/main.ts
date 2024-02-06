import './style.css'
import RTWorker from './RTWorker?worker'
import Deferred from './Deferred'
import WorkerHelper from './WorkerHelper'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const width = canvas.width
const height = canvas.height
const imageByteSize = width * height * 4

const buffer = new SharedArrayBuffer(imageByteSize)

const cpus = navigator.hardwareConcurrency

const workers = new Array<WorkerHelper>(cpus)

for (let i = 0; i < cpus; i++) {
  workers[i] = new WorkerHelper(new RTWorker())
}

await Promise.all(workers.map(async w => {
  await w.postMessage('start', width, height, buffer)
}))

let y = 0
let done = 0
const deferred = new Deferred<void>()

function runOnWorker(w: WorkerHelper, i: number) {
  if (y < height) {
    const thisY = y
    y++
    w.postMessage('render', thisY).then(() => {
      done++
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

console.log('putting image data')
ctx.putImageData(
  new ImageData(
    new Uint8ClampedArray(buffer, 0, imageByteSize).slice(),
    width,
    height,
  ),
  0,
  0
)