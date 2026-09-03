import type { Marker, MistakeKind, Page } from '../types'
import { printedPage } from '../db/quran'
import { pageDigits, uiDigits } from '../i18n/digits'
import { JUZ_NAME } from '../data/juzNames'
import { SURAH_META } from '../data/surahMeta'
import { SURAH_NAMES } from '../i18n/surahs'
import { useLocale } from '../i18n/useLocale'
import ParaProgress from './ParaProgress'
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
 * The heading band that opens a surah, set the way the print sets it:
 *
 *   [ ركوعاتها ]  ◄ (٣٠) سورة الروم مكية (٨٤) ►  [ آياتها ]
 *   [    ٦     ]                                  [   ٦٠   ]
 *
 * Right box is the ayah count, left box the ruku count, and the ribbon between
 * them carries the surah's number in the Mushaf, its name, whether it is Makki
 * or Madani, and — the bracketed number — its place in the order of
 * revelation. Ar-Rum is the 30th surah and the 84th revealed.
 *
 * Everything stays Arabic in all three UI languages, and every number goes
 * through pageDigits, for the same reason the surah name does: this is printed
 * on the page the student is holding, so it is page content, not chrome.
 *
 * It occupies the surah line the layout table already allots. No line is added
 * and none is moved, so the page's line breaks are untouched.
 */
function SurahBand({ surah }: { surah: number }) {
  const meta = SURAH_META[surah]

  // Never invent metadata. A surah missing from the table still prints its
  // name, which is all the old code did.
  if (!meta) {
    return <div className="ln surah"><span className="sb-cart">سورة {SURAH_NAMES[surah]}</span></div>
  }

  return (
    <div className="ln surah">
      {/* First child is the RIGHT-hand box: .ln.surah inherits the sheet's rtl. */}
      <span className="sb-box">
        <span className="sb-lbl">آيَاتُهَا</span>
        <span className="sb-val">{pageDigits(meta.ayahs)}</span>
      </span>

      <span className="sb-cart">
        ({pageDigits(surah)}) سورة {SURAH_NAMES[surah]}{' '}
        {meta.place === 'makkah' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'} ({pageDigits(meta.order)})
      </span>

      <span className="sb-box">
        <span className="sb-lbl">رُكُوعَاتُهَا</span>
        <span className="sb-val">{pageDigits(meta.rukus)}</span>
      </span>
    </div>
  )
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
  const { locale, t } = useLocale()

  // The para's opening line. Not simply line 1: where a surah also opens on
  // this page, lines 1-2 are the heading band and the basmallah.
  const firstAyahLine = page.lines.find((l) => l.type === 'ayah')?.lineNo ?? -1

  return (
    <div className="sheet" dir="rtl" lang="ar">
      <header className="hdr">
        {/* Digits follow the script of the word beside them. This label is
            translated, so its number is too: 'Juz 21' in English, 'پارہ ۲۱' in
            Urdu. The surah opposite keeps its Arabic name, so it keeps Indo-Pak
            numerals.

            The para's name follows, as the print heads every page — ۲۱ اتل مآ
            اوحی ۲۱. It is Quranic text, so it stays Arabic in all three
            languages, exactly like the surah name. */}
        <span>
          {t.juz} {uiDigits(page.juz, locale)}
          <span className="hdr-jname" lang="ar" dir="rtl">{JUZ_NAME[page.juz]}</span>
        </span>
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
          {/* The print bands a para's opening line in green. It is always the
              page's first ayah line — on a page where a surah also opens, that
              is the line after the heading and the basmallah, not line 1. */}
          {(() => null)()}
          {page.lines.map((line) => {
            if (line.type === 'surah_name') {
              return <SurahBand key={line.lineNo} surah={line.surah ?? 0} />
            }
            if (line.type === 'basmallah') {
              return (
                <div key={line.lineNo} className="ln centred">
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ
                </div>
              )
            }
            const isParaOpening =
              page.paraStart && line.lineNo === firstAyahLine
            return (
              <div
                key={line.lineNo}
                className={
                  'ln' +
                  (line.isCentered ? ' centred' : '') +
                  (isParaOpening ? ' ln-para' : '')
                }
              >
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

      {/* On the paper, under منزل. Not printed in the Mushaf, but the reader
          asked for it here: it reads as part of the page's footing rather
          than as app chrome floating beneath the sheet. */}
      <ParaProgress page={page.page} juz={page.juz} />
    </div>
  )
}
