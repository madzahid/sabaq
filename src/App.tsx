import { useCallback, useEffect, useState } from 'react'
import { PAGE_COUNT, getPage, open } from './db/quran'
import { useHifzMode } from './features/useHifzMode'
import { useListening } from './features/useListening'
import MushafPage from './components/MushafPage'
import type { Page } from './types'

const START_PAGE = 363

export default function App() {
  const [page, setPage] = useState<Page | null>(null)
  const [pageNo, setPageNo] = useState(START_PAGE)
  const [error, setError] = useState<string | null>(null)

  const hifz = useHifzMode()
  const listening = useListening()

  useEffect(() => {
    open()
      .then(() => setPage(getPage(START_PAGE)))
      .catch((e: Error) => setError(e.message))
  }, [])

  const go = useCallback((n: number) => {
    const clamped = Math.min(PAGE_COUNT, Math.max(1, n))
    setPageNo(clamped)
    setPage(getPage(clamped))
  }, [])

  const onTapWord = useCallback((id: number) => {
    if (hifz.active) hifz.peek(id)
    else listening.mark(id)
  }, [hifz, listening])

  if (error) return <div className="msg">ڈیٹا لوڈ نہیں ہوا: {error}</div>
  if (!page) return <div className="msg">لوڈ ہو رہا ہے…</div>

  return (
    <div className={hifz.active ? 'app blur' : 'app'}>
      <nav className="bar">
        <span>صفحہ</span>
        <input
          type="number" min={1} max={PAGE_COUNT} value={pageNo}
          onChange={(e) => go(Number(e.target.value))}
        />
        <button onClick={() => go(pageNo - 1)} aria-label="پچھلا صفحہ">◀</button>
        <button onClick={() => go(pageNo + 1)} aria-label="اگلا صفحہ">▶</button>
        <span className="spacer" />
        {listening.luqmaCount > 0 && (
          <span className="count">لقمے: {listening.luqmaCount}</span>
        )}
        <button className={hifz.active ? 'on' : ''} onClick={hifz.toggle}>
          حفظ موڈ
        </button>
      </nav>

      <MushafPage
        page={page}
        marked={new Set(listening.mistakes.map((m) => m.wordId))}
        peeked={hifz.peeked}
        onTapWord={onTapWord}
      />
    </div>
  )
}
