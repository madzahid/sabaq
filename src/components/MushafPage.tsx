import type { Page } from '../types'
import { SURAH_NAMES } from '../i18n/surahs'
import Word from './Word'

interface Props {
  page: Page
  marked: Set<number>
  peeked: Set<number>
  onTapWord: (id: number) => void
}

/**
 * Renders one page exactly as the Taj Company 16-line Mushaf prints it.
 * Line breaks come from the layout table and are never computed here.
 */
export default function MushafPage({ page, marked, peeked, onTapWord }: Props) {
  return (
    <div className="sheet">
      <header className="hdr">
        <span>پارہ {page.juz}</span>
        <span className="dash" />
        <span className="pageno">{page.page}</span>
        <span className="dash" />
        <span>{SURAH_NAMES[page.surah]} {page.surah}</span>
      </header>

      <div className="frame">
        <div className="frame-in">
          {page.lines.map((line) => {
            if (line.type === 'surah_name') {
              return (
                <div key={line.lineNo} className="ln surah">
                  سورة {SURAH_NAMES[line.surah ?? 0]}
                </div>
              )
            }
            if (line.type === 'basmallah') {
              return (
                <div key={line.lineNo} className="ln centred">
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ
                </div>
              )
            }
            return (
              <div key={line.lineNo} className={`ln${line.isCentered ? ' centred' : ''}`}>
                {line.words.map((w) => (
                  <Word
                    key={w.id}
                    word={w}
                    marked={marked.has(w.id)}
                    peeked={peeked.has(w.id)}
                    onTap={onTapWord}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
