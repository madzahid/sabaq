import { PAGE_COUNT } from '../db/quran'

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
  return (
    <header className="site-head">
      <a className="brand" href="/" aria-label="سبق">
        <span className="brand-ar">سبق</span>
        <span className="brand-en">Sabaq</span>
      </a>

      <nav className="site-nav" aria-label="مصحف">
        <button onClick={() => onGo(pageNo - 1)} aria-label="پچھلا صفحہ">◀</button>
        <label className="pagebox">
          <span className="sr-only">صفحہ نمبر</span>
          <input
            type="number" min={1} max={PAGE_COUNT} value={pageNo}
            onChange={(e) => onGo(Number(e.target.value))}
          />
          <span className="of">/ {PAGE_COUNT}</span>
        </label>
        <button onClick={() => onGo(pageNo + 1)} aria-label="اگلا صفحہ">▶</button>
      </nav>

      <div className="site-actions">
        {luqmaCount > 0 && <span className="count">لقمے {luqmaCount}</span>}
        <button
          className={hifzActive ? 'primary on' : 'primary'}
          onClick={onToggleHifz}
          aria-pressed={hifzActive}
        >
          حفظ موڈ
        </button>
      </div>
    </header>
  )
}
