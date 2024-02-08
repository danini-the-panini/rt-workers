import { rand } from "./util"

export default class Vec3 {
  e: [number, number, number]

  constructor(x = 0, y = 0, z = 0) {
    this.e = [x, y, z]
  }

  get x() { return this.e[0] }
  get y() { return this.e[1] }
  get z() { return this.e[2] }

  set x(v: number) { this.e[0] = v }
  set y(v: number) { this.e[1] = v }
  set z(v: number) { this.e[2] = v }

  get lengthSquared() {
    return this.dot(this)
  }

  get length() {
    return Math.sqrt(this.lengthSquared)
  }

  get unit() {
    return this.div(this.length)
  }

  get neg() {
    return new Vec3(-this.e[0], -this.e[1], -this.e[2])
  }

  get isNearZero() {
    // Return true if the vector is close to zero in all dimensions.
    const s = 1e-8;
    return (Math.abs(this.x) < s) && (Math.abs(this.y) < s) && (Math.abs(this.z) < s);
  }
  
  add(v: Vec3) {
    this.x += v.x
    this.y += v.y
    this.z += v.z
    return this
  }

  sub(v: Vec3) {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z
    return this
  }

  mul(v: Vec3) {
    this.x *= v.x
    this.y *= v.y
    this.z *= v.z
    return this
  }

  scale(t: number) {
    this.x *= t
    this.y *= t
    this.z *= t
    return this
  }

  shrink(t: number) {
    this.x /= t
    this.y /= t
    this.z /= t
    return this
  }

  plus(v: Vec3) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  minus(v: Vec3) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  times(t: number) {
    return new Vec3(this.x * t, this.y * t, this.z * t)
  }

  timesV(v: Vec3) {
    return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z)
  }

  div(t: number) {
    return new Vec3(this.x / t, this.y / t, this.z / t)
  }

  dot(v: Vec3) {
    return this.x * v.x
         + this.y * v.y
         + this.z * v.z
  }

  cross(v: Vec3) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    )
  }

  reflect(n: Vec3) {
    return this.minus(n.times(2*this.dot(n)))
  }

  refract(n: Vec3, etaiOverEtat: number) {
    const cosTheta = Math.min(this.neg.dot(n), 1.0)
    const rOutPerp = n.times(cosTheta).add(this).scale(etaiOverEtat)
    const rOutParallel = n.times(-Math.sqrt(Math.abs(1.0 - rOutPerp.lengthSquared)))
    return rOutPerp.add(rOutParallel)
  }

  static random(min: number = 0, max: number = 1) {
    return new Vec3(rand(min, max), rand(min, max), rand(min, max))
  }

  static randomInUnitSphere() {
    while (true) {
      const p = this.random(-1, 1)
      if (p.lengthSquared < 1) return p
    }
  }

  static randomUnitVector() {
    return this.randomInUnitSphere().unit
  }

  static randomOnHemisphere(normal: Vec3) {
    const onUnitSphere = this.randomUnitVector()
    if (onUnitSphere.dot(normal) > 0.0) { // In the same hemisphere as the normal
      return onUnitSphere
    } else {
      return onUnitSphere.neg
    }
  }

  static randomInUnitDisk() {
    while (true) {
      let p = new Vec3(rand(-1,1), rand(-1,1), 0)
      if (p.lengthSquared < 1) return p
    }
  }

  get serialize() {
    return this.e
  }

  static deserialize(e: [number, number, number]) {
    return new Vec3(...e)
  }
}