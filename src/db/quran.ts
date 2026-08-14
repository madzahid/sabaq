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

export const PAGE_COUNT = 548
