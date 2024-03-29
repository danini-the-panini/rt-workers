import AABB from "./AABB";
import IHittable, { HitRecord } from "./IHittable";
import Interval from "./Interval";
import Ray from "./Ray";
import { deserializeHittable } from "./deserialize";

export default class HittableList implements IHittable {
  objects: IHittable[] = []
  boundingBox: AABB = new AABB

  constructor(objects: IHittable[] = []) {
    objects.forEach(this.add.bind(this))
  }

  clear() {
    this.objects = []
  }

  add(object: IHittable) {
    this.objects.push(object)
    this.boundingBox = AABB.fromBoxes(this.boundingBox, object.boundingBox)
  }

  hit(r: Ray, rayT: Interval): HitRecord | null {
    let rec: HitRecord | null = null
    let closestSoFar = rayT.max

    this.objects.forEach(object => {
      let tempRec = object.hit(r, new Interval(rayT.min, closestSoFar))
      if (tempRec) {
        closestSoFar = tempRec.t
        rec = tempRec
      }
    })

    return rec
  }

  get serialize() {
    return { type: 'list' as const, objects: this.objects.map(o => o.serialize) }
  }

  static deserialize({ objects }: typeof HittableList.prototype.serialize) {
    return new HittableList(objects.map(o => deserializeHittable(o)))
  }
}