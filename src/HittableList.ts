import IHittable, { HitRecord, deserializeHittable } from "./IHittable";
import Ray from "./Ray";

export default class HittableList implements IHittable {
  constructor(public objects: IHittable[] = []) {}

  clear() {
    this.objects = []
  }

  add(object: IHittable) {
    this.objects.push(object)
  }

  hit(r: Ray, rayTMin: number, rayTMax: number): HitRecord | null {
    let rec: HitRecord | null = null
    let closestSoFar = rayTMax

    this.objects.forEach(object => {
      let tempRec = object.hit(r, rayTMin, closestSoFar)
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