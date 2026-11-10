import { contentTokens, fold, isYearish, tokenInText, yearMinimum } from './text.js'

export const SOFT_WORDS = new Set(
  'building written tickets experience strong plus using skills must have good solid hands'.split(' '),
)

export const GENERIC_TITLE = new Set(
  'engineer developer desarrollador ingeniero senior junior mid lead remote mexico intern staff principal remoto'.split(
    ' ',
  ),
)

export function parsePay(line) {
  const raw = String(line ?? '')
  const folded = fold(raw)
  let currency = null
  if (/\b(usd|us\$|dolares)\b/.test(folded)) currency = 'USD'
  else if (/\b(mxn|pesos)\b/.test(folded)) currency = 'MXN'
  else if (/\beur\b/.test(folded)) currency = 'EUR'
  let period = null
  if (/\b(year|yearly|annual|anual|ano)\b/.test(folded)) period = 'year'
  else if (/\b(hour|hourly|hora|hr)\b/.test(folded)) period = 'hour'
  else if (/\b(month|monthly|mensual|mes)\b/.test(folded)) period = 'month'
  let gross = null
  if (/\b(gross|bruto)\b/.test(folded)) gross = true
  else if (/\b(net|neto)\b/.test(folded)) gross = false
  const numbers = []
  const re = /(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/g
  let match = re.exec(raw)
  while (match) {
    numbers.push(Number(match[1].replace(/,/g, '')))
    match = re.exec(raw)
  }
  if (!numbers.length || !currency) return { kind: 'unknown', currency, period, gross, numbers }
  return {
    kind: 'amount',
    currency,
    period,
    gross,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    numbers,
  }
}

export function parseContracts(line) {
  const folded = fold(line)
  const found = []
  if (/nomina/.test(folded)) found.push('nomina')
  if (/employer of record|\beor\b/.test(folded)) found.push('eor')
  if (/\binvoice\b|\bfactura\b|\bcontractor\b/.test(folded)) found.push('invoice')
  return found
}

export function parseOverlap(line) {
  const raw = String(line ?? '').trim()
  if (!raw) return { start: '', end: '', state: 'empty' }
  const match = raw.match(/(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})/)
  if (!match) return { start: '', end: '', state: 'invalid' }
  return { start: match[1], end: match[2], state: 'ok' }
}

export function toMinutes(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || '')
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function scoreLocation(line) {
  const folded = fold(line).trim()
  if (!folded) return { score: 0, state: 'unstated' }
  const relocation = /\b(reloc|reubic)/.test(folded)
  const hybridOrSite = /\b(hybrid|hibrido|onsite|presencial)\b/.test(folded) || /on-site/.test(folded) || /\b(office|oficina)\b/.test(folded)
  const remote = /\b(remote|remoto)\b/.test(folded)
  const region = /\b(mexico|latam|worldwide|anywhere)\b/.test(folded) || /cualquier lugar/.test(folded)
  if (relocation) return { score: 0, state: 'relocation' }
  if (hybridOrSite && remote) return { score: 0, state: 'mixed' }
  if (hybridOrSite) return { score: 0, state: 'site' }
  if (remote && region) return { score: 2, state: 'remote-region' }
  if (remote) return { score: 0, state: 'remote-unspecified' }
  return { score: 0, state: 'unrecognized' }
}

export function scoreHours(userStart, userEnd, postStart, postEnd, noOverlapRequired) {
  if (noOverlapRequired) return { score: 2, state: 'none-required' }
  if (!userStart || !userEnd || !postStart || !postEnd) return { score: 0, state: 'unstated' }
  const user0 = toMinutes(userStart)
  const user1 = toMinutes(userEnd)
  const post0 = toMinutes(postStart)
  const post1 = toMinutes(postEnd)
  if ([user0, user1, post0, post1].some((value) => value == null) || user1 <= user0 || post1 <= post0) {
    return { score: 0, state: 'invalid' }
  }
  const covers = user0 <= post0 && user1 >= post1
  return { score: covers ? 2 : 0, state: covers ? 'covers' : 'short' }
}

function stackTokens(line) {
  return contentTokens(line).filter((token) => !SOFT_WORDS.has(token) && !isYearish(token) && !GENERIC_TITLE.has(token))
}

export function scoreRole({ candidateTitle, candidateStack, postingTitle, mustHaveLines, yearsClaimed }) {
  const titleTokens = contentTokens(postingTitle).filter((token) => !GENERIC_TITLE.has(token) && !isYearish(token))
  const titleOk = titleTokens.length
    ? titleTokens.every((token) => tokenInText(candidateTitle || '', token))
    : contentTokens(postingTitle).some((token) => tokenInText(candidateTitle || '', token))
  const blob = [candidateStack, candidateTitle].filter(Boolean).join(' ')
  const missing = []
  let yearsOk = true
  let yearsDetail = null
  for (const line of mustHaveLines || []) {
    const minimum = yearMinimum(line)
    const tokens = stackTokens(line)
    if (minimum != null) {
      yearsDetail = { required: minimum, claimed: yearsClaimed }
      if (yearsClaimed == null || yearsClaimed < minimum) {
        yearsOk = false
        missing.push(line)
      }
    }
    if (tokens.length && tokens.some((token) => !tokenInText(blob, token))) missing.push(line)
  }
  const uniqueMissing = [...new Set(missing)]
  const score = titleOk && yearsOk && uniqueMissing.length === 0 ? 2 : 0
  return { score, state: score === 2 ? 'ok' : 'gap', titleOk, missing: uniqueMissing, yearsDetail }
}

