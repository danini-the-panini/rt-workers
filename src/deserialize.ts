import BVHNode from "./BVHNode"
import Dielectric from "./Dielectric"
import HittableList from "./HittableList"
import IHittable from "./IHittable"
import IMaterial from "./IMaterial"
import Lambertian from "./Lambertian"
import Metal from "./Metal"
import Sphere from "./Sphere"

export type HittableData =
  typeof BVHNode.prototype.serialize |
  typeof HittableList.prototype.serialize |
  typeof Sphere.prototype.serialize

export type MaterialData =
  typeof Lambertian.prototype.serialize |
  typeof Metal.prototype.serialize |
  typeof Dielectric.prototype.serialize

export function deserializeHittable(data: HittableData): IHittable {
  switch (data.type) {
    case 'bvh': return BVHNode.deserialize(data)
    case 'list': return HittableList.deserialize(data)
    case 'sphere': return Sphere.deserialize(data)
  }
}

export function deserializeMaterial(data: MaterialData): IMaterial {
  switch (data.type) {
    case 'lambertian': return Lambertian.deserialize(data)
    case 'metal': return Metal.deserialize(data)
    case 'dialectric': return Dielectric.deserialize(data)
  }
}