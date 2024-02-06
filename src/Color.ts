import Vec3 from "./Vec3";

export default class Color extends Vec3 {
  get r() { return this.x }
  get g() { return this.y }
  get b() { return this.z }

  static deserialize(e: [number, number, number]) {
    return new Color(...e)
  }
}