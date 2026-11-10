const COPY = {
  es: {
    heading: '## Fuente',
    editor: 'Editor',
    title: 'Título',
    url: 'URL',
    retrieved: 'Fecha de descarga',
    license: 'Licencia del editor',
    frequency: 'Frecuencia',
    frequencyEmpty: 'no la dice',
    question: 'Pregunta',
    people: 'Microdato de personas',
    peopleNo: 'no',
    roster: 'Padrón de establecimientos',
    rosterNo: 'no',
    rosterYes: 'sí, salida agregada',
    footer: 'El código puede ir en MIT. Estos datos siguen la licencia del editor. El pipeline no se actualiza solo.',
  },
  en: {
    heading: '## Source',
    editor: 'Publisher',
    title: 'Title',
    url: 'URL',
    retrieved: 'Retrieval date',
    license: 'Publisher license',
    frequency: 'Update frequency',
    frequencyEmpty: 'the page does not say',
    question: 'Question',
    people: 'Person-level rows',
    peopleNo: 'no',
    roster: 'Establishment roster',
    rosterNo: 'no',
    rosterYes: 'yes, aggregated output',
    footer: 'The code can be MIT. This data stays under the publisher license. The pipeline does not refresh itself.',
  },
}

export function buildSourceBlock(input = {}) {
  const lang = input.lang === 'en' ? 'en' : 'es'
  const copy = COPY[lang]
  if (input.hasPersonalData) return { stopped: true, reason: 'personal', errors: [], markdown: '' }
  if (input.establishmentLevel && !input.aggregated) {
    return { stopped: true, reason: 'establishment', errors: [], markdown: '' }
  }
  const errors = []
  for (const key of ['publisher', 'title', 'url', 'retrieved', 'license', 'question']) {
    if (!String(input[key] ?? '').trim()) errors.push(key)
  }
  const url = String(input.url ?? '').trim()
  if (url && !/^https?:\/\//i.test(url)) errors.push('url-scheme')
  const retrieved = String(input.retrieved ?? '').trim()
  if (retrieved && !/^\d{4}-\d{2}-\d{2}$/.test(retrieved)) errors.push('date')
  if (errors.length) return { stopped: false, reason: 'invalid', errors, markdown: '' }
  const frequency = String(input.frequency ?? '').trim() || copy.frequencyEmpty
  const lines = [
    copy.heading,
    '',
    `- ${copy.editor}: ${String(input.publisher).trim()}`,
    `- ${copy.title}: ${String(input.title).trim()}`,
    `- ${copy.url}: ${url}`,
    `- ${copy.retrieved}: ${retrieved}`,
    `- ${copy.license}: ${String(input.license).trim()}`,
    `- ${copy.frequency}: ${frequency}`,
    `- ${copy.question}: ${String(input.question).trim()}`,
    `- ${copy.people}: ${copy.peopleNo}`,
    `- ${copy.roster}: ${input.establishmentLevel ? copy.rosterYes : copy.rosterNo}`,
    '',
    copy.footer,
  ]
  return { stopped: false, reason: 'ok', errors: [], markdown: lines.join('\n') }
}
