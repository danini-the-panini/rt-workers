import AABB from "./AABB";
import IHittable, { HitRecord } from "./IHittable";
import Interval from "./Interval";
import Ray from "./Ray";
import { randi } from "./util";

function boxCompare(a: IHittable, b: IHittable, axisIndex: number) {
  return a.boundingBox.axis(axisIndex).min - b.boundingBox.axis(axisIndex).min
}
function boxXCompare(a: IHittable, b: IHittable) {
  return boxCompare(a, b, 0)
}
function boxYCompare(a: IHittable, b: IHittable) {
  return boxCompare(a, b, 1)
}
function boxZCompare(a: IHittable, b: IHittable) {
  return boxCompare(a, b, 2)
}

export default class BVHNode implements IHittable {
  boundingBox: AABB
  private left: IHittable
  private right: IHittable

  constructor(objects: IHittable[]) {
    const axis = randi(0, 2)
    const comparator =  (axis === 0)  ? boxXCompare
                      : (axis === 1)  ? boxYCompare
                                      : boxZCompare


    if (objects.length === 1) {
      this.left = this.right = objects[0]
    } else if (objects.length === 2) {
      if (comparator(objects[0], objects[1]) < 0) {
        this.left = objects[0]
        this.right = objects[1]
      } else {
        this.left = objects[1]
        this.right = objects[0]
      }
    } else {
      objects.sort(comparator)

      const mid = objects.length / 2
      this.left = new BVHNode(objects.slice(0, mid))
      this.right = new BVHNode(objects.slice(mid))
    }

    this.boundingBox = AABB.fromBoxes(this.left.boundingBox, this.right.boundingBox)
  }

  hit(r: Ray, rayT: Interval): HitRecord | null {
    if (!this.boundingBox.hit(r, rayT)) return null

    const hitLeft = this.left.hit(r, rayT)
    const hitRight = this.right.hit(r, new Interval(rayT.min, hitLeft?.t ?? rayT.max))

    return hitLeft || hitRight
  }

  get serialize() {
    return { type: 'bvh' as const, left: this.left.serialize, right: this.right.serialize }
  }

  static deserialize({ left, right }: typeof BVHNode.prototype.serialize) {
    return new BVHNode([left, right])
  }
}