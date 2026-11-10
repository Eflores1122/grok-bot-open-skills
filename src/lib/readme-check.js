export const README_HEADINGS = {
  who: /^#{1,6}\s+(Para quién|Who it is for)\b/i,
  run: /^#{1,6}\s+(Correr el sitio|Run the site|How to run)\b/i,
  scope: /^#{1,6}\s+(Qué hace y qué no hace|What it does and what it leaves out)\b/i,
  stack: /^#{1,6}\s+Stack\b/i,
  license: /^#{1,6}\s+License\b/i,
}

function headingIndex(text, regex) {
  return text.split('\n').findIndex((line) => regex.test(line))
}

function sectionAfter(text, regex) {
  const lines = text.split('\n')
  const index = lines.findIndex((line) => regex.test(line))
  if (index === -1) return null
  const body = []
  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    if (/^#{1,6}\s+/.test(lines[cursor])) break
    body.push(lines[cursor])
  }
  return { heading: lines[index], body: body.join('\n').trim(), index }
}

function fences(text) {
  const blocks = []
  const re = /```[^\n]*\n([\s\S]*?)```/g
  let match = re.exec(text)
  while (match) {
    blocks.push(match[1])
    match = re.exec(text)
  }
  return blocks
}

function checkDoes(text) {
  const blocks = text.trim().split(/\n\s*\n/)
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    if (/^https?:\/\/\S+$/.test(trimmed)) continue
    if (trimmed.length >= 40) return { id: 'does', pass: true, quote: trimmed.split('\n')[0] }
  }
  return { id: 'does', pass: false, quote: '' }
}

function checkWho(text) {
  const section = sectionAfter(text, README_HEADINGS.who)
  if (!section || section.body.length < 20) return { id: 'who', pass: false, quote: section?.heading || '' }
  return { id: 'who', pass: true, quote: `${section.heading}\n${section.body.split('\n')[0]}` }
}

function checkRun(text, ctx) {
  const commands = []
  for (const block of fences(text)) {
    for (const line of block.split('\n')) {
      const trimmed = line.trim()
      if (/^npm (ci|test)$/.test(trimmed) || /^npm run [\w:-]+$/.test(trimmed)) commands.push(trimmed)
    }
  }
  if (!commands.length) return { id: 'run', pass: false, quote: '' }
  const bad = []
  for (const command of commands) {
    if (command === 'npm ci' && !ctx.hasLockfile) bad.push(command)
    else if (command === 'npm test' && !ctx.scripts?.test) bad.push(command)
    else if (command.startsWith('npm run ')) {
      const name = command.slice('npm run '.length)
      if (!ctx.scripts?.[name]) bad.push(command)
    }
  }
  return { id: 'run', pass: bad.length === 0, quote: (bad.length ? bad : commands).join('\n') }
}

function checkScope(text) {
  const section = sectionAfter(text, README_HEADINGS.scope)
  if (!section) return { id: 'scope', pass: false, quote: '' }
  const sentence = section.body
    .split(/(?<=[.!?])\s+/)
    .find((part) => /\b(does not|do not|don't|no)\b/i.test(part))
  if (!sentence) return { id: 'scope', pass: false, quote: section.heading }
  return { id: 'scope', pass: true, quote: `${section.heading}\n${sentence}` }
}

function checkStack(text, ctx) {
  const section = sectionAfter(text, README_HEADINGS.stack)
  if (!section) return { id: 'stack', pass: false, quote: '', unknown: [] }
  const packages = [...section.body.matchAll(/`([^`]+)`/g)].map((match) => match[1])
  if (!packages.length) return { id: 'stack', pass: false, quote: section.heading, unknown: [] }
  const known = new Set([...(ctx.dependencies || []), ...(ctx.devDependencies || [])])
  const unknown = packages.filter((name) => !known.has(name))
  return {
    id: 'stack',
    pass: unknown.length === 0,
    quote: `${section.heading}\n${packages.join(', ')}`,
    unknown,
  }
}

function checkLicense(text) {
  const section = sectionAfter(text, README_HEADINGS.license)
  if (!section) return { id: 'license', pass: false, quote: '' }
  const quote = `${section.heading}\n${section.body}`
  return { id: 'license', pass: /\bMIT\b/.test(quote), quote }
}

function checkOrder(text) {
  const ids = ['who', 'run', 'scope', 'stack', 'license']
  const indexes = ids.map((id) => headingIndex(text, README_HEADINGS[id]))
  const pass = indexes.every((index) => index !== -1) && indexes.every((index, position) => position === 0 || index > indexes[position - 1])
  const lines = text.split('\n')
  const quote = indexes
    .map((index, position) => (index === -1 ? ids[position] : lines[index]))
    .join('\n')
  return { id: 'order', pass, quote }
}

export function checkReadme(text, ctx = {}) {
  return {
    checks: [
      checkDoes(text),
      checkWho(text),
      checkRun(text, ctx),
      checkScope(text),
      checkStack(text, ctx),
      checkLicense(text),
      checkOrder(text),
    ],
  }
}
