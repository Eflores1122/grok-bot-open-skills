import {
  contentTokens,
  isYearish,
  sentenceNegates,
  tokenInText,
  words,
  yearMinimum,
  yearsSaid,
} from './text.js'

function bullets(evidence) {
  return String(evidence ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''))
}

function sentences(bullet) {
  return bullet
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function quoteFor(bullet, sentence, tokens) {
  const parts = sentences(bullet)
  const index = parts.indexOf(sentence)
  if (index === -1) return sentence
  if (words(sentence).length < 4 && index + 1 < parts.length) {
    const next = parts[index + 1]
    const nextNegates = tokens.some((token) => sentenceNegates(next, token))
    if (!nextNegates) return `${sentence} ${next}`
  }
  return sentence
}

function support(sentence, tokens) {
  if (!tokens.every((token) => tokenInText(sentence, token))) return 'miss'
  if (tokens.some((token) => sentenceNegates(sentence, token))) return 'negated'
  return 'hit'
}

export function compareTerm(term, evidence) {
  const label = String(term ?? '').trim()
  const minimum = yearMinimum(label)
  const tokens = contentTokens(label).filter((token) => !isYearish(token))
  if (!label) return null
  if (minimum == null && tokens.length === 0) {
    return { term: label, decision: 'drop', quote: '', reason: 'unsupported' }
  }

  const source = bullets(evidence)
  if (minimum != null && tokens.length === 0) {
    let negated = null
    let short = null
    for (const bullet of source) {
      for (const sentence of sentences(bullet)) {
        const years = yearsSaid(sentence)
        if (years == null) continue
        if (sentenceNegates(sentence, String(years))) {
          negated = negated || { sentence, years }
          continue
        }
        if (years >= minimum) {
          return {
            term: label,
            decision: 'use',
            quote: quoteFor(bullet, sentence, [String(years)]),
            reason: 'years',
            years: { evidence: years, required: minimum },
          }
        }
        short = short || { sentence, years }
      }
    }
    if (short) {
      return {
        term: label,
        decision: 'drop',
        quote: short.sentence,
        reason: 'years-short',
        years: { evidence: short.years, required: minimum },
      }
    }
    if (negated) {
      return {
        term: label,
        decision: 'drop',
        quote: negated.sentence,
        reason: 'negated',
        years: { evidence: negated.years, required: minimum },
      }
    }
    return { term: label, decision: 'drop', quote: '', reason: 'absent' }
  }

  let negated = null
  for (const bullet of source) {
    for (const sentence of sentences(bullet)) {
      const kind = support(sentence, tokens)
      if (kind === 'negated' && !negated) negated = sentence
      if (kind !== 'hit') continue
      if (minimum != null) {
        const years = yearsIn(evidence)
        if (years == null || years < minimum) continue
      }
      return {
        term: label,
        decision: 'use',
        quote: quoteFor(bullet, sentence, tokens),
        reason: 'tokens',
        years: minimum == null ? null : { evidence: yearsIn(evidence), required: minimum },
      }
    }
  }
  if (negated) return { term: label, decision: 'drop', quote: negated, reason: 'negated' }
  return { term: label, decision: 'drop', quote: '', reason: 'absent' }
}

function yearsIn(evidence) {
  for (const bullet of bullets(evidence)) {
    for (const sentence of sentences(bullet)) {
      const years = yearsSaid(sentence)
      if (years != null && !sentenceNegates(sentence, String(years))) return years
    }
  }
  return null
}

export function compareTerms(terms, evidence) {
  return (terms || []).map((term) => compareTerm(term, evidence)).filter(Boolean)
}

export function agreement(results, expected) {
  const rows = expected || []
  let matches = 0
  for (const row of rows) {
    const got = (results || []).find((item) => item.term === row.term)
    if (got && got.decision === row.decision) matches += 1
  }
  return { matches, total: rows.length }
}
