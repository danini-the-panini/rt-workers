export default class Interval {
  constructor(public min = Infinity, public max = -Infinity) {}

  static fromIntervals(a: Interval, b: Interval) {
    return new Interval(Math.min(a.min, b.min), Math.max(a.max, b.max))
  }

  get size() {
    return this.max - this.min
  }

  contains(x: number) {
    return this.min <= x && x <= this.max
  }

  surrounds(x: number) {
    return this.min < x && x < this.max
  }

  clamp(x: number) {
    if (x < this.min) return this.min
    if (x > this.max) return this.max
    return x
  }

  expand(delta: number) {
    const padding = delta / 2
    return new Interval(this.min - padding, this.max + padding)
  }

  static empty = new Interval()
  static universe = new Interval(-Infinity, Infinity)
}