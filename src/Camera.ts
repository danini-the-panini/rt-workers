import Color from "./Color";
import IHittable from "./IHittable";
import Interval from "./Interval";
import Ray from "./Ray";
import Vec3 from "./Vec3";
import writeColor from "./writeColor";

export default class Camera {
  width: number
  deltaU: Vec3
  deltaV: Vec3
  upperLeft: Vec3
  pixelZero: Vec3

  constructor(
    public imageWidth: number,
    public imageHeight: number,
    public focalLength: number = 1.0,
    public height: number = 2.0,
    public center: Vec3 = new Vec3(0, 0, 0)
  ) {
    this.width = this.height * (this.imageWidth / this.imageHeight)

    const u = new Vec3(this.width, 0, 0)
    const v = new Vec3(0, -this.height, 0)
    
    this.deltaU = u.div(this.imageWidth)
    this.deltaV = v.div(this.imageHeight)

    this.upperLeft = this.center.minus(
      new Vec3(0, 0, this.focalLength)).sub(u.div(2)).sub(v.div(2))
    this.pixelZero = this.upperLeft.plus(this.deltaU.plus(this.deltaV).scale(0.5))
  }

  render(world: IHittable, buffer: SharedArrayBuffer, y: number) {
    const data = new Uint8ClampedArray(buffer, y * this.imageWidth * 4, this.imageWidth * 4)

    for (let x = 0; x < this.imageWidth; x++) {
      const pixelCenter = this.pixelZero.plus(this.deltaU.times(x)).add(this.deltaV.times(y))
      const rayDirection = pixelCenter.minus(this.center)
      const r = new Ray(this.center, rayDirection)

      const pixelColor = this.rayColor(r, world)
      writeColor(data, this.imageWidth, x, 0, pixelColor)
    }
  }

  rayColor(r: Ray, world: IHittable): Vec3 {
    let rec = world.hit(r, new Interval(0, Infinity))
    if (rec) {
      return rec.normal.plus(new Color(1,1,1)).scale(0.5)
    }
  
    const unitDirection = r.direction.unit
    const a = 0.5*(unitDirection.y + 1.0)
    return new Color(1.0, 1.0, 1.0).scale(1.0-a).add(new Color(0.5, 0.7, 1.0).scale(a))
  }

  get serialize() {
    return {
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      focalLength: this.focalLength,
      height: this.height,
      center: this.center.serialize
    }
  }

  static deserialize({
    imageWidth,
    imageHeight,
    focalLength,
    height,
    center
  }: typeof Camera.prototype.serialize) {
    return new Camera(imageWidth, imageHeight, focalLength, height, Vec3.deserialize(center))
  }
}