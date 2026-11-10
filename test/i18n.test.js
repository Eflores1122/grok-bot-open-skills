import assert from 'node:assert/strict'
import test from 'node:test'
import { strings } from '../site/i18n.js'

function shape(value, prefix = '') {
  if (Array.isArray(value)) return [`${prefix}[]`]
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .flatMap((key) => shape(value[key], prefix ? `${prefix}.${key}` : key))
  }
  return [prefix]
}

test('spanish and english expose the same copy keys', () => {
  assert.deepEqual(shape(strings.es), shape(strings.en))
})

test('ui copy has no em dash and no hype', () => {
  const blob = JSON.stringify(strings)
  assert.equal(blob.includes('\u2014'), false)
  assert.equal(blob.includes('\u2013'), false)
  for (const word of ['revoluciona', 'seamless', 'next-gen', 'sin esfuerzo', 'potencia tu']) {
    assert.equal(blob.toLowerCase().includes(word), false, word)
  }
})
