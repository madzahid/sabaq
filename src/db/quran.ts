import initSqlJs, { type Database } from 'sql.js'
import { JUZ_START_PAGE } from '../data/juzStart'
import type { Line, LineType, Marker, MarkerKind, Page, Word } from '../types'

let db: Database | null = null

/**
 * Difference between the page number printed in the Mushaf and our internal
 * page index. Read from the database, never hardcoded: Taj has printed more
 * than one edition, so this belongs to the data, not to a component.
 *
 * For the modelled copy it is 1 — the printed book numbers its title page as
 * 1 and begins Al-Fatiha on printed page 2. Verified against the scan.
 */
let printedOffset = 0

/** Opens the bundled database. Safe to call repeatedly. */
export async function open(): Promise<void> {
  if (db) return
  const SQL = await initSqlJs({
    locateFile: (f) => `${import.meta.env.BASE_URL}${f}`,
  })
  db = new SQL.Database(await fetchDatabase())

  const row = rowsOf("SELECT value FROM meta WHERE key = 'page_offset'")[0]
  const n = Number(row?.value)
  printedOffset = Number.isInteger(n) ? n : 0
}

/**
 * The database bytes, preferring the pre-compressed copy.
 *
 * The .sqlite is 8.5 MB and Cloudflare will not compress it — a .sqlite has no
 * Content-Type the edge recognises, so it goes out raw while the .wasm beside
 * it is zstd'd. Measured on the live site, a cold fetch took 10.1 seconds.
 *
 * scripts/compress-db.js emits a .gz that is 4.1x smaller, and this inflates it
 * with DecompressionStream — native, streaming, no library. That puts the win
 * in our hands rather than the CDN's.
 *
 * Falls back to the raw file when DecompressionStream is missing or the .gz is
 * not deployed. A slow Mushaf is a nuisance; a Mushaf that will not open is a
 * broken promise, so this path must never be the reason it fails.
 */
async function fetchDatabase(): Promise<Uint8Array> {
  const base = import.meta.env.BASE_URL

  if (typeof DecompressionStream === 'function') {
    try {
      const res = await fetch(`${base}data/quran.sqlite.gz`)
      if (res.ok && res.body) {
        const stream = res.body.pipeThrough(new DecompressionStream('gzip'))
        return new Uint8Array(await new Response(stream).arrayBuffer())
      }
    } catch {
      // fall through to the uncompressed copy
    }
  }

  const res = await fetch(`${base}data/quran.sqlite`)
  if (!res.ok) throw new Error(`quran.sqlite missing (HTTP ${res.status})`)
  return new Uint8Array(await res.arrayBuffer())
}

/** The number printed in the Mushaf for one of our internal pages. */
export function printedPage(page: number): number {
  return page + printedOffset
}

/** Our internal page for a number the reader read off the printed Mushaf. */
export function internalPage(printed: number): number {
  return printed - printedOffset
}

/** First and last page numbers as printed, for input bounds. */
export function printedRange(): [number, number] {
  return [printedPage(1), printedPage(PAGE_COUNT)]
}

function rowsOf(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  if (!db) throw new Error('call open() first')
  const stmt = db.prepare(sql)
  stmt.bind(params as never)
  const out: Record<string, unknown>[] = []
  while (stmt.step()) out.push(stmt.getAsObject())
  stmt.free()
  return out
}

/**
 * QUL embeds the para-division marks inside the ayah-number marker as
 * private-use glyphs: U+F64C الربع, U+F64D النصف, U+F64E الثلاثة.
 *
 * This edition prints those in the MARGIN, not in the line — the printed page
 * shows a plain ayah circle. Left in, the font draws them as a small circled
 * fraction beside the number, which is not on the page being reproduced.
 *
 * Stripped at read time rather than in the database, so the source text stays
 * exactly as QUL published it and the markers table keeps using these glyphs
 * as its authority for where each quarter falls. See pipeline/lib/build_markers.py.
 */
const DIVISION_GLYPHS = /[\uF64C\uF64D\uF64E]/g

function toWord(r: Record<string, unknown>): Word {
  return {
    id: r.id as number,
    surah: r.surah as number,
    ayah: r.ayah as number,
    position: r.position as number,
    text: (r.is_marker as number) === 1
      ? (r.text as string).replace(DIVISION_GLYPHS, '')
      : (r.text as string),
    isMarker: (r.is_marker as number) === 1,
    marks: r.marks ? JSON.parse(r.marks as string) : null,
  }
}

/**
 * One page, ready to render. Words are fetched in a single query and bucketed
 * per line, so a page costs two queries regardless of line count.
 */
