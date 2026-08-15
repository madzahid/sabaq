import initSqlJs, { type Database } from 'sql.js'
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
  const res = await fetch(`${import.meta.env.BASE_URL}data/quran.sqlite`)
  if (!res.ok) throw new Error(`quran.sqlite missing (HTTP ${res.status})`)
  db = new SQL.Database(new Uint8Array(await res.arrayBuffer()))

  const row = rowsOf("SELECT value FROM meta WHERE key = 'page_offset'")[0]
  const n = Number(row?.value)
  printedOffset = Number.isInteger(n) ? n : 0
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
    juz: meta.juz as number,
    surah: meta.surah as number,
    firstAyah: meta.first_ayah as string,
    lines,
    markers,
    manzil: (mz?.manzil as number) ?? null,
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

/** Page each of the 30 juz begins on. */
export function juzIndex(): JumpEntry[] {
  if (juzCache) return juzCache
  juzCache = rowsOf('SELECT juz, MIN(page) AS page FROM pages GROUP BY juz ORDER BY juz')
    .map((r) => ({ n: r.juz as number, page: r.page as number }))
  return juzCache
}

export const PAGE_COUNT = 548
