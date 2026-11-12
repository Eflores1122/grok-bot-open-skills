import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = new URL('..', import.meta.url)
const headings = [
  'Who it is for',
  'How to use it',
  'Example',
  'What it does not do',
  'License',
]

const secretPatterns = [
  { name: 'email', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { name: 'curp', re: /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/ },
  { name: 'phone', re: /\+52[\s.-]?\d|\b(?:tel|phone|whatsapp)\s*[:=]/i },
  { name: 'private-key', re: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/ },
  { name: 'aws-key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'github-token', re: /\b(?:ghp_|github_pat_|gho_|ghu_|ghs_)[A-Za-z0-9_]{10,}/ },
  { name: 'slack-token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'assigned-secret', re: /\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*['"][^'"]{8,}['"]/i },
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

test('every skill README uses the same sections and a fictional example', () => {
  const folders = readdirSync(new URL('../skills', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
  assert.equal(folders.length, 4)
  for (const folder of folders) {
    const text = readFileSync(new URL(`../skills/${folder}/README.md`, import.meta.url), 'utf8')
    assert.match(text, /^#\s+\S/m, folder)
    assert.match(text, new RegExp(folder), folder)
    assert.match(text, /fictional/i, folder)
    assert.match(text, /SKILL\.md/, folder)
    const indexes = headings.map((heading) => text.search(new RegExp(`^## ${heading}$`, 'm')))
    assert.deepEqual(indexes.map((index, i) => (index === -1 ? headings[i] : 'ok')), indexes.map(() => 'ok'), folder)
    assert.ok(indexes.every((index, position) => position === 0 || index > indexes[position - 1]), folder)
    const exampleStart = text.indexOf('## Example')
    const exampleEnd = text.indexOf('## What it does not do')
    assert.ok(exampleEnd - exampleStart > 200, folder)
  }
})

test('tracked text has no emails, CURP values, phone numbers, or secrets', () => {
  const files = walk(root.pathname).filter((path) => /\.(md|js|html|json|yml|css|svg|txt)$/.test(path))
  assert.ok(files.length > 10)
  const hits = []
  for (const path of files) {
    const text = readFileSync(path, 'utf8')
    for (const pattern of secretPatterns) {
      const match = text.match(pattern.re)
      if (match) hits.push(`${path}: ${pattern.name}: ${match[0]}`)
    }
  }
  assert.deepEqual(hits, [])
})
