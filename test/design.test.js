import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { strings } from '../site/i18n.js'

const css = readFileSync(new URL('../site/styles.css', import.meta.url), 'utf8')

function hex(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))
  assert.ok(match, name)
  return match[1]
}

function lin(channel) {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function lum(value) {
  const n = Number.parseInt(value.slice(1), 16)
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

function contrast(a, b) {
  const hi = Math.max(lum(a), lum(b))
  const lo = Math.min(lum(a), lum(b))
  return (hi + 0.05) / (lo + 0.05)
}

test('the accent and the text meet WCAG AA', () => {
  const pairs = [
    ['ink', 'bg'],
    ['ink', 'surface'],
    ['muted', 'bg'],
    ['muted', 'surface'],
    ['on-accent', 'accent'],
    ['accent', 'bg'],
    ['accent', 'surface'],
    ['ink', 'selection'],
  ]
  for (const [front, back] of pairs) {
    const ratio = contrast(hex(front), hex(back))
    assert.ok(ratio >= 4.5, `${front} on ${back} is ${ratio.toFixed(2)}`)
  }
})

test('type and color stay the ones named in the colophon', () => {
  assert.match(css, /Atkinson Hyperlegible/)
  assert.match(css, /IBM Plex Mono/)
  for (const banned of ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair', 'Space Grotesk', 'linear-gradient', 'radial-gradient', 'box-shadow', 'backdrop-filter']) {
    assert.equal(css.includes(banned), false, banned)
  }
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /--radius:\s*2px/)
  const radii = [...css.matchAll(/border-radius:\s*([^;]+)/g)].map((match) => match[1].trim())
  assert.ok(radii.every((value) => value === '2px' || value === 'var(--radius)'))
  const accent = hex('accent')
  assert.ok(strings.es.colophon.includes(accent))
  assert.ok(strings.en.colophon.includes(accent))
})

test('the interface copy has no emoji', () => {
  const emoji = /\p{Extended_Pictographic}/u
  for (const file of readdirSync(new URL('../site', import.meta.url))) {
    if (!file.endsWith('.js') && !file.endsWith('.css') && !file.endsWith('.html')) continue
    const text = readFileSync(new URL(`../site/${file}`, import.meta.url), 'utf8')
    assert.equal(emoji.test(text), false, file)
  }
})
