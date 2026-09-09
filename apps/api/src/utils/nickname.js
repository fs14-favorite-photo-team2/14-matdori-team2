import { ADJECTIVES, FOODS } from '../constants/nickname-words.js'

function pickRandom(values) {
  return values[Math.floor(Math.random() * values.length)]
}

export function generateNickname() {
  return `${pickRandom(ADJECTIVES)}${pickRandom(FOODS)}`
}
