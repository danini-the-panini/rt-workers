import Vec3 from "./Vec3";

export default class Ray {
  constructor(public origin: Vec3, public direction: Vec3, public time: number = 0.0) { }

  at(t: number) {
    return this.direction.times(t).add(this.origin)
  }

  get serialize() {
    return { origin: this.origin.serialize, direction: this.direction.serialize }
  }

  static deserialize({ origin, direction }: typeof Ray.prototype.serialize) {
    return new Ray(Vec3.deserialize(origin), Vec3.deserialize(direction))
  }
}