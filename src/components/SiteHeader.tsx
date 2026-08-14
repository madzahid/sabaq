import { PAGE_COUNT } from '../db/quran'
import { ENDONYM, LOCALES } from '../i18n/locale'
import { useLocale } from '../i18n/useLocale'

interface Props {
  pageNo: number
  onGo: (n: number) => void
  hifzActive: boolean
  onToggleHifz: () => void
  luqmaCount: number
}

/**
 * Web header. Hidden in the native app, where the OS supplies the chrome and
 * screen space is scarce — see isWeb() in src/lib/platform.ts.
 */
export default function SiteHeader({
  pageNo, onGo, hifzActive, onToggleHifz, luqmaCount,
}: Props) {
  const { locale, t, setLocale } = useLocale()

  return (
    <header className="site-head">
      {/* The wordmark is the app's name, not a translated string: سبق in the
          Arabic script and Sabaq in Latin, in every language. */}
      <a className="brand" href="/" aria-label={t.brand}>
        <span className="brand-ar">سبق</span>
        <span className="brand-en">Sabaq</span>
      </a>

      <nav className="site-nav" aria-label={t.nav.label}>
        <button onClick={() => onGo(pageNo - 1)} aria-label={t.nav.prev}>◀</button>
        <label className="pagebox">
          <span className="sr-only">{t.nav.pageNumber}</span>
          <input
            type="number" min={1} max={PAGE_COUNT} value={pageNo}
            onChange={(e) => onGo(Number(e.target.value))}
          />
          <span className="of">/ {PAGE_COUNT}</span>
        </label>
        <button onClick={() => onGo(pageNo + 1)} aria-label={t.nav.next}>▶</button>
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

        {luqmaCount > 0 && <span className="count">{t.luqma(luqmaCount)}</span>}
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
