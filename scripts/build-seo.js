/**
 * Generates public/sitemap.xml and public/robots.txt.
 *
 * Run from prebuild so the sitemap can never drift from PAGE_COUNT — a
 * hand-maintained sitemap listing pages that do not exist is worse than none,
 * and search engines penalise 404s in a sitemap.
 *
 * Every printed page gets an entry. They are all the same HTML shell today
 * (see the note in README under SEO), but they are at least distinct,
 * canonical, linkable addresses, which is the precondition for anything else.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://quranforhifz.com'

// Must match PAGE_COUNT and page_offset in src/db/quran.ts.
const PAGE_COUNT = 548
const PAGE_OFFSET = 1

const today = new Date().toISOString().slice(0, 10)

const urls = [
  { loc: `${SITE}/`, priority: '1.0', freq: 'weekly' },
  { loc: `${SITE}/guide.html`, priority: '0.7', freq: 'monthly' },
  { loc: `${SITE}/about.html`, priority: '0.5', freq: 'monthly' },
]

for (let p = 1; p <= PAGE_COUNT; p++) {
  urls.push({
    loc: `${SITE}/?page=${p + PAGE_OFFSET}`,
    priority: '0.6',
    freq: 'yearly', // the Quran does not change
  })
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`

const robots = `# ${SITE}
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`

mkdirSync(join(ROOT, 'public'), { recursive: true })
writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml)
writeFileSync(join(ROOT, 'public', 'robots.txt'), robots)
console.log(`sitemap.xml: ${urls.length} urls   robots.txt: ok`)
