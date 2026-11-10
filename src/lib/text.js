export const STOP_WORDS = new Set(
  'a an the and or for to of in on with from by their your de la el los las y e o u en con un una para por del al su sus que es se'.split(
    ' ',
  ),
)

export const NEG_WORDS = new Set(
  'no not never without sin nunca jamas ningun ninguna didnt dont cannot cant nor neither'.split(
    ' ',
  ),
)

export function fold(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

export function words(value) {
  return fold(value).match(/[a-z0-9+]+/g) || []
}

export function sameToken(word, token) {
  if (word === token) return true
  if (word === `${token}s` || token === `${word}s`) return true
  return false
}

export function tokenInText(text, token) {
  return words(text).some((word) => sameToken(word, token))
}

export function textMatches(text, needle) {
  if (!needle) return false
  if (needle.includes(' ')) return fold(text).includes(needle)
  return words(text).some((token) => token.startsWith(needle))
}

export function isYearish(token) {
  return /^(?:\d+\+?|year|years|ano|anos)$/.test(token)
}

export function contentTokens(term) {
  return words(term).filter((word) => !STOP_WORDS.has(word) && !NEG_WORDS.has(word) && word.length > 1)
}

export function yearMinimum(term) {
  const folded = fold(term)
  const plus = folded.match(/(\d+)\s*\+\s*(?:years?|anos)\b/)
  if (plus) return Number(plus[1])
  const plain = folded.match(/(\d+)\s*(?:years?|anos)\b/)
  if (plain) return Number(plain[1])
  return null
}

export function yearsSaid(sentence) {
  const match = fold(sentence).match(/(\d+)\s*(?:years?|anos)\b/)
  return match ? Number(match[1]) : null
}

export function sentenceNegates(sentence, token) {
  const list = words(sentence)
  const index = list.findIndex((word) => sameToken(word, token))
  if (index <= 0) return false
  return list.slice(0, index).some((word) => NEG_WORDS.has(word))
}
