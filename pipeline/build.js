/**
 * Builds public/data/quran.sqlite from the two QUL databases.
 *
 * Read pipeline/README.md first. The tokeniser here is load-bearing — the
 * 99.89% alignment depends on its exact behaviour. See CLAUDE.md before
 * changing any regex in this file.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const need = [
  join(root, 'data/source/taj-indopak-16-lines.db'),
  join(root, 'data/source/indopak-nastaleeq.db'),
]

for (const f of need) {
  if (!existsSync(f)) {
    console.error(`missing ${f}\nSee pipeline/README.md for where to download it.`)
    process.exit(1)
  }
}

console.log('1/3  aligning tajweed rules onto Indo-Pak words…')
execFileSync('node', [join(root, 'pipeline/lib/align-tajweed.js')], { stdio: 'inherit', cwd: root })

console.log('2/3  writing quran.sqlite…')
execFileSync('python3', [join(root, 'pipeline/lib/write_db.py')], { stdio: 'inherit', cwd: root })

console.log('3/3  verifying…')
execFileSync('python3', [join(root, 'tests/verify_pages.py')], { stdio: 'inherit', cwd: root })
