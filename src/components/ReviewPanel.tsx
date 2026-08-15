import { useMemo } from 'react'
import { printedPage, wordContext } from '../db/quran'
import { pageDigits } from '../i18n/digits'
import { SURAH_NAMES } from '../i18n/surahs'
import { useLocale } from '../i18n/useLocale'
import type { Mistake } from '../types'

interface Props {
  mistakes: Mistake[]
  onGo: (page: number) => void
  onClose: () => void
  onClear: () => void
}

/**
 * Where the marks were.
 *
 * A mark on the page answers "was there a mistake here?" but not "where were
 * they?" once a whole para is done — that would mean paging back through
 * twenty pages hunting for colour. This lists every mark with its page and
 * ayah, grouped by page, and jumps there on tap.
 */
export default function ReviewPanel({ mistakes, onGo, onClose, onClear }: Props) {
  const { t } = useLocale()

  // Resolved here rather than stored: a Mistake is only a word id, which keeps
  // what we persist small and lets the database stay the single source of
  // truth for where a word actually sits.
  const rows = useMemo(() => {
    const kind = new Map(mistakes.map((m) => [m.wordId, m.kind]))
    const ctx = wordContext(mistakes.map((m) => m.wordId))
    const byPage = new Map<number, { surah: number; ayah: number; text: string; kind: string; id: number }[]>()
    for (const c of ctx) {
      const list = byPage.get(c.page) ?? []
      list.push({ surah: c.surah, ayah: c.ayah, text: c.text, kind: kind.get(c.wordId)!, id: c.wordId })
      byPage.set(c.page, list)
    }
    return [...byPage.entries()].sort((a, b) => a[0] - b[0])
  }, [mistakes])

  return (
    <div className="sheetover" role="dialog" aria-label={t.review.title} onClick={onClose}>
      <div className="review" onClick={(e) => e.stopPropagation()}>
        <header className="review-head">
          <b>{t.review.title}</b>
          <button className="review-x" onClick={onClose} aria-label={t.review.close}>✕</button>
        </header>

        {rows.length === 0 && <p className="review-empty">{t.review.empty}</p>}

        {rows.map(([page, items]) => (
          <section key={page} className="review-page">
            <button className="review-pageno" onClick={() => { onGo(page); onClose() }}>
              {t.nav.page} {pageDigits(printedPage(page))}
            </button>
            <ul>
              {items.map((it) => (
                <li key={it.id} className={it.kind === 'luqma' ? 'r-luqma' : 'r-atakna'}>
                  <span className="r-word" lang="ar" dir="rtl">{it.text}</span>
                  <span className="r-ref" dir="rtl">
                    {SURAH_NAMES[it.surah]} {pageDigits(it.surah)}:{pageDigits(it.ayah)}
                  </span>
                  <span className="r-kind">
                    {it.kind === 'luqma' ? t.luqma(1).replace(/[\d۰-۹٠-٩]+\s*/, '') : t.atakna(1).replace(/[\d۰-۹٠-٩]+\s*/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {rows.length > 0 && (
          <button className="review-clear" onClick={() => { onClear(); onClose() }}>
            {t.review.clear}
          </button>
        )}
      </div>
    </div>
  )
}
