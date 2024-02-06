import Color from "./Color";

export default function writeColor(data: Uint8ClampedArray, width: number, x: number, y: number, color: Color) {
  let ir = (255.999*color.r)|0
  let ig = (255.999*color.g)|0
  let ib = (255.999*color.b)|0

  let idx = (x + y * width) * 4

  data[idx + 0] = ir  // red
  data[idx + 1] = ig  // green
  data[idx + 2] = ib  // blue
  data[idx + 3] = 255 // alpha
}