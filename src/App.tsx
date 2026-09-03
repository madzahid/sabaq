import { useCallback, useEffect, useRef, useState } from 'react'
import { PAGE_COUNT, getPage, open } from './db/quran'
import { useHifzMode } from './features/useHifzMode'
import { useListening } from './features/useListening'
import { usePageTurn } from './features/usePageTurn'
import { useLocale } from './i18n/useLocale'
import { loadLastPage, saveLastPage } from './lib/lastPage'
import { readPageFromUrl, writePageToUrl } from './lib/url'
import { isWeb } from './lib/platform'
import MushafPage from './components/MushafPage'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import ReviewPanel from './components/ReviewPanel'
import TajweedPanel from './components/TajweedPanel'
import type { Page } from './types'

export default function App() {
  const [page, setPage] = useState<Page | null>(null)
  // Page 1 for a new reader, otherwise wherever they left off. The URL is
  // NOT read here — see the effect below.
  const [pageNo, setPageNo] = useState(loadLastPage)
  const [error, setError] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [tajweedOpen, setTajweedOpen] = useState(false)

  // Captured once so the open-on-mount effect does not re-run as the reader
  // turns pages. The database is opened exactly once per session.
  const openAt = useRef(pageNo)

  const { t } = useLocale()
  const hifz = useHifzMode()
  const listening = useListening()
  const web = isWeb()

  useEffect(() => {
    open()
      .then(() => {
        // The URL is read HERE, not in the useState initialiser, and the
        // difference is a real bug that shipped: ?page=363 opened page 364.
        //
        // A printed page number is converted to our internal index with the
        // offset stored in the database, and the database is opened by this
        // effect. Read a moment earlier and the offset is still 0, so every
        // shared link landed one page late.
        //
        // A page in the URL wins over the remembered one: the reader followed
        // a link to a specific page, and honouring the bookmark instead would
        // silently take them somewhere else.
        const start = readPageFromUrl() ?? openAt.current
        setPageNo(start)
        setPage(getPage(start))
        // Normalise the address: a link with a junk or out-of-range page has
        // been resolved to a real one, and the bar should say so.
        writePageToUrl(start)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const go = useCallback((n: number) => {
    if (!Number.isFinite(n)) return
    const clamped = Math.min(PAGE_COUNT, Math.max(1, n))
    setPageNo(clamped)
    setPage(getPage(clamped))
    saveLastPage(clamped)
    writePageToUrl(clamped)
    window.scrollTo({ top: 0 })
  }, [])

  const goPrev = useCallback(() => go(pageNo - 1), [go, pageNo])
  const goNext = useCallback(() => go(pageNo + 1), [go, pageNo])
  usePageTurn(goPrev, goNext)

  const onTapWord = useCallback((id: number) => {
    if (hifz.active) hifz.peek(id)
    else listening.mark(id)
  }, [hifz, listening])

  if (error) return <div className="msg">{t.loadFailed(error)}</div>
  if (!page) return <div className="msg">{t.loading}</div>

  return (
    <div className={hifz.active ? 'app blur' : 'app'}>
      <SiteHeader
        pageNo={pageNo}
        surah={page.surah}
        juz={page.juz}
        onGo={go}
        hifzActive={hifz.active}
        onToggleHifz={hifz.toggle}
        luqmaCount={listening.luqmaCount}
        ataknaCount={listening.ataknaCount}
        onReview={() => setReviewing(true)}
        onTajweed={() => setTajweedOpen(true)}
      />

      <main>
        <MushafPage
          page={page}
          marked={listening.kinds}
          peeked={hifz.peeked}
          onTapWord={onTapWord}
        />
      </main>

      {reviewing && (
        <ReviewPanel
          mistakes={listening.mistakes}
          onGo={go}
          onClose={() => setReviewing(false)}
          onClear={listening.clear}
        />
      )}

      {tajweedOpen && <TajweedPanel onClose={() => setTajweedOpen(false)} />}

      {web && <SiteFooter />}
    </div>
  )
}
