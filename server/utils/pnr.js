const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // Exclude I, O for clarity
const DIGITS = '23456789' // Exclude 0,1 for clarity

export function generatePnr(length = 6) {
  let s = ''
  const chars = ALPHABET + DIGITS
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}
