import IHittable, { HitRecord } from "./IHittable";
import IMaterial from "./IMaterial";
import Interval from "./Interval";
import Ray from "./Ray";
import Vec3 from "./Vec3";
import { deserializeMaterial } from "./deserialize";

export default class Sphere implements IHittable {
  constructor(public center: Vec3, public radius: number, public material: IMaterial) {}

  hit(r: Ray, rayT: Interval): HitRecord | null {
    const oc = r.origin.minus(this.center)
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

    return new HitRecord(p, root, this.material, r, p.minus(this.center).shrink(this.radius))
  }

  get serialize() {
    return {
      type: 'sphere' as const,
      center: this.center.serialize,
      radius: this.radius,
      material: this.material.serialize
    }
  }

  static deserialize({ center, radius, material }: typeof Sphere.prototype.serialize) {
    return new Sphere(Vec3.deserialize(center), radius, deserializeMaterial(material))
  }
}