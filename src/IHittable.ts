import AABB from "./AABB"
import IMaterial from "./IMaterial"
import Interval from "./Interval"
import Ray from "./Ray"
import Vec3 from "./Vec3"

export class HitRecord {
  normal: Vec3
  frontFace: boolean = false

  constructor(public p: Vec3, public t: number, public mat: IMaterial, r: Ray, outwardNormal: Vec3) {
    // Sets the hit record normal vector.
    // NOTE: the parameter `outwardNormal` is assumed to have unit length.
    this.frontFace = r.direction.dot(outwardNormal) < 0
    this.normal = this.frontFace ? outwardNormal : outwardNormal.neg
  }
}

export default interface IHittable {
  hit(r: Ray, rayT: Interval): HitRecord | null
  boundingBox: AABB
  serialize: any
}