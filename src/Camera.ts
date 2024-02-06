import Vec3 from "./Vec3";

export default class Camera {
  width: number
  u: Vec3
  v: Vec3
  deltaU: Vec3
  deltaV: Vec3
  upperLeft: Vec3
  pixelZero: Vec3

  constructor(
    public focalLength: number,
    public height: number,
    public imageWidth: number,
    public imageHeight: number,
    public center: Vec3
  ) {
    this.width = this.height * (this.imageWidth / this.imageHeight)

    this.u = new Vec3(this.width, 0, 0)
    this.v = new Vec3(0, -this.height, 0)
    
    this.deltaU = this.u.div(this.imageWidth)
    this.deltaV = this.v.div(this.imageHeight)

    this.upperLeft = this.center.minus(
      new Vec3(0, 0, this.focalLength)).sub(this.u.div(2)).sub(this.v.div(2))
    this.pixelZero = this.upperLeft.plus(this.deltaU.plus(this.deltaV).scale(0.5))
  }

  get serialize() {
    return {
      focalLength: this.focalLength,
      height: this.height,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      center: this.center.serialize
    }
  }

  static deserialize({
    focalLength,
    height,
    imageWidth,
    imageHeight,
    center
  }: typeof Camera.prototype.serialize) {
    return new Camera(focalLength, height, imageWidth, imageHeight, Vec3.deserialize(center))
  }
}