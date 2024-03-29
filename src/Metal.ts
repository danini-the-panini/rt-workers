import { HitRecord } from "./IHittable";
import IMaterial, { Scatter } from "./IMaterial";
import Ray from "./Ray";
import Vec3 from "./Vec3";

export default class Metal implements IMaterial {
  constructor(public albedo: Vec3, public fuzz: number) {}

  scatter(rIn: Ray, rec: HitRecord): Scatter | null {
    const reflected = rIn.direction.unit.reflect(rec.normal)
    return {
      scattered: new Ray(rec.p, reflected.add(Vec3.randomUnitVector().scale(this.fuzz)), rIn.time),
      attenuation: this.albedo
    }
  }

  get serialize() {
    return {
      type: 'metal' as const,
      albedo: this.albedo.serialize,
      fuzz: this.fuzz
    }
  }

  static deserialize({ albedo, fuzz }: typeof Metal.prototype.serialize) {
    return new Metal(Vec3.deserialize(albedo), fuzz)
  }
}