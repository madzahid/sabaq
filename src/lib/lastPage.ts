import { PAGE_COUNT } from '../db/quran'
import { read, write } from './store'

const KEY = 'sabaq.lastPage'

/** A first-time reader opens the Mushaf at the beginning. */
export const DEFAULT_PAGE = 1

/**
 * Where the reader left off, or page 1 on a first visit.
 *
 * The stored value is validated rather than trusted: it comes from a source
 * the user can edit, and a bad number would ask the database for a page that
 * does not exist. Anything that is not a whole page number in range is
 * discarded silently in favour of the default.
 */
export function loadLastPage(): number {
  const raw = read(KEY)
  if (raw === null) return DEFAULT_PAGE

  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1 || n > PAGE_COUNT) return DEFAULT_PAGE
  return n
}

export function saveLastPage(page: number): void {
  write(KEY, String(page))
}
