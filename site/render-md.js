import { el } from './dom.js'
import { inlineText } from '../src/lib/markdown.js'

const SKILL_PATH = /^skills\/([a-z0-9-]+)\/SKILL\.md$/

export function renderBlocks(blocks, parent) {
  for (const block of blocks) parent.append(renderBlock(block))
  return parent
}

export function splitTitle(blocks) {
  if (blocks[0]?.type === 'heading' && blocks[0].level === 1) {
    return { title: inlineText(blocks[0].children), rest: blocks.slice(1) }
  }
  return { title: '', rest: blocks }
}

function renderBlock(block) {
  if (block.type === 'heading') {
    const node = el(`h${Math.min(block.level, 6)}`)
    renderInline(block.children, node)
    return node
  }
  if (block.type === 'paragraph') {
    const node = el('p')
    renderInline(block.children, node)
    return node
  }
  if (block.type === 'list') {
    const node = el(block.ordered ? 'ol' : 'ul')
    for (const item of block.items) {
      const li = el('li')
      renderBlocks(item.children, li)
      node.append(li)
    }
    return node
  }
  if (block.type === 'code') {
    const code = el('code', {}, block.text)
    return el('pre', {}, code)
  }
  if (block.type === 'table') {
    const head = el('tr', {}, block.header.map((cell) => {
      const th = el('th', { scope: 'col' })
      renderInline(cell, th)
      return th
    }))
    const body = el('tbody', {}, block.rows.map((row) => el('tr', {}, row.map((cell) => {
      const td = el('td')
      renderInline(cell, td)
      return td
    }))))
    return el('div', { class: 'table-scroll' }, el('table', {}, [el('thead', {}, head), body]))
  }
  if (block.type === 'blockquote') {
    const node = el('blockquote')
    renderBlocks(block.children, node)
    return node
  }
  if (block.type === 'hr') return el('hr')
  return el('p')
}

function renderInline(nodes, parent) {
  for (const node of nodes || []) {
    if (node.type === 'text') parent.append(document.createTextNode(node.text))
    else if (node.type === 'code') parent.append(codeNode(node.text))
    else if (node.type === 'strong') {
      const strong = el('strong')
      renderInline(node.children, strong)
      parent.append(strong)
    } else if (node.type === 'link') {
      const link = el('a', externalAttrs(node.href))
      renderInline(node.children, link)
      parent.append(link)
    }
  }
}

function codeNode(text) {
  const match = text.match(SKILL_PATH)
  const code = el('code', {}, text)
  if (!match) return code
  return el('a', { href: `#/skills/${match[1]}` }, code)
}

function externalAttrs(href) {
  if (/^https?:/i.test(href)) return { href, target: '_blank', rel: 'noopener noreferrer' }
  return { href }
}
