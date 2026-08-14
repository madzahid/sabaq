import { useCallback, useState } from 'react'

/**
 * حفظ موڈ — blur the page, recall from memory, tap a word to check it.
 * Peeked words reset when the mode is toggled, so each attempt starts clean.
 */
export function useHifzMode() {
  const [active, setActive] = useState(false)
  const [peeked, setPeeked] = useState<Set<number>>(new Set())

  const toggle = useCallback(() => {
    setActive((a) => !a)
    setPeeked(new Set())
  }, [])

  const peek = useCallback((id: number) => {
    setPeeked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return { active, peeked, toggle, peek }
}
