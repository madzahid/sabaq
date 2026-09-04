/**
 * Pre-compresses public/data/quran.sqlite into quran.sqlite.gz.
 *
 * Cloudflare decides what to compress from the Content-Type, and a .sqlite has
 * no type it recognises — so the 8.5 MB database was being served RAW while
 * the .wasm beside it got zstd. Measured on the live site: a cold load of the
 * database took 10.1 seconds.
 *
 * The file gzips 4.08x, to 2.08 MB. Rather than argue with the edge about
 * content types, the compressed file is shipped as a first-class asset and
 * inflated in the browser with DecompressionStream. That is deterministic: it
 * cannot be undone by a CDN setting, and it works the same on any host.
 *
 * The uncompressed file is still emitted for the native build, where the
 * database is read from disk and there is nothing to gain by compressing it.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { gzipSync, constants } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public/data/quran.sqlite')

if (!existsSync(src)) {
  console.error('public/data/quran.sqlite not found — run npm run pipeline first')
  process.exit(1)
}

const raw = readFileSync(src)
// Level 9: this runs once per build, and every byte is paid for by a reader on
// a phone somewhere. The extra seconds here are the cheapest in the project.
const gz = gzipSync(raw, { level: constants.Z_BEST_COMPRESSION })
writeFileSync(join(root, 'public/data/quran.sqlite.gz'), gz)

const mb = (n) => (n / 1048576).toFixed(2)
console.log(
  `quran.sqlite.gz: ${mb(raw.length)} MB -> ${mb(gz.length)} MB ` +
  `(${(raw.length / gz.length).toFixed(2)}x)`,
)
