import { useEffect, useState } from 'react'

/**
 * True on a device driven by a finger rather than a mouse.
 *
 * Page turning means different things to the two. On a desktop the controls
 * follow the BOOK: the next page is to the left, because that is the way a
 * right-to-left Mushaf turns, and the arrow keys agree with the ◀ ▶ buttons.
 *
 * On a phone the control follows the HAND: you drag the page across, so
 * forward is rightward, and the buttons are mirrored to agree with the swipe.
 * A reader whose thumb goes one way and whose buttons go the other will trust
 * neither.
 *
 * `pointer: coarse` rather than a width breakpoint or a user-agent string: a
 * large tablet is still a finger, and a small window on a laptop is still a
 * mouse. It is re-evaluated on change, so a detachable keyboard is handled.
 */
const QUERY = '(pointer: coarse)'

export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true,
  )

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY)
    if (!mq) return
    const onChange = () => setCoarse(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return coarse
}
