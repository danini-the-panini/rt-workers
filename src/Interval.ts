export default class Interval {
  constructor(public min = Infinity, public max = -Infinity) {}

  contains(x: number) {
    return this.min <= x && x <= this.max
  }

  surrounds(x: number) {
    return this.min < x && x < this.max
  }

  static empty = new Interval()
  static universe = new Interval(-Infinity, Infinity)
}