import { memo } from 'react'
import type { Word as WordModel } from '../types'
import { segments } from '../lib/tajweed'

interface Props {
  word: WordModel
  marked: boolean
  peeked: boolean
  onTap: (id: number) => void
}

/**
 * A single word. This is the atom the whole app is built on — listening mode,
 * blur mode and (later) audio highlighting all address words individually.
 */
function WordView({ word, marked, peeked, onTap }: Props) {
  // The ayah number is a glyph, not a word: never blurred, never markable.
  if (word.isMarker) {
    return <span className="w num" aria-hidden="true">{word.text}</span>
  }

  const cls = ['w', marked && 'mark', peeked && 'peek'].filter(Boolean).join(' ')

  return (
    <span
      className={cls}
      role="button"
      tabIndex={0}
      data-word={word.id}
      onClick={() => onTap(word.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTap(word.id) }}
    >
      {segments(word.text, word.marks).map((s, i) =>
        s.cls
          ? <span key={i} className={s.cls}>{s.text}</span>
          : <span key={i}>{s.text}</span>
      )}
    </span>
  )
}

export default memo(WordView)
