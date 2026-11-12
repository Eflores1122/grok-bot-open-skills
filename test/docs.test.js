import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { checkReadme } from '../src/lib/readme-check.js'

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const workflow = readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8')

test('the README points at the site and passes its own section check', () => {
  const head = readme.split('\n').slice(0, 8).join('\n')
  assert.match(head, /https:\/\/eflores1122\.github\.io\/grok-bot-open-skills\/?/)
  const result = checkReadme(readme, {
    scripts: pkg.scripts,
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {}),
    hasLockfile: existsSync(new URL('../package-lock.json', import.meta.url)),
  })
  const failed = result.checks.filter((check) => !check.pass)
  assert.deepEqual(failed.map((check) => ({ id: check.id, quote: check.quote })), [])
})

test('Pages deploys from Actions on main', () => {
  for (const piece of [
    'actions/upload-pages-artifact',
    'actions/deploy-pages',
    'pages: write',
    'id-token: write',
    'workflow_dispatch',
    'branches: [main]',
  ]) {
    assert.ok(workflow.includes(piece), piece)
  }
})

test('CI lints and tests pull requests', () => {
  const ci = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8')
  for (const piece of ['pull_request:', 'npm ci', 'npm run lint', 'npm test', 'node-version: 22']) {
    assert.ok(ci.includes(piece), piece)
  }
})

test('the README does not frame the pack as fintech', () => {
  for (const word of ['fintech', 'BNPL', 'buy now pay later']) {
    assert.equal(readme.toLowerCase().includes(word), false, word)
  }
})
