import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'

const hasLock = existsSync(new URL('./package-lock.json', import.meta.url))

export default defineConfig({
  root: 'site',
  base: '/grok-bot-open-skills/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    fs: { allow: ['..'] },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  define: {
    __HAS_LOCKFILE__: JSON.stringify(hasLock),
  },
})
