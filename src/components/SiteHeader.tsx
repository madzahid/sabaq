import { useState } from 'react'
import { internalPage, juzIndex, printedPage, printedRange, surahIndex } from '../db/quran'
import { uiDigits } from '../i18n/digits'
import { ENDONYM, LOCALES } from '../i18n/locale'
import { SURAH_NAMES } from '../i18n/surahs'
import { useLocale } from '../i18n/useLocale'

interface Props {
  pageNo: number
  /** First surah on the current page, for the surah menu's selected state. */
  surah: number
  juz: number
  onGo: (n: number) => void
  hifzActive: boolean
  onToggleHifz: () => void
  luqmaCount: number
  ataknaCount: number
  onReview: () => void
  onTajweed: () => void
}

/**
 * Web header. Hidden in the native app, where the OS supplies the chrome and
 * screen space is scarce — see isWeb() in src/lib/platform.ts.
 */
export default function SiteHeader({
  pageNo, surah, juz, onGo, hifzActive, onToggleHifz, luqmaCount, ataknaCount, onReview,
  onTajweed,
}: Props) {
  const { locale, t, setLocale } = useLocale()

  // Cached after the first call — see surahIndex() in db/quran.ts.
  const surahs = surahIndex()
  const juzs = juzIndex()

  // The reader types the number printed in the Mushaf in front of them; every
  // index inside the app stays internal. Conversion happens only here.
  const [firstPrinted, lastPrinted] = printedRange()

  /**
   * Many surahs begin part-way down a page. Picking Yaseen lands on page 396,
   * whose first surah is Fatir — so showing page.surah would snap the menu
   * back to Fatir and read as a failed jump. Remember what was picked, and
   * keep showing it for as long as we are still on the page it led to.
   */
  const [picked, setPicked] = useState<number | null>(null)
  const pickedStart = picked == null ? null : surahs.find((s) => s.n === picked)?.page
  const shownSurah = pickedStart === pageNo && picked != null ? picked : surah

  return (
    <header className="site-head">
      {/* The wordmark is the app's name, not a translated string: سبق in the
          Arabic script and Sabaq in Latin, in every language. */}
      <a className="brand" href="/" aria-label={t.brand}>
        <span className="brand-ar">سبق</span>
        <span className="brand-en">Sabaq</span>
      </a>

      <nav className="site-nav" aria-label={t.nav.label}>
        {/* Fixed glyphs, because .site-nav is pinned rtl in every language:
            prev always sits on the right and points right, next on the left
            pointing left — the direction the Mushaf actually turns. */}
        <button onClick={() => onGo(pageNo - 1)} aria-label={t.nav.prev}>▶</button>

        {/* A student says "Surah Yaseen" or "para 30", not "page 396". Surah
            names stay Arabic here for the same reason they do on the page. */}
        <label className="jump">
          <span className="sr-only">{t.nav.surah}</span>
          <select
            dir="rtl" lang="ar" value={shownSurah}
            onChange={(e) => {
              const n = Number(e.target.value)
              const found = surahs.find((s) => s.n === n)
              if (!found) return
              setPicked(n)
              onGo(found.page)
            }}
          >
            {surahs.map((s) => (
              <option key={s.n} value={s.n}>{uiDigits(s.n, locale)} · {SURAH_NAMES[s.n]}</option>
            ))}
          </select>
        </label>

        <label className="jump">
          <span className="sr-only">{t.nav.juz}</span>
          <select
            dir={locale === 'en' ? 'ltr' : 'rtl'}
            value={juz}
            onChange={(e) => {
              const found = juzs.find((j) => j.n === Number(e.target.value))
              if (found) onGo(found.page)
            }}
          >
            {juzs.map((j) => (
              <option key={j.n} value={j.n}>{t.nav.juz} {uiDigits(j.n, locale)}</option>
            ))}
          </select>
        </label>

        <label className="pagebox">
          <span className="sr-only">{t.nav.pageNumber}</span>
          {/* Latin digits, deliberately: type="number" only accepts ASCII,
              and an Urdu reader typing ۳۶۳ into it would get nothing. The
              total beside it is display text, so that one is localised. */}
          <input
            type="number" min={firstPrinted} max={lastPrinted}
            value={printedPage(pageNo)}
            onChange={(e) => onGo(internalPage(Number(e.target.value)))}
          />
          <span className="of">/ {uiDigits(lastPrinted, locale)}</span>
        </label>

        <button onClick={() => onGo(pageNo + 1)} aria-label={t.nav.next}>◀</button>
      </nav>

      <div className="site-actions">
        {/* Each language names itself. An Urdu speaker looking for their
            language should not have to read English to find it. */}
        <div className="langsel" role="group" aria-label={t.language}>
          {LOCALES.map((l) => (
            <button
              key={l}
              lang={l}
              className={l === locale ? 'on' : undefined}
              aria-pressed={l === locale}
              onClick={() => setLocale(l)}
            >
              {ENDONYM[l]}
            </button>
          ))}
        </div>

        {/* The counts are the way into the review panel: after a whole para
            they are the only thing on screen that knows a mark exists. */}
        {luqmaCount > 0 && (
          <button className="count luqma" onClick={onReview} aria-label={t.review.title}>
            {t.luqma(luqmaCount)}
          </button>
        )}
        {ataknaCount > 0 && (
          <button className="count atakna" onClick={onReview} aria-label={t.review.title}>
            {t.atakna(ataknaCount)}
          </button>
        )}
        {/* The colour key. A reader who has never been taught tajweed sees
            coloured letters and no explanation anywhere in the app. */}
        <button className="tj-btn" onClick={onTajweed} aria-label={t.tajweed.title}>
          <span aria-hidden="true">◕</span> {t.tajweed.title}
        </button>

        <button
          className={hifzActive ? 'primary on' : 'primary'}
          onClick={onToggleHifz}
          aria-pressed={hifzActive}
        >
          {t.hifzMode}
        </button>
      </div>
    </header>
  )
}
