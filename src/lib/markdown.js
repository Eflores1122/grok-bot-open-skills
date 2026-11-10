export function parseMarkdown(src) {
  const lines = String(src ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (line.trim() === '') {
      index += 1
      continue
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const buf = []
      index += 1
      while (index < lines.length && !lines[index].startsWith('```')) {
        buf.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push({ type: 'code', lang, text: buf.join('\n') })
      continue
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        children: parseInline(heading[2].trim()),
      })
      index += 1
      continue
    }
    if (line.trim().startsWith('|') && index + 1 < lines.length && /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())) {
      const header = splitRow(line).map(parseInline)
      index += 2
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(splitRow(lines[index]).map(parseInline))
        index += 1
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }
    if (/^\s*(?:[-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line)
      const items = []
      while (index < lines.length && /^\s*(?:[-*]|\d+\.)\s+/.test(lines[index])) {
        const itemText = lines[index].replace(/^\s*(?:[-*]|\d+\.)\s+/, '')
        items.push({ children: [{ type: 'paragraph', children: parseInline(itemText) }] })
        index += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    if (line.startsWith('>')) {
      const buf = []
      while (index < lines.length && lines[index].startsWith('>')) {
        buf.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'blockquote', children: parseMarkdown(buf.join('\n')) })
      continue
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }
    const buf = [line]
    index += 1
    while (index < lines.length && lines[index].trim() !== '' && !isBlockStart(lines, index)) {
      buf.push(lines[index])
      index += 1
    }
    blocks.push({ type: 'paragraph', children: parseInline(buf.join(' ')) })
  }
  return blocks
}

function isBlockStart(lines, index) {
  const line = lines[index]
  if (line.startsWith('```')) return true
  if (/^(#{1,6})\s+/.test(line)) return true
  if (line.trim().startsWith('|') && index + 1 < lines.length && /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())) {
    return true
  }
  if (/^\s*(?:[-*]|\d+\.)\s+/.test(line)) return true
  if (line.startsWith('>')) return true
  if (/^(-{3,}|\*{3,})$/.test(line.trim())) return true
  return false
}

function splitRow(line) {
  let row = line.trim()
  if (row.startsWith('|')) row = row.slice(1)
  if (row.endsWith('|')) row = row.slice(0, -1)
  return row.split('|').map((cell) => cell.trim())
}

export function parseInline(text) {
  const out = []
  let index = 0
  let buf = ''
  const flush = () => {
    if (buf) {
      out.push({ type: 'text', text: buf })
      buf = ''
    }
  }
  while (index < text.length) {
    if (text[index] === '`') {
      const end = text.indexOf('`', index + 1)
      if (end !== -1) {
        flush()
        out.push({ type: 'code', text: text.slice(index + 1, end) })
        index = end + 1
        continue
      }
    }
    if (text.startsWith('**', index)) {
      const end = text.indexOf('**', index + 2)
      if (end !== -1) {
        flush()
        out.push({ type: 'strong', children: parseInline(text.slice(index + 2, end)) })
        index = end + 2
        continue
      }
    }
    if (text[index] === '[') {
      const close = text.indexOf(']', index + 1)
      if (close !== -1 && text[close + 1] === '(') {
        const end = text.indexOf(')', close + 2)
        if (end !== -1) {
          flush()
          out.push({
            type: 'link',
            href: text.slice(close + 2, end),
            children: parseInline(text.slice(index + 1, close)),
          })
          index = end + 1
          continue
        }
      }
    }
    buf += text[index]
    index += 1
  }
  flush()
  return out
}

export function inlineText(nodes) {
  return (nodes || [])
    .map((node) => {
      if (node.type === 'text' || node.type === 'code') return node.text
      if (node.children) return inlineText(node.children)
      return ''
    })
    .join('')
}

export function headingList(blocks, acc = []) {
  for (const block of blocks) {
    if (block.type === 'heading') acc.push(inlineText(block.children))
    if (block.type === 'blockquote') headingList(block.children, acc)
  }
  return acc
}
