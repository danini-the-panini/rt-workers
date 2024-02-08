import { HitRecord } from "./IHittable";
import Ray from "./Ray";
import Vec3 from "./Vec3";

export type Scatter = {
  attenuation: Vec3,
  scattered: Ray
}

export default interface IMaterial {
  scatter(rIn: Ray, rec: HitRecord): Scatter | null
  serialize: any
}