export function getPage(page: number): Page | null {
  const meta = rowsOf('SELECT * FROM pages WHERE page = ?', [page])[0]
  if (!meta) return null

  const lineRows = rowsOf(
    'SELECT * FROM lines WHERE page = ? ORDER BY line_no', [page])

  const first = Math.min(...lineRows.map(r => (r.first_word_id as number) ?? Infinity))
  const last = Math.max(...lineRows.map(r => (r.last_word_id as number) ?? -Infinity))

  const words = Number.isFinite(first)
    ? rowsOf('SELECT * FROM words WHERE id BETWEEN ? AND ? ORDER BY id', [first, last]).map(toWord)
    : []
  const byId = new Map(words.map(w => [w.id, w]))

  const lines: Line[] = lineRows.map(r => {
    const f = r.first_word_id as number | null
    const l = r.last_word_id as number | null
    const ws: Word[] = []
    if (f != null && l != null) {
      for (let i = f; i <= l; i++) {
        const w = byId.get(i)
        // Never invent text. A missing word is a data bug, not a render bug.
        if (w) ws.push(w)
      }
    }
    return {
      lineNo: r.line_no as number,
      type: r.type as LineType,
      isCentered: (r.is_centered as number) === 1,
      surah: (r.surah as number) ?? null,
      words: ws,
    }
  })

  const markers: Marker[] = rowsOf(
    'SELECT line_no, kind, label, n_above, n_below FROM markers WHERE page = ? ORDER BY line_no',
    [page],
  ).map((r) => ({
    lineNo: r.line_no as number,
    kind: r.kind as MarkerKind,
    label: (r.label as string) ?? null,
    nAbove: (r.n_above as number) ?? null,
    nBelow: (r.n_below as number) ?? null,
  }))

  const mz = rowsOf('SELECT manzil FROM page_manzil WHERE page = ?', [page])[0]

  return {
    page,
    // Not meta.juz: that column records the para the page's FIRST AYAH falls
    // in by the juz division, which disagrees with the Indo-Pak para division
    // on three pages. See pageJuz().
    juz: pageJuz(page),
    surah: meta.surah as number,
    firstAyah: meta.first_ayah as string,
    lines,
    markers,
    manzil: (mz?.manzil as number) ?? null,
    paraStart: JUZ_START_PAGE[pageJuz(page)] === page,
  }
}

/* ------------------------------------------------------------------ *
 * Jump indexes
 *
 * A student says "Surah Yaseen" or "para 30", never "page 396". These map
 * both onto page numbers.
 *
 * Deliberately NOT done as a SQL join of words against lines: there is no
 * index on lines.first_word_id, so `w.id BETWEEN l.first_word_id AND
 * l.last_word_id` degenerates into a scan of 83,668 x 8,742 rows inside
 * sql.js. Instead each side is read once and matched with a binary search.
 * ------------------------------------------------------------------ */

export interface WordContext {
  wordId: number
  /** Internal page. Use printedPage() before showing it to a reader. */
  page: number
  lineNo: number
  surah: number
  ayah: number
  text: string
}

export interface JumpEntry {
  /** Surah or juz number. */
  n: number
  /** Page it starts on. */
  page: number
}

let surahCache: JumpEntry[] | null = null
let juzCache: JumpEntry[] | null = null

/** Page each of the 114 surahs begins on. */
export function surahIndex(): JumpEntry[] {
  if (surahCache) return surahCache

  // First real word of each surah. Markers are ayah-number glyphs, not words.
  const firsts = rowsOf(
    'SELECT surah, MIN(id) AS wid FROM words WHERE is_marker = 0 GROUP BY surah ORDER BY surah',
  ).map((r) => ({ surah: r.surah as number, wid: r.wid as number }))

  // Ayah lines in word order, so a word id can be located by binary search.
  const spans = rowsOf(
    `SELECT page, first_word_id AS a, last_word_id AS b FROM lines
      WHERE type = 'ayah' AND first_word_id IS NOT NULL
      ORDER BY first_word_id`,
  ).map((r) => ({ page: r.page as number, a: r.a as number, b: r.b as number }))

  const pageOf = (wid: number): number | null => {
    let lo = 0
    let hi = spans.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const sp = spans[mid]
      if (wid < sp.a) hi = mid - 1
      else if (wid > sp.b) lo = mid + 1
      else return sp.page
    }
    return null
  }

  const out: JumpEntry[] = []
  for (const f of firsts) {
    const page = pageOf(f.wid)
    // Never invent a location. A surah we cannot place is left out of the
    // menu rather than sending the reader to a wrong page.
    if (page != null) out.push({ n: f.surah, page })
  }

  surahCache = out
  return out
}

/**
 * Page each of the 30 paras begins on, straight from the print.
 *
 * This was twice wrong before. `MIN(page) FROM pages GROUP BY juz` sent paras
 * 4, 21 and 23 a page late. Resolving the metadata's first ayah to its page
 * fixed those three but broke 7, 11, 14 and 20, because the Indo-Pak para
 * division and the juz division in that metadata disagree in BOTH directions —
 * para 21 begins an ayah earlier than the metadata says, para 7 an ayah later.
 *
 * Neither derivation is trustworthy, so the pages are read off the Mushaf
 * itself. See src/data/juzStart.ts.
 */
