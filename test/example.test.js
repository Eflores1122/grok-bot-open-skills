import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseSyntheticConstraints, parseSyntheticPosting } from '../src/lib/example.js'

const posting = parseSyntheticPosting(readFileSync(new URL('../examples/synthetic-posting.md', import.meta.url), 'utf8'))
const constraints = parseSyntheticConstraints(readFileSync(new URL('../examples/synthetic-constraints.md', import.meta.url), 'utf8'))

test('synthetic posting fields come from the file sections', () => {
  assert.equal(posting.title, 'Backend engineer')
  assert.equal(posting.company, 'Northline Analytics')
  assert.equal(posting.payRaw, 'USD 3,000–4,200 / month gross')
  assert.equal(posting.location, 'Remote from anywhere in Mexico.')
  assert.equal(posting.overlapStart, '10:00')
  assert.equal(posting.overlapEnd, '15:00')
  assert.match(posting.contract, /employer of record/)
  assert.deepEqual(posting.mustHave, [
    '3+ years building HTTP APIs',
    'PostgreSQL',
    'AWS',
    'Written English for tickets, and Spanish',
  ])
  assert.deepEqual(posting.nice, ['SQS', 'Terraform'])
  assert.equal(posting.evidenceLines.length, 8)
  assert.equal(posting.rows.length, 7)
  assert.deepEqual(
    posting.rows.map((row) => row.decision),
    ['use', 'use', 'use', 'use', 'use', 'drop', 'drop'],
  )
})

test('synthetic constraints are the fictional scorer case', () => {
  assert.equal(constraints.title, 'backend engineer')
  assert.equal(constraints.years, 4)
  assert.equal(constraints.payFloor, 3000)
  assert.equal(constraints.payCurrency, 'USD')
  assert.equal(constraints.payPeriod, 'month')
  assert.equal(constraints.payGross, true)
  assert.deepEqual(constraints.contracts, ['eor', 'invoice'])
  assert.equal(constraints.overlapStart, '09:00')
  assert.equal(constraints.overlapEnd, '18:00')
  assert.match(constraints.stack, /PostgreSQL/)
  assert.match(constraints.dealBreakers, /fee to apply/)
})
