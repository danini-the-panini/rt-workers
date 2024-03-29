export default class Deferred<T> {
  promise: Promise<T>
  resolve!: (value: T) => void
  reject!: (reason: Error) => void

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}