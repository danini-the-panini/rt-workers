import HittableList from "./HittableList"
import Interval from "./Interval"
import Ray from "./Ray"
import Sphere from "./Sphere"
import Vec3 from "./Vec3"

export class HitRecord {
  normal: Vec3
  frontFace: boolean = false

  constructor(public p: Vec3, public t: number, r: Ray, outwardNormal: Vec3) {
    // Sets the hit record normal vector.
    // NOTE: the parameter `outwardNormal` is assumed to have unit length.
    this.frontFace = r.direction.dot(outwardNormal) < 0
    this.normal = this.frontFace ? outwardNormal : outwardNormal.neg
  }
}

export type DeserializeData = typeof HittableList.prototype.serialize | typeof Sphere.prototype.serialize

export function deserializeHittable(data: DeserializeData): IHittable {
  switch (data.type) {
    case 'list': return HittableList.deserialize(data)
    case 'sphere': return Sphere.deserialize(data)
  }
}

export default interface IHittable {
  hit(r: Ray, rayT: Interval): HitRecord | null
  serialize: any
}