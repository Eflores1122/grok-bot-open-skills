import { parseContracts, parsePay } from './score.js'

function listAfter(text, startLabel, endLabel) {
  const start = text.indexOf(startLabel)
  if (start === -1) return []
  const from = start + startLabel.length
  const end = endLabel ? text.indexOf(endLabel, from) : text.length
  const chunk = text.slice(from, end === -1 ? text.length : end)
  return chunk
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
}

function between(text, startLabel, endLabel) {
  const start = text.indexOf(startLabel)
  if (start === -1) return ''
  const from = start + startLabel.length
  const end = endLabel ? text.indexOf(endLabel, from) : text.length
  if (endLabel && end === -1) return ''
  return text.slice(from, end).trim()
}

export function parseSyntheticPosting(markdown) {
  const text = String(markdown ?? '')
  const posting = between(text, '## Posting (synthetic)', '## Evidence the candidate stated')
  const evidence = between(text, '## Evidence the candidate stated', '## Bullets before')
  const table = between(text, '## Keyword table', '## Summary (rewritten)')
  const titleLine = (posting.match(/\*\*([^*]+)\*\*/) || [])[1] || ''
  const title = titleLine.split(/\s+[—–-]\s+/)[0].trim()
  const companyLine = posting
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /\(fictional\)/.test(line))
  const company = companyLine ? companyLine.replace(/\s*\(fictional\)\s*$/, '').trim() : ''
  const payMatch = posting.match(/Pay line, as written:\s*\*\*([^*]+)\*\*/)
  const paragraph = posting
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('Remote from anywhere'))
  const parts = paragraph ? paragraph.split(/(?<=[.!?])\s+/) : []
  const location = parts.find((part) => /Remote from anywhere/i.test(part)) || ''
  const overlapRaw = parts.find((part) => /\d{2}:\d{2}/.test(part)) || ''
  const overlap = overlapRaw.match(/(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})/) || []
  const contract = parts.find((part) => /^Contract\b/i.test(part)) || ''
  const evidenceLines = evidence
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2))
  const rows = []
  for (const line of table.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || /^\|\s*-+/.test(trimmed)) continue
    const cells = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
    if (cells[0] === 'Posting term') continue
    rows.push({ term: cells[0], evidence: cells[1], decision: cells[2] })
  }
  return {
    title,
    titleLine,
    company,
    payRaw: payMatch ? payMatch[1].trim() : '',
    location,
    overlapRaw,
    overlapStart: overlap[1] || '',
    overlapEnd: overlap[2] || '',
    contract,
    mustHave: listAfter(posting, 'Must have:', 'Nice to have:'),
    nice: listAfter(posting, 'Nice to have:', null),
    evidenceLines,
    evidenceText: evidenceLines.map((line) => `- ${line}`).join('\n'),
    rows,
  }
}

export function parseSyntheticConstraints(markdown) {
  const items = {}
  for (const line of String(markdown ?? '').split('\n')) {
    const match = line.match(/^- ([^:]+):\s*(.*)$/)
    if (match) items[match[1].trim().toLowerCase()] = match[2].trim()
  }
  const pay = parsePay(items['pay floor'] || '')
  const overlap = (items.overlap || '').match(/(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})/) || []
  return {
    title: items['target title'] || '',
    stack: items.stack || '',
    years: items.years ? Number(items.years) : null,
    contracts: parseContracts(items.contracts || ''),
    payFloor: pay.kind === 'amount' ? pay.min : null,
    payCurrency: pay.currency,
    payPeriod: pay.period,
    payGross: pay.gross,
    where: items.where || '',
    overlapStart: overlap[1] || '',
    overlapEnd: overlap[2] || '',
    dealBreakers: items['deal-breakers'] || '',
  }
}

export function emptyCandidate() {
  return {
    title: '',
    stack: '',
    years: '',
    payFloor: '',
    payCurrency: '',
    payPeriod: '',
    payGross: '',
    contracts: [],
    overlapStart: '',
    overlapEnd: '',
    rateValue: '',
    rateDate: '',
  }
}

export function candidateFromConstraints(constraints) {
  return {
    title: constraints.title,
    stack: constraints.stack,
    years: constraints.years,
    payFloor: constraints.payFloor,
    payCurrency: constraints.payCurrency,
    payPeriod: constraints.payPeriod,
    payGross: constraints.payGross,
    contracts: [...constraints.contracts],
    overlapStart: constraints.overlapStart,
    overlapEnd: constraints.overlapEnd,
    rateValue: '',
    rateDate: '',
  }
}

export function postingInputFromParsed(posting) {
  return {
    company: posting.company,
    title: posting.title,
    url: '',
    location: posting.location,
    payRaw: posting.payRaw,
    contractRaw: posting.contract,
    overlapRaw: posting.overlapRaw,
    noOverlapRequired: false,
    mustHave: [...posting.mustHave],
    niceToHave: [...posting.nice],
    redFlags: { fee: false, repayment: false, idBefore: false },
  }
}
