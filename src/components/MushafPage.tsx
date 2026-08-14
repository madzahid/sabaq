import type { MistakeKind, Page } from '../types'
import { SURAH_NAMES } from '../i18n/surahs'
import { useLocale } from '../i18n/useLocale'
import Word from './Word'

interface Props {
  page: Page
  marked: Map<number, MistakeKind>
  peeked: Set<number>
  onTapWord: (id: number) => void
}

/**
 * Renders one page exactly as the printed 16-line Mushaf sets it.
 * Line breaks come from the layout table and are never computed here.
 *
 * The sheet carries dir="rtl" lang="ar" of its own, so it is unaffected by the
 * UI language. In the English build the chrome flips to ltr and the page does
 * not move: the printed page is the memory, and it has one direction.
 */
export default function MushafPage({ page, marked, peeked, onTapWord }: Props) {
  const { t } = useLocale()

  return (
    <div className="sheet" dir="rtl" lang="ar">
      <header className="hdr">
        <span>{t.juz} {page.juz}</span>
        <span className="dash" />
        <span className="pageno">{page.page}</span>
        <span className="dash" />
        {/* Surah name stays Arabic in all three languages — it has to match the
            header printed in the Mushaf the student is holding. */}
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
                    marked={marked.get(w.id)}
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
