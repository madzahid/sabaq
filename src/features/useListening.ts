import { useCallback, useRef, useState } from 'react'
import type { Mistake, MistakeKind } from '../types'

/**
 * سماعت موڈ — the listener taps the word where the student stumbled.
 *
 * Design constraint: the listener's eyes are on the page and their ears are on
 * the child. One tap, no dialog, no confirmation. The default kind is 'luqma'
 * because that is the count madrasas already grade by.
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

  const mark = useCallback((wordId: number, kind: MistakeKind = 'luqma') => {
    setMistakes((prev) => {
      const existing = prev.findIndex((m) => m.wordId === wordId)
      if (existing >= 0) return prev.filter((_, i) => i !== existing)
      return [...prev, { wordId, kind, at: Date.now() - startedAt.current }]
    })
  }, [])

  /** Luqmas per page is the number teachers actually care about. */
  const luqmaCount = mistakes.filter((m) => m.kind === 'luqma').length

  return { recording, mistakes, luqmaCount, start, stop, mark }
}
