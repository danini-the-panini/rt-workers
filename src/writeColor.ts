import Interval from "./Interval"
import Vec3 from "./Vec3"

export default function writeColor(data: Uint8ClampedArray, width: number, x: number, y: number, color: Vec3, samplesPerPixel: number) {
  // Divide the color by the number of samples.
  color.shrink(samplesPerPixel)

  const intensity = new Interval(0.000, 0.999)

  let ir = (256 * intensity.clamp(color.x))|0
  let ig = (256 * intensity.clamp(color.y))|0
  let ib = (256 * intensity.clamp(color.z))|0

  let idx = (x + y * width) * 4

  data[idx + 0] = ir  // red
  data[idx + 1] = ig  // green
  data[idx + 2] = ib  // blue
  data[idx + 3] = 255 // alpha
}