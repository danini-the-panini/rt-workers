export default class Interval {
  constructor(public min = Infinity, public max = -Infinity) {}

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

  static empty = new Interval()
  static universe = new Interval(-Infinity, Infinity)
}