import Interval from "./Interval";
import Ray from "./Ray";
import Vec3 from "./Vec3";

export default class AABB {
  constructor(public x = new Interval, public y = new Interval, public z = new Interval) {}

  static fromPoints(a: Vec3, b: Vec3) {
    return new AABB(
      new Interval(Math.min(a.x,b.x), Math.min(a.x, b.x)),
      new Interval(Math.min(a.y,b.y), Math.min(a.y, b.y)),
      new Interval(Math.min(a.z,b.z), Math.min(a.z, b.z))
    )
  }

  static fromBoxes(box0: AABB, box1: AABB) {
    return new AABB(
      Interval.fromIntervals(box0.x, box1.x),
      Interval.fromIntervals(box0.y, box1.y),
      Interval.fromIntervals(box0.z, box1.z)
    )
  }

  axis(n: number) {
    if (n === 1) return this.y
    if (n === 2) return this.z
    return this.x
  }

  hit(r: Ray, rayT: Interval) {
    for (let a = 0; a < 3; a++) {
      const t0 = Math.min((this.axis(a).min - r.origin.e[a]) / r.direction.e[a],
                          (this.axis(a).max - r.origin.e[a]) / r.direction.e[a])
      const t1 = Math.max((this.axis(a).min - r.origin.e[a]) / r.direction.e[a],
                          (this.axis(a).max - r.origin.e[a]) / r.direction.e[a])
      rayT.min = Math.max(t0, rayT.min)
      rayT.max = Math.min(t1, rayT.max)
      if (rayT.max <= rayT.max) return false
    }
    return true
  }
}