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

  get serialize() {
    return this.e
  }

  static deserialize(e: [number, number, number]) {
    return new Vec3(...e)
  }
}