import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { orderSkills, searchCatalog, skillRecord } from '../src/lib/catalog.js'
import { inlineText, parseMarkdown } from '../src/lib/markdown.js'
import { splitFrontmatter } from '../src/lib/frontmatter.js'

const root = new URL('..', import.meta.url)
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')

function skills() {
  return readdirSync(new URL('../skills', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => skillRecord({
      folder: entry.name,
      raw: readFileSync(new URL(`../skills/${entry.name}/SKILL.md`, import.meta.url), 'utf8'),
    }))
}

test('every skill folder matches its frontmatter', () => {
  const records = skills()
  assert.equal(records.length, 4)
  for (const skill of records) {
    assert.equal(skill.nameMatchesFolder, true, skill.folder)
    assert.equal(skill.description.includes('\n'), false)
    assert.equal(skill.description.includes('>-'), false)
    assert.ok(skill.lines > 20)
    assert.ok(skill.words > 50)
    assert.ok(readme.includes(skill.folder), skill.folder)
  }
})

test('search reads name, description, headings, and body', () => {
  const ordered = orderSkills(skills(), readme)
  assert.deepEqual(ordered.map((skill) => skill.folder), [
    'remote-job-hunt-mx',
    'ats-cv-tailor',
    'portfolio-github-polish',
    'open-data-mx-pipeline',
  ])
  assert.equal(searchCatalog(ordered, '').length, 4)
  assert.deepEqual(searchCatalog(ordered, 'ISR').map((hit) => hit.skill.folder), ['remote-job-hunt-mx'])
  assert.deepEqual(searchCatalog(ordered, 'denue').map((hit) => hit.skill.folder), ['open-data-mx-pipeline'])
  assert.equal(searchCatalog(ordered, 'pinned')[0].match, 'description')
  assert.equal(searchCatalog(ordered, 'CVEGEO')[0].match, 'body')
  assert.equal(searchCatalog(ordered, 'zzzz-no').length, 0)
  const ats = searchCatalog(ordered, 'ats').map((hit) => hit.skill.folder).sort()
  assert.deepEqual(ats, ['ats-cv-tailor', 'portfolio-github-polish', 'remote-job-hunt-mx'])
})

test('markdown keeps headings, the score table, fences, and links', () => {
  for (const skill of skills()) {
    const { body } = splitFrontmatter(skill.raw)
    const headings = [...body.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((match) => ({
      level: match[1].length,
      text: match[2].trim(),
    }))
    const blocks = parseMarkdown(body)
    const parsed = []
    const walk = (list) => {
      for (const block of list) {
        if (block.type === 'heading') parsed.push({ level: block.level, text: inlineText(block.children) })
        if (block.type === 'blockquote') walk(block.children)
      }
    }
    walk(blocks)
    assert.deepEqual(parsed, headings, skill.folder)
  }
  const remote = skills().find((skill) => skill.folder === 'remote-job-hunt-mx')
  const table = remote.blocks.find((block) => block.type === 'table')
  assert.equal(table.rows.length, 6)
  assert.equal(inlineText(table.header[0]), 'Check')
  const fence = remote.blocks.find((block) => block.type === 'code')
  assert.match(fence.text, /date \| company \| title/)
  const openData = skills().find((skill) => skill.folder === 'open-data-mx-pipeline')
  const hrefs = []
  const walkLinks = (nodes) => {
    for (const node of nodes || []) {
      if (node.type === 'link') hrefs.push(node.href)
      if (node.children) walkLinks(node.children)
      if (node.items) node.items.forEach((item) => walkLinks(item.children))
      if (node.rows) node.rows.forEach((row) => row.forEach((cell) => walkLinks(cell)))
      if (node.header) node.header.forEach((cell) => walkLinks(cell))
    }
  }
  walkLinks(openData.blocks)
  assert.ok(hrefs.includes('https://www.datos.gob.mx'))
  assert.ok(hrefs.includes('https://www.data.cdmx.gob.mx'))
})
