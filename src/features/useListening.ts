import { useCallback, useMemo, useRef, useState } from 'react'
import type { Mistake, MistakeKind } from '../types'

/**
 * سماعت موڈ — the listener taps the word where the student stumbled.
 *
 * Design constraint: the listener's eyes are on the page and their ears are on
 * the child. One tap, no dialog, no confirmation.
 *
 * A tap cycles the word rather than choosing from a menu:
 *
 *     unmarked  ->  لقمہ luqma  ->  اٹکنا atakna  ->  unmarked
 *
 * luqma comes first because it is the common case and the number madrasas
 * actually grade by, so the listener who only marks luqmas taps exactly once
 * per mistake, as before. The difference between the two is who resolved it:
 * a luqma is the student being prompted, an atakna is the student faltering
 * and recovering alone. Five of each describe very different students.
 */
export function useListening() {
  const [recording, setRecording] = useState(false)
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const startedAt = useRef<number>(0)

  const start = useCallback(() => {
    startedAt.current = Date.now()
    setMistakes([])
    setRecording(true)
    // TODO: begin audio capture; each mistake becomes a timestamp into it
  }, [])

  const stop = useCallback(() => setRecording(false), [])

  const mark = useCallback((wordId: number) => {
    setMistakes((prev) => {
      const i = prev.findIndex((m) => m.wordId === wordId)

      if (i < 0) {
        return [...prev, { wordId, kind: 'luqma', at: Date.now() - startedAt.current }]
      }

      const current = prev[i]
      if (current.kind === 'luqma') {
        const next = prev.slice()
        // Keep the original `at`: the mistake happened when it happened, the
        // second tap is only the listener correcting what they called it.
        next[i] = { ...current, kind: 'atakna' }
        return next
      }

      return prev.filter((_, j) => j !== i)
    })
  }, [])

  /** Luqmas per page is the number teachers actually care about. */
  const luqmaCount = mistakes.filter((m) => m.kind === 'luqma').length
  const ataknaCount = mistakes.filter((m) => m.kind === 'atakna').length

  /** wordId -> kind, so a word can render its own mark without a lookup. */
  const kinds = useMemo(
    () => new Map<number, MistakeKind>(mistakes.map((m) => [m.wordId, m.kind])),
    [mistakes],
  )

  return { recording, mistakes, kinds, luqmaCount, ataknaCount, start, stop, mark }
}
