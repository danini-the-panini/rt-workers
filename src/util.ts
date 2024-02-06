export function degToRad(deg: number): number {
  return deg * Math.PI / 180.0
}

export function randomDouble(min: number, max: number) {
  // Returns a random real in [min,max).
  return min + (max-min)*Math.random()
}