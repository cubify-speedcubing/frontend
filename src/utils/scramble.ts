// Simple Tnoodle-style 3x3 scramble generator
const FACES = ["R", "L", "U", "D", "F", "B"]
const MODS = ["", "2", "'"]

function randomInt(max: number) {
  return Math.floor(Math.random() * max)
}

export function generate3x3Scramble(length = 20): string {
  const seq: string[] = []
  let lastFace: string | null = null

  while (seq.length < length) {
    let face = FACES[randomInt(FACES.length)]
    // avoid same face twice in a row
    if (face === lastFace) continue

    // avoid opposite face following same axis sequences like R L R
    // simple heuristic: if last two faces are same axis, skip
    const axis = (f: string) => (f === "R" || f === "L" ? "x" : f === "U" || f === "D" ? "y" : "z")
    if (seq.length >= 2) {
      const a1 = axis(seq[seq.length - 1][0])
      const a2 = axis(seq[seq.length - 2][0])
      if (a1 === a2 && axis(face) === a1) continue
    }

    const mod = MODS[randomInt(MODS.length)]
    seq.push(face + mod)
    lastFace = face
  }

  return seq.join(" ")
}

export default generate3x3Scramble
