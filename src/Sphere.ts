import IHittable, { HitRecord } from "./IHittable";
import IMaterial from "./IMaterial";
import Interval from "./Interval";
import Ray from "./Ray";
import Vec3 from "./Vec3";
import { deserializeMaterial } from "./deserialize";

type MovingSphereOptions = {
  center1: Vec3,
  center2: Vec3,
  radius: number,
  material: IMaterial
}

type StationarySphereOptions = {
  center: Vec3,
  radius: number,
  material: IMaterial
}

type SphereOptions = MovingSphereOptions | StationarySphereOptions

export default class Sphere implements IHittable {
  center1: Vec3
  radius: number
  material: IMaterial
  centerVec: Vec3 = new Vec3()
  isMoving: boolean = false

  constructor(options: SphereOptions) {
    if ('center' in options) {
      this.center1 = options.center
    } else {
      this.center1 = options.center1
      this.centerVec = options.center2.sub(options.center1)
      this.isMoving = true
    }
    this.radius = options.radius
    this.material = options.material
  }

  hit(r: Ray, rayT: Interval): HitRecord | null {
    const center = this.isMoving ? this.center(r.time) : this.center1
    const oc = r.origin.minus(center)
    const a = r.direction.lengthSquared
    const halfB = oc.dot(r.direction)
    const c = oc.lengthSquared - this.radius*this.radius

    const discriminant = halfB*halfB - a*c
    if (discriminant < 0) return null
    const sqrtd = Math.sqrt(discriminant)

    // Find the nearest root that lies in the acceptable range
    let root = (-halfB - sqrtd) / a
    if (!rayT.surrounds(root)) {
      root = (-halfB + sqrtd) / a
      if (!rayT.surrounds(root)) return null
    }

    const p = r.at(root)

    return new HitRecord(p, root, this.material, r, p.minus(center).shrink(this.radius))
  }

  center(time: number) {
    // Linearly interpolate from center1 to center2 according to time, where t=0 yields
    // center1, and t=1 yields center2.

    return this.center1.plus(this.centerVec.times(time))
  }

  get serialize() {
    return {
      type: 'sphere' as const,
      center1: this.center1.serialize,
      centerVec: this.centerVec.serialize,
      radius: this.radius,
      material: this.material.serialize,
      isMoving: this.isMoving
    }
  }

  static deserialize({ center1, centerVec, radius, material, isMoving }: typeof Sphere.prototype.serialize) {
    if (isMoving) {
      let center = Vec3.deserialize(center1)
      let center2 = center.plus(Vec3.deserialize(centerVec))
      return new Sphere({ center1: center, center2, radius, material: deserializeMaterial(material) })
    }
    return new Sphere({ center: Vec3.deserialize(center1), radius, material: deserializeMaterial(material) })
  }
}