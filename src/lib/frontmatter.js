export function splitFrontmatter(raw) {
  const text = String(raw ?? '').replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) return { data: {}, body: text }
  const end = text.indexOf('\n---\n', 4)
  if (end === -1) return { data: {}, body: text }
  return {
    data: parseFrontmatter(text.slice(4, end)),
    body: text.slice(end + 5),
  }
}

export function parseFrontmatter(yaml) {
  const data = {}
  const lines = String(yaml ?? '').replace(/\r\n/g, '\n').split('\n')
  let index = 0
  while (index < lines.length) {
    const match = lines[index].match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) {
      index += 1
      continue
    }
    const key = match[1]
    const value = match[2]
    if (value === '>-' || value === '>' || value === '|' || value === '|-') {
      const fold = value.startsWith('>')
      const parts = []
      index += 1
      while (index < lines.length && (lines[index].startsWith(' ') || lines[index].startsWith('\t'))) {
        parts.push(lines[index].trim())
        index += 1
      }
      data[key] = fold ? parts.join(' ').replace(/\s+/g, ' ').trim() : parts.join('\n').trim()
      continue
    }
    data[key] = value.replace(/^["']|["']$/g, '')
    index += 1
  }
  return data
}
