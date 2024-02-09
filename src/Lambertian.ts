import { HitRecord } from "./IHittable";
import IMaterial, { Scatter } from "./IMaterial";
import Ray from "./Ray";
import Vec3 from "./Vec3";

export default class Lambertian implements IMaterial {
  constructor(public albedo: Vec3) {}

  scatter(rIn: Ray, rec: HitRecord): Scatter | null {
    let scatterDirection = Vec3.randomUnitVector().add(rec.normal)

    // Catch degenerate scatter direction
    if (scatterDirection.isNearZero) {
      scatterDirection = rec.normal
    }

    return {
      scattered: new Ray(rec.p, scatterDirection, rIn.time),
      attenuation: this.albedo
    }
  }

  get serialize() {
    return {
      type: 'lambertian' as const,
      albedo: this.albedo.serialize
    }
  }

  static deserialize({ albedo }: typeof Lambertian.prototype.serialize) {
    return new Lambertian(Vec3.deserialize(albedo))
  }
}