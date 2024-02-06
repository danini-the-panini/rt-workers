import Color from "./Color";
import IHittable from "./IHittable";
import Interval from "./Interval";
import Ray from "./Ray";
import Vec3 from "./Vec3";
import { rand } from "./util";
import writeColor from "./writeColor";

type CameraOptions = {
  focalLength?: number,
  height?: number,
  center?: Vec3,
  samplesPerPixel?: number,
  maxDepth?: number
}

export default class Camera {
  width: number
  deltaU: Vec3
  deltaV: Vec3
  upperLeft: Vec3
  pixelZero: Vec3
  focalLength: number
  height: number
  center: Vec3
  samplesPerPixel: number
  maxDepth: number

  constructor(
    public imageWidth: number,
    public imageHeight: number,
    {
      focalLength = 1.0,
      height = 2.0,
      center = new Vec3(0, 0, 0),
      samplesPerPixel = 10,
      maxDepth = 10
    } : CameraOptions = {}
  ) {
    this.focalLength = focalLength
    this.height = height
    this.center = center
    this.samplesPerPixel = samplesPerPixel
    this.maxDepth = maxDepth

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
      const pixelColor = new Color(0, 0, 0)
      for (let sample = 0; sample < this.samplesPerPixel; sample++) {
        const r = this.getRay(x, y)
        pixelColor.add(this.rayColor(r, world))
      }
      writeColor(data, this.imageWidth, x, 0, pixelColor, this.samplesPerPixel)
    }
  }

  rayColor(r: Ray, world: IHittable, depth = this.maxDepth): Vec3 {
    // If we've exceeded the ray bounce limit, no more light is gathered.
    if (depth <= 0) return new Color(0,0,0)

    const rec = world.hit(r, new Interval(0.001, Infinity))
    if (rec) {
      const scatter = rec.mat.scatter(r, rec)
      if (scatter) {
        return this.rayColor(scatter.scattered, world, depth-1).mul(scatter.attenuation)
      }
      return new Color(0,0,0)
    }
  
    const unitDirection = r.direction.unit
    const a = 0.5*(unitDirection.y + 1.0)
    return new Color(1.0, 1.0, 1.0).scale(1.0-a).add(new Color(0.5, 0.7, 1.0).scale(a))
  }

  getRay(x: number, y: number) {
    // Get a randomly sampled camera ray for the pixel at location x,y.

    const pixelCenter = this.pixelZero.plus(this.deltaU.times(x)).add(this.deltaV.times(y))
    const pixelSample = pixelCenter.add(this.pixelSampleSquare())

    return new Ray(
      this.center,
      pixelSample.sub(this.center)
    )
  }

  pixelSampleSquare() {
    // Returns a random point in the square surrounding a pixel at the origin.

    const px = -0.5 + rand()
    const py = -0.5 + rand()
    return this.deltaU.times(px).add(this.deltaV.times(py))
  }

  get serialize() {
    return {
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      focalLength: this.focalLength,
      height: this.height,
      center: this.center.serialize,
      samplesPerPixel: this.samplesPerPixel,
      maxDepth: this.maxDepth
    }
  }

  static deserialize({
    imageWidth,
    imageHeight,
    focalLength,
    height,
    center,
    samplesPerPixel,
    maxDepth
  }: typeof Camera.prototype.serialize) {
    return new Camera(imageWidth, imageHeight, { focalLength, height, center: Vec3.deserialize(center), samplesPerPixel, maxDepth })
  }
}