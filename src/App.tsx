import { useCallback, useEffect, useState } from 'react'
import { PAGE_COUNT, getPage, open } from './db/quran'
import { useHifzMode } from './features/useHifzMode'
import { useListening } from './features/useListening'
import { isWeb } from './lib/platform'
import MushafPage from './components/MushafPage'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import type { Page } from './types'

const START_PAGE = 363

export default function App() {
  const [page, setPage] = useState<Page | null>(null)
  const [pageNo, setPageNo] = useState(START_PAGE)
  const [error, setError] = useState<string | null>(null)

  const hifz = useHifzMode()
  const listening = useListening()
  const web = isWeb()

  useEffect(() => {
    open()
      .then(() => setPage(getPage(START_PAGE)))
      .catch((e: Error) => setError(e.message))
  }, [])

  const go = useCallback((n: number) => {
    if (!Number.isFinite(n)) return
    const clamped = Math.min(PAGE_COUNT, Math.max(1, n))
    setPageNo(clamped)
    setPage(getPage(clamped))
    window.scrollTo({ top: 0 })
  }, [])

  const onTapWord = useCallback((id: number) => {
    if (hifz.active) hifz.peek(id)
    else listening.mark(id)
  }, [hifz, listening])

  if (error) return <div className="msg">ڈیٹا لوڈ نہیں ہوا: {error}</div>
  if (!page) return <div className="msg">لوڈ ہو رہا ہے…</div>

  return (
    <div className={hifz.active ? 'app blur' : 'app'}>
      <SiteHeader
        pageNo={pageNo}
        onGo={go}
        hifzActive={hifz.active}
        onToggleHifz={hifz.toggle}
        luqmaCount={listening.luqmaCount}
      />

      <main>
        <MushafPage
          page={page}
          marked={new Set(listening.mistakes.map((m) => m.wordId))}
          peeked={hifz.peeked}
          onTapWord={onTapWord}
        />
      </main>

      {web && <SiteFooter />}
    </div>
  )
}
