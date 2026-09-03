import { useState } from 'react'
import { MAKHRAJ_TERMS } from '../data/makharij'
import { WAQF } from '../data/waqf'
import type { Strings } from '../i18n/strings'
import { useLocale } from '../i18n/useLocale'

interface Props {
  onClose: () => void
}

/**
 * The three references the printed Mushaf carries in its back matter, which
 * the app needs just as much: what the colours mean, what the pause marks
 * mean, and where in the mouth each letter is sounded from.
 *
 * All three explain marks that are ALREADY on the page. A reader meeting a
 * pink letter or a small ۘ has nowhere else to look.
 */

/** Colour rows. Each swatch uses the SAME class the Quran text uses, so the
 *  key can never drift from the page — change --ghunnah and both move. */
const COLOURS: { cls: string; name: string; translit: string; key: keyof Strings['tajweed'] }[] = [
  { cls: 'gh', name: 'غُنَّة',          translit: 'Ghunnah', key: 'ghunnah' },
  { cls: 'ik', name: 'إِخْفَاء',        translit: 'Ikhfa',   key: 'ikhfa' },
  { cls: 'ql', name: 'قَلْقَلَة',       translit: 'Qalqala', key: 'qalqala' },
  { cls: 'md', name: 'مَدّ',            translit: 'Madd',    key: 'madd' },
  { cls: 'si', name: 'غَيْرُ مَلْفُوظ', translit: 'Silent',  key: 'silent' },
]

type Tab = 'colours' | 'waqf' | 'makharij'

export default function TajweedPanel({ onClose }: Props) {
  const { locale, t } = useLocale()
  const [tab, setTab] = useState<Tab>('colours')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'colours', label: t.tajweed.tabColours },
    { id: 'waqf', label: t.tajweed.tabWaqf },
    { id: 'makharij', label: t.tajweed.tabMakharij },
  ]

  return (
    <div className="sheetover" role="dialog" aria-label={t.tajweed.title} onClick={onClose}>
      <div className="review tj-panel" onClick={(e) => e.stopPropagation()}>
        <header className="review-head">
          <b>{t.tajweed.title}</b>
          <button className="review-x" onClick={onClose} aria-label={t.review.close}>✕</button>
        </header>

        <div className="tj-tabs" role="tablist">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              className={tab === x.id ? 'on' : undefined}
              onClick={() => setTab(x.id)}
            >
              {x.label}
            </button>
          ))}
        </div>

        {tab === 'colours' && (
          <>
            <p className="tj-intro">{t.tajweed.intro}</p>
            <ul className="tj-list">
              {COLOURS.map((r) => (
                <li key={r.cls}>
                  <span className={`tj-dot ${r.cls}`} aria-hidden="true" />
                  <span className="tj-names">
                    <b className={`tj-ar ${r.cls}`} lang="ar" dir="rtl">{r.name}</b>
                    <span className="tj-tr">{r.translit}</span>
                  </span>
                  <span className="tj-desc">{t.tajweed[r.key]}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'waqf' && (
          <>
            <p className="tj-intro">{t.tajweed.waqfIntro}</p>
            <ul className="tj-list tj-waqf">
              {WAQF.map((w) => (
                <li key={w.name}>
                  {/* The sign as the margin prints it, in the Quranic face. */}
                  <span className="wq-sign" lang="ar" dir="rtl">{w.sign}</span>
                  <span className="tj-names">
                    <b className="tj-ar" lang="ar" dir="rtl">{w.name}</b>
                  </span>
                  <span className="tj-desc">{w[locale]}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'makharij' && (
          <>
            <p className="tj-intro">{t.tajweed.makharijIntro}</p>

            {/* The two headings are printed ON the artwork in Urdu, so they were
                cropped off and are rendered here as real text instead — that is
                the only way an English or Arabic reader gets them. The labels
                inside the drawing stay as the Mushaf prints them: they are
                handwritten Arabic, and re-lettering anatomy by hand in three
                languages risks mislabelling a tooth. The list below carries the
                terms in the reader's own language. */}
            <figure className="tj-fig">
              <figcaption>{t.tajweed.jawUpper}</figcaption>
              <img
                className="tj-diagram"
                src={`${import.meta.env.BASE_URL}img/makharij-upper.webp`}
                width={1100} height={680}
                alt={t.tajweed.jawUpper}
              />
            </figure>

            <figure className="tj-fig">
              <figcaption>{t.tajweed.jawLower}</figcaption>
              <img
                className="tj-diagram tj-diagram-lower"
                src={`${import.meta.env.BASE_URL}img/makharij-lower.webp`}
                width={1100} height={399}
                alt={t.tajweed.jawLower}
              />
            </figure>

            <h4 className="tj-sub">{t.tajweed.teeth}</h4>
            <ul className="tj-list tj-teeth">
              {MAKHRAJ_TERMS.map((m) => (
                <li key={m.ar}>
                  <span className="tj-names">
                    <b className="tj-ar" lang="ar" dir="rtl">{m.ar}</b>
                    <span className="tj-tr">{m.translit}</span>
                  </span>
                  <span className="tj-desc">
                    {locale === 'ur' ? m.ur : locale === 'ar' ? m.arDesc : m.en}
                  </span>
                </li>
              ))}
            </ul>

            <p className="tj-credit">{t.tajweed.makharijCredit}</p>
          </>
        )}

        <p className="tj-note">{t.tajweed.note}</p>
      </div>
    </div>
  )
}