export function niceGaps(lines, stack) {
  return (lines || []).filter((line) => {
    const tokens = stackTokens(line)
    if (!tokens.length) return false
    return tokens.some((token) => !tokenInText(stack, token))
  })
}

function num(value) {
  if (value === '' || value == null) return null
  const number = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))
  return Number.isFinite(number) ? number : null
}

function grossOf(value) {
  if (value === true || value === 'gross') return true
  if (value === false || value === 'net') return false
  return null
}

export function formatAmount(value) {
  if (!Number.isFinite(value)) return ''
  if (Number.isInteger(value)) return String(value)
  return String(Math.round(value * 100) / 100)
}

function cents(value) {
  return Math.round(value * 100)
}

function convert(amount, from, to, rateValue) {
  if (from === to) return { amount, usedRate: false, op: 'same' }
  if (!(rateValue > 0)) return null
  if (from === 'USD' && to === 'MXN') return { amount: amount * rateValue, usedRate: true, op: 'mul' }
  if (from === 'MXN' && to === 'USD') return { amount: amount / rateValue, usedRate: true, op: 'div' }
  return null
}

function scorePay(candidate, payRaw) {
  const raw = String(payRaw ?? '')
  const parsed = parsePay(raw)
  if (!raw.trim()) return { score: null, state: 'unstated', parsed }
  if (parsed.kind !== 'amount') return { score: null, state: 'unknown', parsed }
  if (candidate.payFloor == null || !candidate.payCurrency) return { score: null, state: 'no-floor', parsed }
  if (parsed.period !== 'month' || candidate.payPeriod !== 'month') return { score: null, state: 'period', parsed }
  if (parsed.gross == null || candidate.payGross == null) return { score: null, state: 'gross-unstated', parsed }
  if (parsed.gross !== candidate.payGross) return { score: null, state: 'gross-mismatch', parsed }
  if (parsed.currency !== candidate.payCurrency && (!(candidate.rateValue > 0) || !candidate.rateDate)) {
    return { score: null, state: 'currency', parsed }
  }
  const converted = convert(parsed.min, parsed.currency, candidate.payCurrency, candidate.rateValue)
  if (!converted) return { score: null, state: 'currency', parsed }
  const meets = cents(converted.amount) >= cents(candidate.payFloor)
  let formula = ''
  if (converted.usedRate) {
    const op = converted.op === 'div' ? '÷' : '×'
    formula = `${formatAmount(parsed.min)} ${parsed.currency} ${op} ${formatAmount(candidate.rateValue)} = ${formatAmount(converted.amount)} ${candidate.payCurrency} (${candidate.rateDate})`
  }
  return {
    score: meets ? 2 : 0,
    state: meets ? 'meets' : 'below',
    parsed,
    convertedMin: converted.amount,
    usedRate: converted.usedRate,
    formula,
    floor: candidate.payFloor,
    floorCurrency: candidate.payCurrency,
  }
}

function scoreContract(candidateContracts, contractRaw) {
  const raw = String(contractRaw ?? '')
  const postingContracts = parseContracts(raw)
  if (!raw.trim()) return { score: 0, state: 'unstated', postingContracts, hit: [] }
  if (!postingContracts.length) return { score: 0, state: 'unrecognized', postingContracts, hit: [] }
  const hit = postingContracts.filter((item) => candidateContracts.includes(item))
  if (!candidateContracts.length) return { score: 0, state: 'no-candidate', postingContracts, hit }
  return { score: hit.length ? 2 : 0, state: hit.length ? 'match' : 'mismatch', postingContracts, hit }
}

