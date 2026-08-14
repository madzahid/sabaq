/**
 * sql.js ships its wasm next to its JS. Vite will not bundle it, so it must be
 * copied into public/ before every build. Doing this by hand is a step someone
 * forgets exactly once, on the day of a release.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const from = join(root, 'node_modules/sql.js/dist/sql-wasm-browser.wasm')
const to = join(root, 'public/sql-wasm-browser.wasm')

if (!existsSync(from)) {
  console.error('sql.js wasm not found — run npm install first')
  process.exit(1)
}
mkdirSync(dirname(to), { recursive: true })
copyFileSync(from, to)
