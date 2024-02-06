import Color from "./Color";
import { HitRecord } from "./IHittable";
import Ray from "./Ray";

export type Scatter = {
  attenuation: Color,
  scattered: Ray
}

export default interface IMaterial {
  scatter(rIn: Ray, rec: HitRecord): Scatter | null
  serialize: any
}