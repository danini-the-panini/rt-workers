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
  vfov?: number,
  defocusAngle?: number,
  focusDist?: number
}

export default class Camera {
  deltaU: Vec3    // Offset to pixel to the right
  deltaV: Vec3    // Offset to pixel below
  pixelZero: Vec3 // Location of pixel 0, 0
  center: Vec3    // Camera center
  defocusU: Vec3  // Defocus disk horizontal radius
  defocusV: Vec3  // Defocus disk vertical radius
  samplesPerPixel: number
  maxDepth: number
  vfov: number
  defocusAngle: number
  focusDist: number
  
  // Camera frame basis vectors
  u: Vec3
  v: Vec3
  w: Vec3

  constructor(
    public imageWidth: number,            // Rendered image width in pixel count
    public imageHeight: number,           // Rendered image height in pixel count
    public lookFrom = new Vec3(0, 0, -1), // Point camera is looking from
    public lookAt = new Vec3(0, 0, 0),    // Point camera is looking at
    public vup = new Vec3(0, 1, 0),       // Camera-relative "up" direction
    {
      samplesPerPixel = 10, // Count of random samples for each pixel
      maxDepth = 10,        // Maximum number of ray bounces into scene
      vfov = 90,            // Vertical view angle (field of view)
      defocusAngle = 0,     // Variation angle of rays through each pixel
      focusDist = 10        // Distance from camera lookfrom point to plane of perfect focus
    } : CameraOptions = {}
  ) {
    this.samplesPerPixel = samplesPerPixel
    this.maxDepth = maxDepth
    this.vfov = vfov
    this.center = lookFrom
    this.defocusAngle = defocusAngle
    this.focusDist = focusDist

    const look = lookFrom.minus(lookAt)
    
    // Determine viewport dimensions.
    const theta = degToRad(vfov)
    const h = Math.tan(theta/2)
    const height = 2 * h * focusDist
    const width = height * (this.imageWidth / this.imageHeight)

    // Calculate the u,v,w unit basis vectors for the camera coordinate frame.
    this.w = look.unit
    this.u = this.vup.cross(this.w).unit
    this.v = this.w.cross(this.u)

    // Calculate the vectors across the horizontal and down the vertical viewport edges.
    const viewportU = this.u.times(width)      // Vector across viewport horizontal edge
    const viewportV = this.v.neg.scale(height) // Vector down viewport vertical edge
    
    // Calculate the horizontal and vertical delta vectors to the next pixel.
    this.deltaU = viewportU.div(this.imageWidth)
    this.deltaV = viewportV.div(this.imageHeight)

    // Calculate the location of the upper left pixel.
    const upperLeft = this.center.minus(this.w.times(focusDist)).sub(viewportU.shrink(2)).sub(viewportV.shrink(2))
    this.pixelZero = upperLeft.plus(this.deltaU.plus(this.deltaV).scale(0.5))

    // Calculate the camera defocus disk basis vectors.
    const defocusRadius = focusDist * Math.tan(degToRad(defocusAngle / 2))
    this.defocusU = this.u.times(defocusRadius)
    this.defocusV = this.v.times(defocusRadius)
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
    // Get a randomly-sampled camera ray for the pixel at location x,y, originating from
    // the camera defocus disk.

    const pixelCenter = this.pixelZero.plus(this.deltaU.times(x)).add(this.deltaV.times(y))
    const pixelSample = pixelCenter.add(this.pixelSampleSquare())

    const rayOrigin = (this.defocusAngle <= 0) ? this.center : this.defocusDiskSample()
    const rayDirection = pixelSample.sub(rayOrigin)

    return new Ray(rayOrigin, rayDirection)
  }

  pixelSampleSquare() {
    // Returns a random point in the square surrounding a pixel at the origin.

    const px = -0.5 + rand()
    const py = -0.5 + rand()
    return this.deltaU.times(px).add(this.deltaV.times(py))
  }

  defocusDiskSample() {
    // Returns a random point in the camera defocus disk.
    const p = Vec3.randomInUnitDisk()
    return this.center.plus(this.defocusU.times(p.x)).add(this.defocusV.times(p.y))
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
      vfov: this.vfov,
      defocusAngle: this.defocusAngle,
      focusDist: this.focusDist
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
    vfov,
    defocusAngle,
    focusDist
  }: typeof Camera.prototype.serialize) {
    return new Camera(
      imageWidth, imageHeight,
      Vec3.deserialize(lookFrom), Vec3.deserialize(lookAt), Vec3.deserialize(vup),
      { samplesPerPixel, maxDepth, vfov, defocusAngle, focusDist }
    )
  }
}