import { juzProgress } from '../db/quran'
import { uiDigits } from '../i18n/digits'
import { useLocale } from '../i18n/useLocale'

interface Props {
  /** Internal page number. */
  page: number
  juz: number
}

/**
 * How far through the current para this page is.
 *
 * Deliberately OUTSIDE .sheet. The sheet reproduces the printed page, and
 * nothing that is not printed in the Mushaf may appear inside it — the same
 * rule that keeps the margin marks in an absolutely-positioned gutter.
 *
 * Also deliberately NOT in the site header: the native build hides the header
 * entirely (see isWeb()), and a student revising on his phone is exactly the
 * person who wants to know how many pages are left.
 */
export default function ParaProgress({ page, juz }: Props) {
  const { locale, t } = useLocale()
  const p = juzProgress(page, juz)
  if (!p) return null

  const pct = (p.index / p.total) * 100

  return (
    // The bar follows the UI language, not the Mushaf. Page turning is pinned
    // to the Mushaf's right-to-left everywhere else in the app, but a progress
    // bar is an abstract measure rather than a page, and an English reader
    // seeing one fill leftwards reads it as going backwards.
    <div
      className="para-prog"
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      lang={locale}
      aria-label={t.progress.label}
    >
      <div className="pp-row">
        <span className="pp-juz">{t.juz} {uiDigits(p.juz, locale)}</span>
        <span className="pp-pos">{t.progress.position(p.index, p.total)}</span>
        <span className="pp-gap" />
        <span className="pp-left">
          {p.remaining === 0 ? t.progress.lastPage : t.progress.remaining(p.remaining)}
        </span>
      </div>

      <div
        className="pp-bar"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={p.total}
        aria-valuenow={p.index}
      >
        <div className="pp-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
