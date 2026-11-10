import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSourceBlock } from '../src/lib/source-block.js'

const valid = {
  publisher: 'INEGI',
  title: 'Indicador de ejemplo',
  url: 'https://www.inegi.org.mx/ejemplo',
  retrieved: '2026-11-10',
  license: 'Términos de uso del editor',
  question: '¿Cuál fue el valor publicado para un estado en el último periodo del archivo?',
}

test('a complete block records the publisher license and does not invent a frequency', () => {
  const result = buildSourceBlock(valid)
  assert.equal(result.reason, 'ok')
  assert.match(result.markdown, /^## Fuente/)
  assert.match(result.markdown, /Frecuencia: no la dice/)
  assert.match(result.markdown, /Microdato de personas: no/)
  assert.match(result.markdown, /El pipeline no se actualiza solo/)
  assert.equal(result.markdown.includes('MIT') && result.markdown.includes('licencia del editor'), true)
})

test('personal data and establishment microdata stop the block', () => {
  const person = buildSourceBlock({ ...valid, hasPersonalData: true })
  assert.equal(person.stopped, true)
  assert.equal(person.reason, 'personal')
  assert.equal(person.markdown, '')
  const roster = buildSourceBlock({ ...valid, establishmentLevel: true, aggregated: false })
  assert.equal(roster.reason, 'establishment')
  assert.equal(roster.markdown, '')
  const aggregated = buildSourceBlock({ ...valid, establishmentLevel: true, aggregated: true })
  assert.match(aggregated.markdown, /salida agregada/)
})

test('url and date have to be usable', () => {
  const badUrl = buildSourceBlock({ ...valid, url: 'datos.gob.mx' })
  assert.equal(badUrl.reason, 'invalid')
  assert.ok(badUrl.errors.includes('url-scheme'))
  assert.equal(badUrl.markdown, '')
  const badDate = buildSourceBlock({ ...valid, retrieved: '10/11/2026' })
  assert.ok(badDate.errors.includes('date'))
  const english = buildSourceBlock({ ...valid, lang: 'en' })
  assert.match(english.markdown, /^## Source/)
  assert.match(english.markdown, /the page does not say/)
})
