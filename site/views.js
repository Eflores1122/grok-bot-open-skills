import { agreement, compareTerms } from '../src/lib/compare.js'
import { checkReadme } from '../src/lib/readme-check.js'
import { SOFT_WORDS, scorePosting } from '../src/lib/score.js'
import { buildSourceBlock } from '../src/lib/source-block.js'
import { NEG_WORDS } from '../src/lib/text.js'
import { searchCatalog } from '../src/lib/catalog.js'
import { el } from './dom.js'
import { renderBlocks, splitTitle } from './render-md.js'

const CHECK_LABEL = {
  does: 'checkDoes',
  who: 'checkWho',
  run: 'checkRun',
  scope: 'checkScope',
  stack: 'checkStack',
  license: 'checkLicense',
  order: 'checkOrder',
}

export function createViews(ctx) {
  const { state, t, posting, constraints, skills, readmeRaw, readmeContext, copyText, announce, rerender } = ctx
  const originalTerms = posting.rows.map((row) => row.term).join('\n')
  const originalEvidence = posting.evidenceText

  function doCopy(button, text, label) {
    return copyText(text).then((ok) => {
      const message = ok ? t('copied', { n: text.length }) : t('copyFail')
      announce(message)
      const previous = label
      button.textContent = message
      window.setTimeout(() => {
        if (button.isConnected) button.textContent = previous
      }, 1600)
    })
  }

  function mountCompare({ level }) {
    const section = el('section', { class: 'tool' })
    const titleId = 'compare-title'
    section.append(el(level, { id: titleId }, t('homeTitle')))
    section.append(el('p', { class: 'lead' }, t('homeLead')))
    const results = el('div')
    section.append(results)
    const terms = area(state.compare.terms, 8)
    const evidence = area(state.compare.evidence, 10)
    terms.addEventListener('input', () => {
      state.compare.terms = terms.value
      refresh()
    })
    evidence.addEventListener('input', () => {
      state.compare.evidence = evidence.value
      refresh()
    })
    const restore = el('button', { type: 'button' }, t('restore'))
    restore.addEventListener('click', () => {
      state.compare.terms = originalTerms
      state.compare.evidence = originalEvidence
      terms.value = originalTerms
      evidence.value = originalEvidence
      refresh()
    })
    const again = el('button', { type: 'button', class: 'primary' }, t('compareAction'))
    again.addEventListener('click', refresh)
    section.append(el('div', { class: 'pair' }, [
      el('label', {}, [el('span', {}, t('termLabel')), terms]),
      el('label', {}, [el('span', {}, t('evidenceLabel')), evidence]),
    ]))
    section.append(el('div', { class: 'actions' }, [again, restore]))
    section.append(el('p', { class: 'quiet' }, t('staysHere')))
    const negations = [...NEG_WORDS].join(', ')
    section.append(el('details', {}, [
      el('summary', {}, t('rulesSummary')),
      el('p', {}, t('rulesBody')),
      el('p', { class: 'quiet' }, `${t('negLabel')}: ${negations}`),
    ]))
    refresh()
    return section

    function refresh() {
      results.replaceChildren()
      const list = state.compare.terms.split('\n').map((item) => item.trim()).filter(Boolean)
      const pristine = state.compare.terms === originalTerms && state.compare.evidence === originalEvidence
      if (!list.length) {
        results.append(el('p', {}, t('emptyTerms')))
        return
      }
      const rows = compareTerms(list, state.compare.evidence)
      const use = rows.filter((row) => row.decision === 'use').length
      const caption = el('p', { class: 'caption' }, t('caption', { terms: rows.length, use, drop: rows.length - use }))
      caption.setAttribute('aria-live', 'polite')
      results.append(caption)
      results.append(el('p', { class: 'quiet' }, pristine ? t('sourceFile') : t('sourceEdited')))
      if (pristine) {
        const score = agreement(rows, posting.rows)
        results.append(el('p', { class: 'quiet' }, t('agree', score)))
      }
      const table = el('table', { class: 'result' }, [
        el('thead', {}, el('tr', {}, [
          el('th', { scope: 'col' }, t('colDecision')),
          el('th', { scope: 'col' }, t('colTerm')),
          el('th', { scope: 'col' }, t('colQuote')),
          el('th', { scope: 'col' }, t('colWhy')),
        ])),
        el('tbody', {}, rows.map((row) => el('tr', {}, [
          el('td', { class: row.decision === 'use' ? 'pass' : '' }, row.decision),
          el('td', {}, row.term),
          el('td', {}, row.quote),
          el('td', {}, reasonText(row)),
        ]))),
      ])
      results.append(el('p', { class: 'scroll-hint quiet' }, t('scrollHint')))
      results.append(el('div', { class: 'table-scroll' }, table))
    }

    function reasonText(row) {
      if (row.reason === 'years' || row.reason === 'years-short') return t(`reason.${row.reason}`, row.years)
      return t(`reason.${row.reason}`)
    }
  }

  function mountCatalog(query) {
    const hits = searchCatalog(skills, query)
    const section = el('section', { id: 'catalogo' })
    section.append(el('h2', {}, t('catalogTitle')))
    section.append(el('p', { class: 'lead' }, t('catalogLead', { n: skills.length })))
    section.append(el('p', { class: 'caption' }, query
      ? (hits.length ? t('hits', { shown: hits.length, n: skills.length }) : t('noHits', { q: query, n: skills.length }))
      : t('hits', { shown: skills.length, n: skills.length })))
    const list = el('ul', { class: 'catalog' })
    for (const hit of hits) {
      const skill = hit.skill
      const copyButton = el('button', { type: 'button' }, t('copy'))
      copyButton.addEventListener('click', () => doCopy(copyButton, skill.raw, t('copy')))
      const match = hit.match !== 'all' && query
        ? el('p', { class: 'quiet' }, hit.heading
          ? `${t('appearsIn')}: ${hit.heading}`
          : `${t('match')[hit.match] || hit.match}`)
        : null
      list.append(el('li', {}, [
        el('div', { class: 'row' }, [
          el('a', { class: 'name', href: `#/skills/${skill.folder}` }, skill.folder),
          el('span', { class: 'actions' }, [
            el('a', { href: `#/skills/${skill.folder}` }, t('viewTry')),
            copyButton,
          ]),
        ]),
        el('p', {}, skill.description),
        el('p', { class: 'quiet' }, t('fileStats', { lines: skill.lines, words: skill.words })),
        match,
      ]))
    }
    section.append(list)
    return section
  }

  function mountSkill(skill) {
    const { title, rest } = splitTitle(skill.blocks)
    const page = el('article')
    page.append(el('p', {}, el('a', { href: '#/' }, t('back'))))
    page.append(el('h1', {}, title || skill.folder))
    page.append(el('p', { class: 'ident' }, skill.folder))
    page.append(el('dl', { class: 'meta' }, [
      el('dt', {}, 'name'),
      el('dd', {}, skill.name),
      el('dt', {}, 'description'),
      el('dd', {}, skill.description),
    ]))
    page.append(el('p', { class: 'quiet' }, `${t('fileStats', { lines: skill.lines, words: skill.words })} ${t('copyNote')}`))
    const copyButton = el('button', { type: 'button', class: 'primary' }, t('copy'))
    copyButton.addEventListener('click', () => doCopy(copyButton, skill.raw, t('copy')))
    page.append(el('div', { class: 'actions' }, [
      copyButton,
      el('a', { href: `https://github.com/Eflores1122/grok-bot-open-skills/blob/main/skills/${skill.folder}/SKILL.md` }, t('repoFile')),
    ]))
    const tool = {
      'ats-cv-tailor': () => mountCompare({ level: 'h2' }),
      'remote-job-hunt-mx': () => mountScore({ level: 'h2' }),
      'portfolio-github-polish': () => mountReadme({ level: 'h2' }),
      'open-data-mx-pipeline': () => mountSource({ level: 'h2' }),
    }[skill.folder]
    if (tool) page.append(tool())
    page.append(renderBlocks(rest, el('div', { class: 'prose' })))
    return page
  }

  function mountScore({ level }) {
    const section = el('section', { class: 'tool' })
    section.append(el(level, {}, t('scoreTitle')))
    section.append(el('p', { class: 'lead' }, t('scoreLead')))
    const results = el('div')
    section.append(results)
    const candidate = state.score.candidate
    const post = state.score.posting
    const person = el('fieldset', {}, el('legend', {}, t('personLegend')))
    const personFields = el('div', { class: 'fields' })
    const setPerson = (assign) => (value) => {
      touch()
      assign(value)
      refresh()
    }
    personFields.append(labeled(t('candidateTitle'), textInput(candidate.title, setPerson((value) => { candidate.title = value }))))
    personFields.append(labeled(t('stack'), textInput(candidate.stack, setPerson((value) => { candidate.stack = value }))))
    personFields.append(labeled(t('years'), textInput(candidate.years, setPerson((value) => { candidate.years = value }), { type: 'number', min: '0', inputmode: 'numeric' })))
    personFields.append(labeled(t('payFloor'), textInput(candidate.payFloor, setPerson((value) => { candidate.payFloor = value }), { type: 'number', min: '0', inputmode: 'decimal' })))
    personFields.append(labeled(t('currency'), selectInput(candidate.payCurrency || '', [
      ['', t('choose')],
      ['USD', 'USD'],
      ['MXN', 'MXN'],
      ['EUR', 'EUR'],
    ], setPerson((value) => { candidate.payCurrency = value }))))
    personFields.append(labeled(t('period'), selectInput(candidate.payPeriod || '', [
      ['', t('choose')],
      ['month', t('month')],
      ['year', t('year')],
      ['hour', t('hour')],
    ], setPerson((value) => { candidate.payPeriod = value }))))
    personFields.append(labeled(t('gross'), selectInput(grossValue(candidate.payGross), [
      ['', t('grossUnknown')],
      ['gross', t('grossYes')],
      ['net', t('grossNo')],
    ], setPerson((value) => { candidate.payGross = value }))))
    personFields.append(el('fieldset', { class: 'inner' }, [
      el('legend', {}, t('contracts')),
      check(t('nomina'), candidate.contracts.includes('nomina'), (on) => setContract('nomina', on)),
      check(t('invoice'), candidate.contracts.includes('invoice'), (on) => setContract('invoice', on)),
      check(t('eor'), candidate.contracts.includes('eor'), (on) => setContract('eor', on)),
    ]))
    personFields.append(el('div', { class: 'pair' }, [
      labeled(t('overlapStart'), textInput(candidate.overlapStart, setPerson((value) => { candidate.overlapStart = value }), { type: 'time' })),
      labeled(t('overlapEnd'), textInput(candidate.overlapEnd, setPerson((value) => { candidate.overlapEnd = value }), { type: 'time' })),
    ]))
    personFields.append(el('div', { class: 'pair' }, [
      labeled(t('rate'), textInput(candidate.rateValue, setPerson((value) => { candidate.rateValue = value }), { type: 'number', min: '0', step: 'any', inputmode: 'decimal' })),
      labeled(t('rateDate'), textInput(candidate.rateDate, setPerson((value) => { candidate.rateDate = value }), { type: 'date' })),
    ]))
    person.append(personFields)
    const postingFields = el('div', { class: 'fields' })
    const setPost = (assign) => (value) => {
      assign(value)
      refresh()
    }
    postingFields.append(labeled(t('company'), textInput(post.company, setPost((value) => { post.company = value }))))
    postingFields.append(labeled(t('postingTitle'), textInput(post.title, setPost((value) => { post.title = value }))))
    postingFields.append(labeled(t('url'), textInput(post.url, setPost((value) => { post.url = value }), { type: 'url' })))
    postingFields.append(labeled(t('location'), area(post.location, 2, setPost((value) => { post.location = value }))))
    postingFields.append(labeled(t('payRaw'), area(post.payRaw, 2, setPost((value) => { post.payRaw = value }))))
    postingFields.append(labeled(t('contractRaw'), area(post.contractRaw, 2, setPost((value) => { post.contractRaw = value }))))
    postingFields.append(labeled(t('overlapRaw'), area(post.overlapRaw, 2, setPost((value) => { post.overlapRaw = value }))))
    postingFields.append(check(t('noOverlap'), post.noOverlapRequired, (on) => { post.noOverlapRequired = on; refresh() }))
    postingFields.append(labeled(t('mustHave'), area(post.mustHave.join('\n'), 5, setPost((value) => { post.mustHave = splitLines(value) }))))
    postingFields.append(labeled(t('nice'), area(post.niceToHave.join('\n'), 3, setPost((value) => { post.niceToHave = splitLines(value) }))))
    postingFields.append(el('fieldset', { class: 'inner' }, [
      el('legend', {}, t('redLegend')),
      check(t('fee'), post.redFlags.fee, (on) => { post.redFlags.fee = on; refresh() }),
      check(t('repayment'), post.redFlags.repayment, (on) => { post.redFlags.repayment = on; refresh() }),
      check(t('idBefore'), post.redFlags.idBefore, (on) => { post.redFlags.idBefore = on; refresh() }),
    ]))
    const job = el('fieldset', {}, [el('legend', {}, t('postingLegend')), postingFields])
    section.append(el('div', { class: 'form-grid' }, [person, job]))
    const load = el('button', { type: 'button', class: 'primary' }, t('loadCase'))
    load.addEventListener('click', () => {
      state.score.candidate = { ...ctx.candidateFromConstraints(constraints) }
      state.score.posting = ctx.postingInputFromParsed(posting)
      state.score.showCaseNote = true
      rerender({ scroll: false })
    })
    const clearCandidate = el('button', { type: 'button' }, t('clearCandidate'))
    clearCandidate.addEventListener('click', () => {
      state.score.candidate = ctx.emptyCandidate()
      state.score.showCaseNote = false
      rerender({ scroll: false })
    })
    section.append(el('div', { class: 'actions' }, [load, clearCandidate]))
    section.append(el('details', {}, [
      el('summary', {}, t('softSummary')),
      el('p', { class: 'quiet' }, [...SOFT_WORDS].join(', ')),
    ]))
    refresh()
    return section

    function touch() {
      state.score.showCaseNote = false
    }
    function setContract(id, on) {
      touch()
      const next = new Set(candidate.contracts)
      if (on) next.add(id)
      else next.delete(id)
      candidate.contracts = [...next]
      refresh()
    }
    function refresh() {
      const today = new Date()
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const result = scorePosting({ today: iso, candidate, posting: post })
      results.replaceChildren()
      const banner = el('p', { class: 'recommendation' })
      banner.append(el('strong', { class: result.recommendation === 'apply' ? 'pass' : 'ident' }, result.recommendation))
      banner.append(` ${t(`recommendation.${result.recommendation}`)}`)
      banner.setAttribute('aria-live', 'polite')
      results.append(banner)
      results.append(el('p', { class: 'quiet' }, t('scoreRule')))
      if (state.score.showCaseNote) {
        results.append(el('p', { class: 'quiet' }, t('caseNote')))
        if (constraints.dealBreakers) results.append(el('p', { class: 'quiet' }, `${t('dealBreakers')}: ${constraints.dealBreakers}`))
      }
      if (result.missing.length) {
        results.append(el('p', {}, `${t('missingLead')}: ${result.missing.map((key) => t(`missingField.${key}`)).join(', ')}.`))
      }
      const table = el('table', { class: 'result' })
      table.append(el('caption', {}, t('checksCaption')))
      table.append(el('thead', {}, el('tr', {}, [
        el('th', { scope: 'col' }, t('checksCaption')),
        el('th', { scope: 'col' }, '0 / 2'),
        el('th', { scope: 'col' }, t('colWhy')),
      ])))
      table.append(el('tbody', {}, result.checks.map((check) => el('tr', {}, [
        el('th', { scope: 'row' }, t(`check.${check.id}`)),
        el('td', { class: check.score === 2 ? 'pass' : '' }, check.score == null ? t('unknownScore') : String(check.score)),
        el('td', {}, whyCheck(check.id, result)),
      ]))))
      results.append(el('p', { class: 'scroll-hint quiet' }, t('scrollHint')))
      results.append(el('div', { class: 'table-scroll' }, table))
      results.append(el('h3', {}, t('factsTitle')))
      results.append(el('dl', { class: 'meta' }, [
        el('dt', {}, t('company')), el('dd', {}, result.facts.company),
        el('dt', {}, t('postingTitle')), el('dd', {}, result.facts.title),
        el('dt', {}, t('location')), el('dd', {}, result.facts.location),
        el('dt', {}, t('payRaw')), el('dd', {}, result.facts.pay),
        el('dt', {}, t('contractRaw')), el('dd', {}, result.facts.contract),
        el('dt', {}, t('overlapRaw')), el('dd', {}, result.facts.overlap),
      ]))
      results.append(el('h3', {}, t('gapsTitle')))
      const gaps = [...result.gaps.must, ...result.gaps.nice]
      results.append(gaps.length ? el('ul', {}, gaps.map((line) => el('li', {}, line))) : el('p', {}, t('gapsNone')))
      results.append(el('p', { class: 'quiet' }, t('gapsNote')))
      results.append(el('h3', {}, t('logTitle')))
      if (result.log) {
        results.append(el('pre', {}, el('code', {}, result.log)))
        const copyLog = el('button', { type: 'button' }, t('copyLog'))
        copyLog.addEventListener('click', () => doCopy(copyLog, result.log, t('copyLog')))
        results.append(el('div', { class: 'actions' }, copyLog))
        results.append(el('p', { class: 'quiet' }, t('logNote')))
      } else {
        results.append(el('p', {}, t('logEmpty')))
      }
    }
  }

  function whyCheck(id, result) {
    if (id === 'role') {
      if (result.role.state === 'unstated') return t('roleEmpty')
      if (result.role.score === 2) return t('roleOk', { years: result.role.yearsDetail })
      const parts = []
      if (!result.role.titleOk && state.score.candidate.title) parts.push(t('roleTitle'))
      if (result.role.yearsDetail && (result.role.yearsDetail.claimed == null || result.role.yearsDetail.claimed < result.role.yearsDetail.required)) {
        parts.push(t('roleYears', result.role.yearsDetail))
      }
      if (result.role.missing.length) parts.push(`${t('roleMissing')}: ${result.role.missing.join(' · ')}`)
      return parts.join(' ') || t('roleEmpty')
    }
    if (id === 'location') return t(`locationState.${result.location.state}`)
    if (id === 'pay') return payText(result.pay)
    if (id === 'contract') {
      const base = t(`contractState.${result.contract.state}`)
      return result.contract.postingContracts.length ? `${base} ${result.contract.postingContracts.join(', ')}.` : base
    }
    if (id === 'hours') {
      const base = t(`hoursState.${result.hours.state}`)
      if (result.hours.userStart && result.hours.postStart && (result.hours.state === 'covers' || result.hours.state === 'short')) {
        return `${base} ${result.hours.userStart}/${result.hours.userEnd} · ${result.hours.postStart}/${result.hours.postEnd}`
      }
      return base
    }
    return result.red.state === 'hit' ? t('redHit') : t('redNone')
  }

  function payText(pay) {
    let text = t(`payState.${pay.state}`)
    if ((pay.state === 'meets' || pay.state === 'below') && pay.parsed) {
      text += ` ${pay.parsed.min} ${pay.parsed.currency} / ${pay.floor} ${pay.floorCurrency}.`
    }
    if (pay.formula) text += ` ${pay.formula}. ${t('formulaNote')}`
    return text
  }

  function mountReadme({ level }) {
    const section = el('section', { class: 'tool' })
    section.append(el(level, {}, t('readmeTitle')))
    section.append(el('p', { class: 'lead' }, t('readmeLead')))
    section.append(readmeTable(checkReadme(readmeRaw, readmeContext).checks))
    section.append(el('p', { class: 'quiet' }, t('screenshotNote')))
    const pasted = area(state.readmePaste, 8, (value) => { state.readmePaste = value })
    const run = el('button', { type: 'button', class: 'primary' }, t('review'))
    const extra = el('div')
    run.addEventListener('click', () => {
      state.readmeSubmitted = state.readmePaste
      drawExtra()
    })
    section.append(el('h3', {}, t('pasteTitle')))
    section.append(labeled(t('pasteLabel'), pasted))
    section.append(el('div', { class: 'actions' }, run))
    section.append(extra)
    if (state.readmeSubmitted) drawExtra()
    return section

    function drawExtra() {
      extra.replaceChildren()
      if (!state.readmeSubmitted.trim()) return
      extra.append(readmeTable(checkReadme(state.readmeSubmitted, readmeContext).checks))
    }
  }

  function readmeTable(checks) {
    const passed = checks.filter((check) => check.pass).length
    const wrap = el('div')
    wrap.append(el('p', { class: 'caption' }, t('readmeCount', { pass: passed, total: checks.length })))
    wrap.append(el('p', { class: 'scroll-hint quiet' }, t('scrollHint')))
    wrap.append(el('div', { class: 'table-scroll' }, el('table', { class: 'result' }, [
      el('thead', {}, el('tr', {}, [
        el('th', { scope: 'col' }, t('checksCaption')),
        el('th', { scope: 'col' }, t('colDecision')),
        el('th', { scope: 'col' }, t('colQuote')),
      ])),
      el('tbody', {}, checks.map((check) => el('tr', {}, [
        el('th', { scope: 'row' }, t(CHECK_LABEL[check.id])),
        el('td', { class: check.pass ? 'pass' : '' }, check.pass ? t('pass') : t('fail')),
        el('td', {}, el('pre', { class: 'quote' }, el('code', {}, check.quote || ''))),
      ]))),
    ])))
    return wrap
  }

  function mountSource({ level }) {
    const section = el('section', { class: 'tool' })
    section.append(el(level, {}, t('sourceTitle')))
    section.append(el('p', { class: 'lead' }, t('sourceLead')))
    const form = state.source
    const results = el('div')
    const fields = el('div', { class: 'fields' })
    fields.append(labeled(t('publisher'), textInput(form.publisher, (value) => { form.publisher = value })))
    fields.append(labeled(t('datasetTitle'), textInput(form.title, (value) => { form.title = value })))
    fields.append(labeled(t('datasetUrl'), textInput(form.url, (value) => { form.url = value }, { type: 'url' })))
    fields.append(labeled(t('retrieved'), textInput(form.retrieved, (value) => { form.retrieved = value }, { type: 'date' })))
    fields.append(labeled(t('license'), textInput(form.license, (value) => { form.license = value })))
    fields.append(labeled(t('frequency'), textInput(form.frequency, (value) => { form.frequency = value })))
    fields.append(labeled(t('question'), area(form.question, 3, (value) => { form.question = value })))
    fields.append(check(t('personal'), form.hasPersonalData, (on) => { form.hasPersonalData = on; refresh() }))
    fields.append(check(t('establishment'), form.establishmentLevel, (on) => { form.establishmentLevel = on; refresh() }))
    fields.append(check(t('aggregated'), form.aggregated, (on) => { form.aggregated = on; refresh() }))
    const build = el('button', { type: 'button', class: 'primary' }, t('buildBlock'))
    build.addEventListener('click', () => {
      form.submitted = true
      refresh()
    })
    section.append(fields, el('div', { class: 'actions' }, build), results)
    refresh()
    return section

    function refresh() {
      results.replaceChildren()
      const forced = form.hasPersonalData || (form.establishmentLevel && !form.aggregated)
      if (!form.submitted && !forced) return
      const built = buildSourceBlock({ ...form, lang: state.lang })
      if (built.reason === 'personal') {
        results.append(el('p', { role: 'alert' }, t('stopPersonal')))
        return
      }
      if (built.reason === 'establishment') {
        results.append(el('p', { role: 'alert' }, t('stopEstablishment')))
        return
      }
      if (built.reason === 'invalid') {
        results.append(el('p', { role: 'alert' }, `${t('invalidLead')} ${built.errors.map((key) => t(`fieldError.${key}`)).join(', ')}.`))
        return
      }
      results.append(el('pre', {}, el('code', {}, built.markdown)))
      const copy = el('button', { type: 'button' }, t('copyBlock'))
      copy.addEventListener('click', () => doCopy(copy, built.markdown, t('copyBlock')))
      results.append(el('div', { class: 'actions' }, copy))
    }
  }

  function mountHome(query) {
    const fragment = document.createDocumentFragment()
    fragment.append(mountCompare({ level: 'h1' }))
    fragment.append(el('p', {}, el('a', { href: '#/skills/remote-job-hunt-mx' }, t('scoreLink'))))
    fragment.append(mountCatalog(query))
    return fragment
  }

  function mountMissing(folder) {
    return el('article', {}, [
      el('h1', {}, t('missingSkill')),
      el('p', { class: 'ident' }, folder),
      el('p', {}, el('a', { href: '#/' }, t('back'))),
    ])
  }

  return { mountHome, mountSkill, mountMissing }
}

function labeled(text, control) {
  return el('label', {}, [el('span', {}, text), control])
}

function textInput(value, onInput, attrs = {}) {
  const node = el('input', { type: 'text', ...attrs })
  node.value = value == null ? '' : String(value)
  node.addEventListener('input', () => onInput(node.value))
  return node
}

function area(value, rows, onInput) {
  const node = el('textarea', { rows: String(rows) })
  node.value = value == null ? '' : String(value)
  if (onInput) node.addEventListener('input', () => onInput(node.value))
  return node
}

function selectInput(value, options, onChange) {
  const node = el('select', {}, options.map(([optionValue, label]) => el('option', { value: optionValue }, label)))
  node.value = value || ''
  node.addEventListener('change', () => onChange(node.value))
  return node
}

function check(text, checked, onChange) {
  const input = el('input', { type: 'checkbox' })
  input.checked = Boolean(checked)
  input.addEventListener('change', () => onChange(input.checked))
  return el('label', { class: 'check' }, [input, el('span', {}, text)])
}

function splitLines(value) {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

function grossValue(value) {
  if (value === true || value === 'gross') return 'gross'
  if (value === false || value === 'net') return 'net'
  return ''
}
