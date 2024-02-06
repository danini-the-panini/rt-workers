import Deferred from "./Deferred"

export default class WorkerHelper {
  worker: Worker
  calls: Record<string, Deferred<any>> = {}

  constructor(worker: Worker) {
    this.worker = worker
    this.worker.onmessage = this.onMessage.bind(this)
  }

  postMessage(name: string, ...args: any[]): Promise<any> {
    let id = crypto.randomUUID()

    const deferred = new Deferred()
    this.calls[id] = deferred

    this.worker.postMessage([name, id, ...args])

    return deferred.promise
  }

  onMessage(event: MessageEvent) {
    const [id, result] = event.data

    this.calls[id].resolve(result)
    delete this.calls[id]
  }
}