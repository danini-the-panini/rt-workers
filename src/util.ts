export function degToRad(deg: number): number {
  return deg * Math.PI / 180.0
}

export function rand(min: number = 0, max: number = 1) {
  // Returns a random real in [min,max).
  return min + (max-min)*Math.random()
}

export function randi(min: number = 0, max: number = 1) {
  return rand(min, max+1)|0
}