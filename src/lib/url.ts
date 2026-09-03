import { PAGE_COUNT, internalPage, printedPage } from '../db/quran'

/**
 * The page in the address bar.
 *
 * Until now every page of the Mushaf lived at the same URL. That made a page
 * impossible to link to, impossible to bookmark, and invisible to a search
 * engine — 548 pages behind one address.
 *
 * The number in the URL is the PRINTED one, because that is the number the
 * reader can see on the page and the only one that means anything to them.
 * Conversion to our internal index happens here and nowhere else.
 */
const PARAM = 'page'

export function readPageFromUrl(): number | null {
  try {
    const raw = new URLSearchParams(window.location.search).get(PARAM)
    if (raw === null) return null
    const printed = Number(raw)
    if (!Number.isInteger(printed)) return null
    const internal = internalPage(printed)
    // Validated, not trusted: the URL is the most editable input there is.
    if (internal < 1 || internal > PAGE_COUNT) return null
    return internal
  } catch {
    return null
  }
}

/**
 * replaceState, deliberately, not pushState.
 *
 * A reader turns pages by swiping, and pushState would put every page turn in
 * the history stack — twenty swipes would take twenty presses of the back
 * button to escape. Replacing keeps the URL shareable and correct while
 * leaving the back button meaning "leave the Mushaf".
 */
export function writePageToUrl(page: number): void {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set(PARAM, String(printedPage(page)))
    window.history.replaceState(null, '', url)
  } catch {
    // A URL we cannot write is not worth breaking page turning over.
  }
}
