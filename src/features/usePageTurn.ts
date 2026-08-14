import { useEffect, useRef } from 'react'

/** Minimum horizontal travel before a drag counts as a page turn. */
const SWIPE_MIN_PX = 55
/** How much more horizontal than vertical, so scrolling is never hijacked. */
const SWIPE_RATIO = 1.6
/** A slow drag is the reader steadying the page, not turning it. */
const SWIPE_MAX_MS = 800
/** How soon after a swipe a click must arrive to be the swipe's own click. */
const CLICK_AFTER_SWIPE_MS = 500

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null
  if (!node || typeof node.tagName !== 'string') return false
  const tag = node.tagName.toLowerCase()
  return tag === 'input' || tag === 'select' || tag === 'textarea' || node.isContentEditable
}

/**
 * Keyboard and touch page turning.
 *
 * Direction belongs to the Mushaf, not to the UI language. The printed page is
 * right-to-left in all three languages and never mirrors, so neither does page
 * turning: the next page is always to the LEFT. ArrowLeft and a leftward swipe
 * advance, in English exactly as in Urdu.
 *
 * The header's nav is pinned to the same direction (see .site-nav in app.css),
 * so the ◀ ▶ buttons, the arrow keys and the swipe always agree with each
 * other and with the book.
 */
export function usePageTurn(prev: () => void, next: () => void): void {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  /**
   * A swipe also fires a click. Without this, swiping in listening mode would
   * mark whatever word happened to be under the finger as a mistake.
   *
   * Stored as a timestamp, not a flag: the click a swipe generates arrives
   * within a few milliseconds, so only that one is swallowed. A plain boolean
   * stays armed until the next click of any kind, which silently ate the first
   * tap on an unrelated button long after the swipe.
   */
  const swipedAt = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Leave browser and OS shortcuts alone, and never steal keys from the
      // page-number input or the surah menu.
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return

      if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        start.current = null // pinch-zoom, not a swipe
        return
      }
      const tch = e.touches[0]
      swipedAt.current = 0
      start.current = { x: tch.clientX, y: tch.clientY, t: Date.now() }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const s = start.current
      start.current = null
      if (!s) return

      const tch = e.changedTouches[0]
      if (!tch) return

      const dx = tch.clientX - s.x
      const dy = tch.clientY - s.y
      const far = Math.abs(dx) >= SWIPE_MIN_PX
      const horizontal = Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO
      const quick = Date.now() - s.t <= SWIPE_MAX_MS
      if (!far || !horizontal || !quick) return

      swipedAt.current = Date.now()
      // Leftward advances, the way the left-hand page of a Mushaf turns.
      if (dx < 0) next()
      else prev()
    }

    // Capture phase, so the word's own click handler never sees this event.
    const onClickCapture = (e: MouseEvent) => {
      if (swipedAt.current === 0) return
      const synthetic = Date.now() - swipedAt.current <= CLICK_AFTER_SWIPE_MS
      swipedAt.current = 0
      if (!synthetic) return
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('click', onClickCapture, true)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [prev, next])
}
