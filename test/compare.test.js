import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { agreement, compareTerm, compareTerms } from '../src/lib/compare.js'
import { parseSyntheticPosting } from '../src/lib/example.js'

const posting = parseSyntheticPosting(readFileSync(new URL('../examples/synthetic-posting.md', import.meta.url), 'utf8'))

function norm(value) {
  return value.replace(/\s+/g, ' ').trim()
}

test('synthetic keyword table matches the comparator', () => {
  const results = compareTerms(posting.rows.map((row) => row.term), posting.evidenceText)
  assert.equal(results.length, posting.rows.length)
  for (const row of posting.rows) {
    const got = results.find((item) => item.term === row.term)
    assert.equal(got.decision, row.decision, row.term)
    if (got.quote) assert.ok(norm(posting.evidenceText).includes(norm(got.quote)), got.quote)
  }
  assert.equal(agreement(results, posting.rows).matches, posting.rows.length)
  assert.equal(results.find((item) => item.term === '3+ years').reason, 'years')
  assert.equal(results.find((item) => item.term === 'SQS').reason, 'negated')
  assert.equal(results.find((item) => item.term === 'Terraform').reason, 'negated')
  assert.equal(results.find((item) => item.term === 'HTTP APIs').reason, 'tokens')
  assert.equal(results.find((item) => item.term === 'PostgreSQL').reason, 'tokens')
  assert.equal(results.find((item) => item.term === 'AWS').reason, 'tokens')
  assert.equal(results.find((item) => item.term === 'Written English, Spanish').reason, 'tokens')
})

test('negation, years, and absence are explicit', () => {
  assert.equal(compareTerm('Terraform', 'No usé Terraform.').decision, 'drop')
  assert.equal(compareTerm('Terraform', 'No usé Terraform.').reason, 'negated')
  assert.equal(compareTerm('Terraform', 'Usé Terraform en un proyecto.').decision, 'use')
  assert.equal(compareTerm('5+ años', 'Tengo 4 años con APIs.').reason, 'years-short')
  assert.equal(compareTerm('5+ años', 'Tengo 6 años con APIs.').decision, 'use')
  assert.equal(compareTerm('Kafka', 'PostgreSQL y HTTP APIs.').reason, 'absent')
  assert.equal(compareTerm('Kafka', 'PostgreSQL y HTTP APIs.').quote, '')
  assert.equal(compareTerm('C', 'Escribí C en la universidad.').reason, 'unsupported')
  assert.equal(compareTerm('3+ years', 'No. 4 years of PostgreSQL.').decision, 'use')
})
