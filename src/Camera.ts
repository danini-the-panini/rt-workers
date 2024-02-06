import Color from "./Color";
import IHittable from "./IHittable";
import Interval from "./Interval";
import Ray from "./Ray";
import Vec3 from "./Vec3";
import { degToRad, rand } from "./util";
import writeColor from "./writeColor";

type CameraOptions = {
  center?: Vec3,
  samplesPerPixel?: number,
  maxDepth?: number,
  vfov?: number
}

export default class Camera {
  deltaU: Vec3
  deltaV: Vec3
  upperLeft: Vec3
  pixelZero: Vec3
  samplesPerPixel: number
  maxDepth: number
  vfov: number
  center: Vec3
  u: Vec3
  v: Vec3
  w: Vec3

  constructor(
    public imageWidth: number,
    public imageHeight: number,
    public lookFrom: Vec3,
    public lookAt: Vec3,
    public vup: Vec3,
    {
      samplesPerPixel = 10,
      maxDepth = 10,
      vfov = 90
    } : CameraOptions = {}
  ) {
    this.samplesPerPixel = samplesPerPixel
    this.maxDepth = maxDepth
    this.vfov = vfov
    this.center = lookFrom

    const look = lookFrom.minus(lookAt)
    
    // Determine viewport dimensions.
    const focalLength = look.length
    const theta = degToRad(vfov)
    const h = Math.tan(theta/2)
    const height = 2 * h * focalLength
    const width = height * (this.imageWidth / this.imageHeight)

    // Calculate the u,v,w unit basis vectors for the camera coordinate frame.
    this.w = look.unit
    this.u = this.vup.cross(this.w).unit
    this.v = this.w.cross(this.u)

    const u = this.u.times(width)
    const v = this.v.neg.scale(height)
    
    this.deltaU = u.div(this.imageWidth)
    this.deltaV = v.div(this.imageHeight)

    this.upperLeft = this.center.minus(this.w.times(focalLength)).sub(u.shrink(2)).sub(v.shrink(2))
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
      lookFrom: this.lookFrom.serialize,
      lookAt: this.lookAt.serialize,
      vup: this.vup.serialize,
      samplesPerPixel: this.samplesPerPixel,
      maxDepth: this.maxDepth,
      vfov: this.vfov
    }
  }

  static deserialize({
    imageWidth,
    imageHeight,
    lookFrom,
    lookAt,
    vup,
    samplesPerPixel,
    maxDepth,
    vfov
  }: typeof Camera.prototype.serialize) {
    return new Camera(
      imageWidth, imageHeight,
      Vec3.deserialize(lookFrom), Vec3.deserialize(lookAt), Vec3.deserialize(vup),
      { samplesPerPixel, maxDepth, vfov }
    )
  }
}