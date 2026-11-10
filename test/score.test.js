import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  candidateFromConstraints,
  emptyCandidate,
  parseSyntheticConstraints,
  parseSyntheticPosting,
  postingInputFromParsed,
} from '../src/lib/example.js'
import { parseContracts, parsePay, scoreLocation, scorePosting } from '../src/lib/score.js'

const posting = parseSyntheticPosting(readFileSync(new URL('../examples/synthetic-posting.md', import.meta.url), 'utf8'))
const constraints = parseSyntheticConstraints(readFileSync(new URL('../examples/synthetic-constraints.md', import.meta.url), 'utf8'))

function fullInput(overrides = {}) {
  return {
    today: '2026-11-10',
    candidate: { ...candidateFromConstraints(constraints), ...overrides.candidate },
    posting: { ...postingInputFromParsed(posting), ...overrides.posting },
  }
}

test('pay and contract parsers quote the written line', () => {
  const pay = parsePay(posting.payRaw)
  assert.equal(pay.kind, 'amount')
  assert.equal(pay.currency, 'USD')
  assert.equal(pay.min, 3000)
  assert.equal(pay.max, 4200)
  assert.equal(pay.period, 'month')
  assert.equal(pay.gross, true)
  assert.equal(parsePay('Competitive salary').kind, 'unknown')
  assert.equal(parsePay('MXN 80000 per month gross').min, 80000)
  assert.deepEqual(parseContracts(posting.contract), ['eor', 'invoice'])
  assert.deepEqual(parseContracts('Nómina'), ['nomina'])
  assert.deepEqual(parseContracts('a permanent contract'), [])
})

test('the synthetic case scores apply with every check at 2', () => {
  const result = scorePosting(fullInput())
  assert.equal(result.recommendation, 'apply')
  assert.deepEqual(result.missing, [])
  assert.deepEqual(
    result.checks.map((check) => check.score),
    [2, 2, 2, 2, 2, 2],
  )
  assert.deepEqual(result.gaps.must, [])
  assert.deepEqual(result.gaps.nice, ['SQS', 'Terraform'])
  assert.equal(result.facts.pay, posting.payRaw)
  assert.equal(result.facts.company, 'Northline Analytics')
  assert.equal(result.log, '2026-11-10 | Northline Analytics | Backend engineer |  | USD 3,000–4,200 / month gross | apply | drafted')
})

test('recommendation rules from the skill', () => {
  const below = scorePosting(fullInput({ candidate: { payFloor: 4201 } }))
  assert.equal(below.pay.state, 'below')
  assert.equal(below.recommendation, 'maybe')

  const skip = scorePosting(fullInput({
    candidate: { payFloor: 4201 },
    posting: { location: 'Office in Madrid, relocation required' },
  }))
  assert.equal(skip.location.state, 'relocation')
  assert.equal(skip.recommendation, 'skip')

  const fee = scorePosting(fullInput({ posting: { redFlags: { fee: true, repayment: false, idBefore: false } } }))
  assert.equal(fee.recommendation, 'skip')

  const unknown = scorePosting(fullInput({ posting: { payRaw: 'Competitive salary' } }))
  assert.equal(unknown.pay.state, 'unknown')
  assert.equal(unknown.recommendation, 'maybe')

  const hours = scorePosting(fullInput({ candidate: { overlapStart: '12:00', overlapEnd: '18:00' } }))
  assert.equal(hours.hours.state, 'short')
  assert.equal(hours.recommendation, 'maybe')

  const nomina = scorePosting(fullInput({ candidate: { contracts: ['nomina'] } }))
  assert.equal(nomina.contract.state, 'mismatch')
  assert.equal(nomina.recommendation, 'maybe')
})

test('currency converts only with a rate and a date the user supplied', () => {
  const meets = scorePosting(fullInput({
    candidate: { payFloor: 50000, payCurrency: 'MXN', rateValue: 18.5, rateDate: '2026-03-01' },
  }))
  assert.equal(meets.pay.state, 'meets')
  assert.equal(meets.pay.formula, '3000 USD × 18.5 = 55500 MXN (2026-03-01)')
  assert.equal(meets.recommendation, 'apply')

  const below = scorePosting(fullInput({
    candidate: { payFloor: 60000, payCurrency: 'MXN', rateValue: 18.5, rateDate: '2026-03-01' },
  }))
  assert.equal(below.pay.state, 'below')
  assert.equal(below.recommendation, 'maybe')

  const noRate = scorePosting(fullInput({ candidate: { payFloor: 50000, payCurrency: 'MXN' } }))
  assert.equal(noRate.pay.state, 'currency')
  assert.equal(noRate.recommendation, 'maybe')
  assert.equal(noRate.missing.includes('payFloor'), false)
})

test('a posting without a candidate stays incomplete', () => {
  const result = scorePosting({
    today: '2026-11-10',
    candidate: emptyCandidate(),
    posting: postingInputFromParsed(posting),
  })
  assert.equal(result.recommendation, 'incomplete')
  assert.equal(result.location.state, 'remote-region')
  assert.equal(result.location.score, 2)
  assert.equal(result.pay.state, 'no-floor')
  assert.equal(result.log, '')
  assert.ok(result.missing.includes('payFloor'))
  assert.ok(result.missing.includes('contracts'))
  assert.ok(result.missing.includes('years'))
})

test('location lines follow the table', () => {
  assert.equal(scoreLocation('Remote from anywhere in Mexico.').state, 'remote-region')
  assert.equal(scoreLocation('Worldwide remote').score, 2)
  assert.equal(scoreLocation('Remote, United States only').state, 'remote-unspecified')
  assert.equal(scoreLocation('Hybrid remote in Mexico').state, 'mixed')
  assert.equal(scoreLocation('').state, 'unstated')
})
