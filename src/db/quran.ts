import initSqlJs, { type Database } from 'sql.js'
import type { Line, LineType, Page, Word } from '../types'

let db: Database | null = null

/** Opens the bundled database. Safe to call repeatedly. */
export async function open(): Promise<void> {
  if (db) return
  const SQL = await initSqlJs({
    locateFile: (f) => `${import.meta.env.BASE_URL}${f}`,
  })
  const res = await fetch(`${import.meta.env.BASE_URL}data/quran.sqlite`)
  if (!res.ok) throw new Error(`quran.sqlite missing (HTTP ${res.status})`)
  db = new SQL.Database(new Uint8Array(await res.arrayBuffer()))
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

function toWord(r: Record<string, unknown>): Word {
  return {
    id: r.id as number,
    surah: r.surah as number,
    ayah: r.ayah as number,
    position: r.position as number,
    text: r.text as string,
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

  return {
    page,
    juz: meta.juz as number,
    surah: meta.surah as number,
    firstAyah: meta.first_ayah as string,
    lines,
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
