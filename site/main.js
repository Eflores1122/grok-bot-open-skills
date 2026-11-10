import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-ext-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import '@fontsource/atkinson-hyperlegible/latin-ext-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-ext-400.css'
import './styles.css'
import { orderSkills, searchCatalog, skillRecord } from '../src/lib/catalog.js'
import {
  candidateFromConstraints,
  emptyCandidate,
  parseSyntheticConstraints,
  parseSyntheticPosting,
  postingInputFromParsed,
} from '../src/lib/example.js'
import { translate } from './i18n.js'
import { clear, el } from './dom.js'
import { createViews } from './views.js'
import readmeRaw from '../README.md?raw'
import pkg from '../package.json'
import postingRaw from '../examples/synthetic-posting.md?raw'
import constraintsRaw from '../examples/synthetic-constraints.md?raw'

const skillModules = import.meta.glob('../skills/*/SKILL.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const posting = parseSyntheticPosting(postingRaw)
const constraints = parseSyntheticConstraints(constraintsRaw)
const skills = orderSkills(
  Object.entries(skillModules).map(([path, raw]) => skillRecord({
    folder: path.match(/skills\/([^/]+)\/SKILL\.md$/)[1],
    raw,
  })),
  readmeRaw,
)

const state = {
  lang: loadLang(),
  compare: {
    terms: posting.rows.map((row) => row.term).join('\n'),
    evidence: posting.evidenceText,
  },
  score: {
    candidate: emptyCandidate(),
    posting: postingInputFromParsed(posting),
    showCaseNote: false,
  },
  source: {
    publisher: '',
    title: '',
    url: '',
    retrieved: '',
    license: '',
    frequency: '',
    question: '',
    hasPersonalData: false,
    establishmentLevel: false,
    aggregated: false,
    submitted: false,
  },
  readmePaste: '',
  readmeSubmitted: '',
}

const hasLockfile = __HAS_LOCKFILE__
const input = document.getElementById('q')
const main = document.getElementById('contenido')
const t = (path, vars) => translate(state.lang, path, vars)

const views = createViews({
  state,
  t,
  posting,
  constraints,
  skills,
  readmeRaw,
  readmeContext: {
    scripts: pkg.scripts,
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {}),
    hasLockfile,
  },
  copyText,
  announce,
  rerender: (options) => renderMain(options),
  candidateFromConstraints,
  emptyCandidate,
  postingInputFromParsed,
})

document.getElementById('lang-es').addEventListener('click', () => setLang('es'))
document.getElementById('lang-en').addEventListener('click', () => setLang('en'))
document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const hits = searchCatalog(skills, input.value.trim())
  if (hits.length === 1) location.hash = `#/skills/${hits[0].skill.folder}`
})
input.addEventListener('input', () => {
  const next = input.value.trim() ? `#/buscar/${encodeURIComponent(input.value.trim())}` : '#/'
  if (parseRoute().name !== 'home') {
    location.hash = next
    return
  }
  if ((location.hash || '#/') !== next) history.replaceState(null, '', next)
  renderMain({ scroll: false })
})
window.addEventListener('hashchange', () => {
  const route = parseRoute()
  if (route.name === 'home' && document.activeElement !== input) input.value = route.q
  renderMain({ scroll: true })
})
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return
  event.preventDefault()
  input.focus()
})

const initial = parseRoute()
if (initial.name === 'home') input.value = initial.q
applyChrome()
renderMain({ scroll: false })

function setLang(lang) {
  state.lang = lang
  try { localStorage.setItem('gbos-lang', lang) } catch { /* keep the choice for this visit */ }
  applyChrome()
  renderMain({ scroll: false })
}

function applyChrome() {
  document.documentElement.lang = state.lang
  document.getElementById('skip').textContent = t('skip')
  document.getElementById('search-label').textContent = t('searchLabel')
  input.placeholder = t('searchPlaceholder')
  document.getElementById('lang').setAttribute('aria-label', t('langGroup'))
  document.getElementById('lang-es').setAttribute('aria-pressed', String(state.lang === 'es'))
  document.getElementById('lang-en').setAttribute('aria-pressed', String(state.lang === 'en'))
  const footer = document.getElementById('footer')
  clear(footer)
  footer.append(
    el('p', {}, t('notAffiliated')),
    el('p', {}, [
      el('a', { href: 'https://github.com/Eflores1122' }, t('footerGithub')),
      ' · ',
      el('a', { href: 'https://github.com/Eflores1122/grok-bot-open-skills' }, t('footerRepo')),
    ]),
    el('p', {}, t('colophon')),
  )
}

function renderMain({ scroll = true } = {}) {
  const y = window.scrollY
  const route = parseRoute()
  clear(main)
  if (route.name === 'skill') {
    const skill = skills.find((item) => item.folder === route.folder)
    main.append(skill ? views.mountSkill(skill) : views.mountMissing(route.folder))
    document.title = `${skill ? skill.folder : route.folder} · grok-bot-open-skills`
  } else {
    main.append(views.mountHome(input.value.trim()))
    document.title = `${t('homeTitle')} · grok-bot-open-skills`
  }
  if (route.name === 'home' && input.value.trim()) {
    document.getElementById('catalogo')?.scrollIntoView({ block: 'start' })
  } else if (scroll) window.scrollTo(0, 0)
  else window.scrollTo(0, y)
}

function parseRoute() {
  const path = decodeURIComponent((location.hash || '#/').replace(/^#/, '') || '/')
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'skills' && parts[1]) return { name: 'skill', folder: parts[1], q: '' }
  if (parts[0] === 'buscar') return { name: 'home', q: parts.slice(1).join('/') }
  return { name: 'home', q: '' }
}

function loadLang() {
  try {
    return localStorage.getItem('gbos-lang') === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function announce(message) {
  const status = document.getElementById('status')
  status.textContent = ''
  window.setTimeout(() => { status.textContent = message }, 30)
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-1000px'
    document.body.append(area)
    area.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    area.remove()
    return ok
  }
}