function linesOf(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  return String(value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function scorePosting(input) {
  const candidateIn = input?.candidate || {}
  const postingIn = input?.posting || {}
  const candidate = {
    title: String(candidateIn.title ?? '').trim(),
    stack: String(candidateIn.stack ?? '').trim(),
    years: num(candidateIn.years),
    payFloor: num(candidateIn.payFloor),
    payCurrency: candidateIn.payCurrency || null,
    payPeriod: candidateIn.payPeriod || null,
    payGross: grossOf(candidateIn.payGross),
    contracts: Array.isArray(candidateIn.contracts) ? candidateIn.contracts.filter(Boolean) : [],
    overlapStart: candidateIn.overlapStart || '',
    overlapEnd: candidateIn.overlapEnd || '',
    rateValue: num(candidateIn.rateValue),
    rateDate: String(candidateIn.rateDate ?? '').trim(),
  }
  const mustHave = linesOf(postingIn.mustHave)
  const niceToHave = linesOf(postingIn.niceToHave)
  const overlap = parseOverlap(postingIn.overlapRaw)
  const posting = {
    company: String(postingIn.company ?? '').trim(),
    title: String(postingIn.title ?? '').trim(),
    url: String(postingIn.url ?? '').trim(),
    location: String(postingIn.location ?? '').trim(),
    payRaw: String(postingIn.payRaw ?? '').trim(),
    contractRaw: String(postingIn.contractRaw ?? '').trim(),
    overlapRaw: String(postingIn.overlapRaw ?? '').trim(),
    overlapStart: overlap.start,
    overlapEnd: overlap.end,
    noOverlapRequired: Boolean(postingIn.noOverlapRequired),
    mustHave,
    niceToHave,
    redFlags: {
      fee: Boolean(postingIn.redFlags?.fee),
      repayment: Boolean(postingIn.redFlags?.repayment),
      idBefore: Boolean(postingIn.redFlags?.idBefore),
    },
  }
  const needsYears = mustHave.some((line) => yearMinimum(line) != null)
  const missing = []
  if (!candidate.title) missing.push('title')
  if (!candidate.stack) missing.push('stack')
  if (needsYears && candidate.years == null) missing.push('years')
  if (candidate.payFloor == null) missing.push('payFloor')
  if (!candidate.payCurrency) missing.push('payCurrency')
  if (!candidate.payPeriod) missing.push('payPeriod')
  if (candidate.payGross == null) missing.push('payGross')
  if (!candidate.contracts.length) missing.push('contracts')
  if (!candidate.overlapStart || !candidate.overlapEnd) missing.push('overlap')
  if (!posting.title) missing.push('postingTitle')
  if (!posting.location) missing.push('location')
  if (!posting.payRaw) missing.push('payRaw')
  if (!posting.contractRaw) missing.push('contractRaw')
  if (!posting.mustHave.length) missing.push('mustHave')
  if (!posting.noOverlapRequired && overlap.state === 'empty') missing.push('postingOverlap')

  const role = posting.mustHave.length
    ? scoreRole({
        candidateTitle: candidate.title,
        candidateStack: candidate.stack,
        postingTitle: posting.title,
        mustHaveLines: posting.mustHave,
        yearsClaimed: candidate.years,
      })
    : { score: null, state: 'unstated', titleOk: false, missing: [], yearsDetail: null }
  const location = scoreLocation(posting.location)
  const pay = scorePay(candidate, posting.payRaw)
  const contract = scoreContract(candidate.contracts, posting.contractRaw)
  const hoursBase = posting.noOverlapRequired
    ? { score: 2, state: 'none-required' }
    : overlap.state === 'invalid'
      ? { score: 0, state: 'invalid' }
      : scoreHours(candidate.overlapStart, candidate.overlapEnd, posting.overlapStart, posting.overlapEnd, false)
  const hours = {
    ...hoursBase,
    userStart: candidate.overlapStart,
    userEnd: candidate.overlapEnd,
    postStart: posting.overlapStart,
    postEnd: posting.overlapEnd,
  }
  const flags = ['fee', 'repayment', 'idBefore'].filter((key) => posting.redFlags[key])
  const red = { score: flags.length ? 0 : 2, state: flags.length ? 'hit' : 'none', flags }
  const zeros = [role.score, location.score, pay.score, contract.score].filter((score) => score === 0).length
  const allSix = [role.score, location.score, pay.score, contract.score, hours.score, red.score].every((score) => score === 2)
  let recommendation = 'maybe'
  if (missing.length) recommendation = 'incomplete'
  else if (flags.length) recommendation = 'skip'
  else if (zeros >= 2) recommendation = 'skip'
  else if (allSix) recommendation = 'apply'
  const gaps = {
    must: role.missing,
    nice: niceGaps(posting.niceToHave, candidate.stack),
  }
  const stated = (value) => (value ? value : 'not stated')
  const facts = {
    company: stated(posting.company),
    title: stated(posting.title),
    location: stated(posting.location),
    pay: stated(posting.payRaw),
    contract: stated(posting.contractRaw),
    overlap: posting.noOverlapRequired ? 'not required' : stated(posting.overlapRaw),
  }
  const log = recommendation === 'incomplete'
    ? ''
    : formatLog({
        date: input.today || '',
        company: facts.company,
        title: facts.title,
        url: posting.url,
        pay: facts.pay,
        recommendation,
      })
  return {
    recommendation,
    missing,
    role,
    location,
    pay,
    contract,
    hours,
    red,
    gaps,
    facts,
    log,
    checks: [
      { id: 'role', score: role.score },
      { id: 'location', score: location.score },
      { id: 'pay', score: pay.score },
      { id: 'contract', score: contract.score },
      { id: 'hours', score: hours.score },
      { id: 'red', score: red.score },
    ],
  }
}

export function formatLog({ date, company, title, url, pay, recommendation }) {
  const cell = (value) => String(value ?? '').replaceAll('|', '/')
  return [date, company, title, url || '', pay, recommendation, 'drafted'].map(cell).join(' | ')
}
