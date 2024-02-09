import Color from "./Color";
import { HitRecord } from "./IHittable";
import IMaterial, { Scatter } from "./IMaterial";
import Ray from "./Ray";
import Vec3 from "./Vec3";
import { rand } from "./util";

export default class Dielectric implements IMaterial {
  constructor(public indexOfRefraction: number) {}

  scatter(rIn: Ray, rec: HitRecord): Scatter | null {
    const attenuation = new Color(1.0, 1.0, 1.0)
    const refractionRatio = rec.frontFace ? (1.0/this.indexOfRefraction) : this.indexOfRefraction

    const unitDirection = rIn.direction.unit
    const cosTheta = Math.min(unitDirection.neg.dot(rec.normal), 1.0)
    const sinTheta = Math.sqrt(1.0 - cosTheta*cosTheta)

    const cannotRefract = refractionRatio * sinTheta > 1.0
    let direction : Vec3

    if (cannotRefract || Dielectric.reflectance(cosTheta, refractionRatio) > rand()) {
      direction = unitDirection.reflect(rec.normal)
    } else {
      direction = unitDirection.refract(rec.normal, refractionRatio)
    }

    return {
      scattered: new Ray(rec.p, direction, rIn.time),
      attenuation
    }
  }

  static reflectance(cosine: number, refIdx: number) {
    // Use Schlick's approximation for reflectance.
    let r0 = (1-refIdx) / (1+refIdx)
    r0 = r0*r0
    return r0 + (1-r0)*Math.pow(1-cosine, 5)
  }

  get serialize() {
    return {
      type: 'dialectric' as const,
      indexOfRefraction: this.indexOfRefraction
    }
  }

  static deserialize({ indexOfRefraction }: typeof Dielectric.prototype.serialize) {
    return new Dielectric(indexOfRefraction)
  }
}