import { headingList, inlineText, parseMarkdown } from './markdown.js'
import { splitFrontmatter } from './frontmatter.js'
import { fold, textMatches } from './text.js'

export function lineCount(raw) {
  const text = String(raw ?? '')
  if (!text) return 0
  const parts = text.split('\n')
  return text.endsWith('\n') ? parts.length - 1 : parts.length
}

export function wordCount(raw) {
  return String(raw ?? '')
    .split(/\s+/)
    .filter(Boolean).length
}

export function skillRecord({ folder, raw }) {
  const { data, body } = splitFrontmatter(raw)
  const blocks = parseMarkdown(body)
  return {
    folder,
    name: data.name || '',
    description: data.description || '',
    nameMatchesFolder: data.name === folder,
    raw,
    body,
    headings: headingList(blocks),
    blocks,
    lines: lineCount(raw),
    words: wordCount(raw),
  }
}

export function orderSkills(skills, readme) {
  const position = (name) => {
    const index = readme.indexOf(name)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }
  return [...skills].sort((a, b) => {
    const delta = position(a.folder) - position(b.folder)
    if (delta !== 0) return delta
    return a.folder.localeCompare(b.folder)
  })
}

export function searchCatalog(skills, query) {
  const needle = fold(query).trim()
  if (!needle) return skills.map((skill) => ({ skill, match: 'all', heading: '' }))
  const hits = []
  for (const skill of skills) {
    if (textMatches(skill.name, needle) || textMatches(skill.folder, needle)) {
      hits.push({ skill, match: 'name', heading: '' })
      continue
    }
    if (textMatches(skill.description, needle)) {
      hits.push({ skill, match: 'description', heading: '' })
      continue
    }
    const heading = skill.headings.find((item) => textMatches(item, needle))
    if (heading) {
      hits.push({ skill, match: 'heading', heading })
      continue
    }
    if (textMatches(skill.body, needle)) hits.push({ skill, match: 'body', heading: '' })
  }
  return hits
}

export function firstHeading(skill) {
  const heading = skill.blocks.find((block) => block.type === 'heading' && block.level === 1)
  return heading ? inlineText(heading.children) : skill.folder
}
