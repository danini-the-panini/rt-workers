import Vec3 from "./Vec3"

export default function writeColor(data: Uint8ClampedArray, width: number, x: number, y: number, color: Vec3) {
  let ir = (255.999*color.x)|0
  let ig = (255.999*color.y)|0
  let ib = (255.999*color.z)|0

  let idx = (x + y * width) * 4

  data[idx + 0] = ir  // red
  data[idx + 1] = ig  // green
  data[idx + 2] = ib  // blue
  data[idx + 3] = 255 // alpha
}