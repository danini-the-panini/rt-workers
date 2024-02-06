import Color from "./Color";
import { HitRecord } from "./IHittable";
import IMaterial, { Scatter } from "./IMaterial";
import Ray from "./Ray";

export default class Metal implements IMaterial {
  constructor(public albedo: Color) {}

  scatter(rIn: Ray, rec: HitRecord): Scatter | null {
    const reflected = rIn.direction.unit.reflect(rec.normal)
    return {
      scattered: new Ray(rec.p, reflected),
      attenuation: this.albedo
    }
  }

  get serialize() {
    return {
      type: 'metal' as const,
      albedo: this.albedo.serialize
    }
  }

  static deserialize({ albedo }: typeof Metal.prototype.serialize) {
    return new Metal(Color.deserialize(albedo))
  }
}