export function juzIndex(): JumpEntry[] {
  if (juzCache) return juzCache
  juzCache = Object.entries(JUZ_START_PAGE)
    .map(([n, page]) => ({ n: Number(n), page }))
    .sort((x, y) => x.n - y.n)
  return juzCache
}

/** Cached line spans, sorted by first word id, for locating a word's page. */
let spanCache: { page: number; line: number; a: number; b: number }[] | null = null

function lineSpans() {
  if (spanCache) return spanCache
  spanCache = rowsOf(
    `SELECT page, line_no, first_word_id AS a, last_word_id AS b FROM lines
      WHERE type = 'ayah' AND first_word_id IS NOT NULL ORDER BY first_word_id`,
  ).map((r) => ({ page: r.page as number, line: r.line_no as number, a: r.a as number, b: r.b as number }))
  return spanCache
}

function pageOfWord(wid: number): { page: number; line: number } | null {
  const spans = lineSpans()
  let lo = 0
  let hi = spans.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const s = spans[mid]
    if (wid < s.a) hi = mid - 1
    else if (wid > s.b) lo = mid + 1
    else return { page: s.page, line: s.line }
  }
  return null
}

/**
 * Where each of these words sits, for the review panel.
 *
 * A recorded mistake is only a word id — enough to draw the mark on the page,
 * but not enough to answer "where was it?" after a whole para. This resolves
 * ids back to a page and an ayah so a listener can find them again.
 */
export function wordContext(ids: number[]): WordContext[] {
  if (!ids.length) return []
  const rows = rowsOf(
    `SELECT id, surah, ayah, text FROM words WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids,
  )
  const out: WordContext[] = []
  for (const r of rows) {
    const wid = r.id as number
    const at = pageOfWord(wid)
    // A word we cannot place is dropped rather than shown at a wrong page.
    if (!at) continue
    out.push({
      wordId: wid,
      page: at.page,
      lineNo: at.line,
      surah: r.surah as number,
      ayah: r.ayah as number,
      text: r.text as string,
    })
  }
  return out.sort((x, y) => x.page - y.page || x.wordId - y.wordId)
}

export const PAGE_COUNT = 548

/* ------------------------------------------------------------------ *
 * Which para a page belongs to
 *
 * Every para in this Mushaf opens on the first ayah line of a page — verified
 * for all 30 against the green band the print puts behind that line. So a page
 * belongs to exactly one para, and the whole question is a range lookup. No
 * majority rule, no shared boundary pages, no page that is half one para and
 * half another.
 * ------------------------------------------------------------------ */

/** The para this page belongs to. */
export function pageJuz(page: number): number {
  let ans = 1
  for (let j = 1; j <= 30; j++) {
    const start = JUZ_START_PAGE[j]
    if (start != null && start <= page) ans = j
    else break
  }
  return ans
}

/* ------------------------------------------------------------------ *
 * Progress through a para
 *
 * A student does not revise "pages", he revises a para. The one thing he
 * wants to know mid-sitting is how much of it is left, and no printed Mushaf
 * can tell him — the page footer says منزل and the header says the para
 * number, but neither says "three of twenty".
 * ------------------------------------------------------------------ */

export interface JuzProgress {
  juz: number
  /** 1-based position of this page within its para. */
  index: number
  /** Pages the para occupies. */
  total: number
  /** Pages still to come after this one. */
  remaining: number
  firstPage: number
  lastPage: number
}

let juzSpanCache: Map<number, [number, number]> | null = null

function juzSpans(): Map<number, [number, number]> {
  if (juzSpanCache) return juzSpanCache
  // Contiguous by construction: each para runs from its own first page to the
  // page before the next para's, and the last one to the end of the Mushaf.
  juzSpanCache = new Map()
  for (let j = 1; j <= 30; j++) {
    const a = JUZ_START_PAGE[j]
    if (a == null) continue
    const next = JUZ_START_PAGE[j + 1]
    juzSpanCache.set(j, [a, next != null ? next - 1 : PAGE_COUNT])
  }
  return juzSpanCache
}

/**
 * Where this page sits inside its para.
 *
 * `pages` records exactly one juz per page, so a page carrying the seam
 * between two paras is counted under the one it is listed against. That is
 * how a student speaks about it too — "this page is in para 5" — and it keeps
 * the count honest: index and total are whole pages, never fractions.
 *
 * Takes the juz as an argument rather than looking it up: every caller has
 * already loaded the page and knows it.
 */
export function juzProgress(page: number, juz: number): JuzProgress | null {
  const span = juzSpans().get(juz)
  if (!span) return null
  const [a, b] = span
  return {
    juz,
    index: page - a + 1,
    total: b - a + 1,
    remaining: Math.max(0, b - page),
    firstPage: a,
    lastPage: b,
  }
}
