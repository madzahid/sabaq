import type { Marker, MistakeKind, Page } from '../types'
import { printedPage } from '../db/quran'
import { pageDigits } from '../i18n/digits'
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
 * One margin mark, placed against the line it belongs to.
 *
 * Positioned absolutely rather than inserted into the line, so that adding a
 * mark can never change where a word sits. The page's line breaks are the
 * memory a student is holding; nothing in the margin may disturb them.
 */
function MarginMark({ m }: { m: Marker }) {
  // Anchored to the CENTRE of its line, not the top. A vertical word is as
  // tall as the word, so anchoring by the top let it flow downward and sit
  // about two lines below where the print puts it. Paired with
  // translateY(-50%) in .mk, this centres every mark whatever its height.
  const top = { top: `calc(${m.lineNo - 0.5} * var(--line-h))` }

  if (m.kind === 'ruku') {
    return (
      <span className="mk mk-ruku" style={top} aria-hidden="true">
        <b className="mk-n">{pageDigits(m.nAbove ?? '')}</b>
        <b className="mk-ain">ع</b>
        <b className="mk-n">{pageDigits(m.nBelow ?? '')}</b>
      </span>
    )
  }

  if (m.kind === 'sajdah') {
    return (
      <span className="mk mk-sajdah" style={top} aria-hidden="true">
        {m.label} {pageDigits(m.nBelow ?? '')}
      </span>
    )
  }

  // rub / nisf / thalatha — printed as a word, set vertically in the margin.
  return <span className={`mk mk-quarter mk-${m.kind}`} style={top} aria-hidden="true">{m.label}</span>
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
        <span>{t.juz} {pageDigits(page.juz)}</span>
        <span className="dash" />
        <span className="pageno">{pageDigits(printedPage(page.page))} — {printedPage(page.page)}</span>
        <span className="dash" />
        {/* Surah name stays Arabic in all three languages — it has to match the
            header printed in the Mushaf the student is holding. */}
        <span>{SURAH_NAMES[page.surah]} {pageDigits(page.surah)}</span>
      </header>

      <div className="frame">
        <div className="frame-in">
          {/* Ruku signs sit in one margin, the quarter words and sajdah in the
              other, matching where the printed copy puts them. */}
          <div className="gutter gutter-ruku">
            {page.markers.filter((m) => m.kind === 'ruku').map((m, i) => (
              <MarginMark key={`r${i}`} m={m} />
            ))}
          </div>
          <div className="gutter gutter-marks">
            {page.markers.filter((m) => m.kind !== 'ruku').map((m, i) => (
              <MarginMark key={`m${i}`} m={m} />
            ))}
          </div>
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

      {page.manzil != null && (
        <div className="manzil" aria-hidden="true">منزل {pageDigits(page.manzil)}</div>
      )}
    </div>
  )
}
