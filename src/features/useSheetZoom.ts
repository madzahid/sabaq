import { useEffect } from 'react'

/**
 * Fit the printed page to the screen by scaling it, not by reflowing it.
 *
 * The Mushaf's lines cannot wrap — they are the print's lines, and a wrapped
 * line destroys the page image a hafiz has memorised. So on a narrow screen
 * something has to give, and the only honest answer is the one a person uses
 * with a physical Mushaf: hold it further away. The whole sheet scales down.
 *
 * Shrinking the FONT alone does not work, and this was tried first. A line's
 * width is not proportional to its font size: every word carries a couple of
 * pixels of padding that stay put however small the type gets, so on the
 * densest pages (juz 30, eleven-plus short words to a line) the line kept
 * overflowing no matter how far the font came down. `zoom` scales those fixed
 * costs too, which is the whole point of using it.
 *
 * `zoom` rather than `transform: scale()` because zoom affects layout — the
 * page below it flows at the scaled height with no manual height correction.
 */

/** The width the sheet is designed at: .sheet's max-width plus its margins. */
const DESIGN_WIDTH = 806

export function useSheetZoom(): void {
  useEffect(() => {
    const apply = () => {
      // Never zoom in past 1: on a wide screen the page is already at its
      // intended size, and scaling it up would just blur it.
      const k = Math.min(1, window.innerWidth / DESIGN_WIDTH)
      document.documentElement.style.setProperty('--sheet-zoom', String(k))
    }
    apply()
    window.addEventListener('resize', apply)
    // Rotating a phone fires resize late on some browsers; this catches it.
    window.addEventListener('orientationchange', apply)
    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])
}
