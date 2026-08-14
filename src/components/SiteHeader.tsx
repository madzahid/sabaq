import { useState } from 'react'
import { PAGE_COUNT, juzIndex, surahIndex } from '../db/quran'
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
}

/**
 * Web header. Hidden in the native app, where the OS supplies the chrome and
 * screen space is scarce — see isWeb() in src/lib/platform.ts.
 */
export default function SiteHeader({
  pageNo, surah, juz, onGo, hifzActive, onToggleHifz, luqmaCount, ataknaCount,
}: Props) {
  const { locale, t, setLocale } = useLocale()

  // Cached after the first call — see surahIndex() in db/quran.ts.
  const surahs = surahIndex()
  const juzs = juzIndex()

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
              <option key={s.n} value={s.n}>{s.n} · {SURAH_NAMES[s.n]}</option>
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
              <option key={j.n} value={j.n}>{t.nav.juz} {j.n}</option>
            ))}
          </select>
        </label>

        <label className="pagebox">
          <span className="sr-only">{t.nav.pageNumber}</span>
          <input
            type="number" min={1} max={PAGE_COUNT} value={pageNo}
            onChange={(e) => onGo(Number(e.target.value))}
          />
          <span className="of">/ {PAGE_COUNT}</span>
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

        {luqmaCount > 0 && <span className="count luqma">{t.luqma(luqmaCount)}</span>}
        {ataknaCount > 0 && <span className="count atakna">{t.atakna(ataknaCount)}</span>}
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
