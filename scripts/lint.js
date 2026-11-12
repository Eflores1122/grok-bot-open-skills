import { readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const skip = new Set(['node_modules', 'dist', '.git'])

function walk(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) files.push(...walk(path))
    else if (name.endsWith('.js')) files.push(path)
  }
  return files
}

const files = walk(root)
if (!files.length) {
  process.stderr.write('lint: no JavaScript files found\n')
  process.exit(1)
}

let failed = 0
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) {
    failed += 1
    process.stderr.write(result.stderr || result.stdout || `${file} failed to parse\n`)
  }
}

if (failed) {
  process.stderr.write(`lint: ${failed} file(s) failed node --check\n`)
  process.exit(1)
}

process.stdout.write(`lint: ${files.length} JavaScript files parsed\n`)
