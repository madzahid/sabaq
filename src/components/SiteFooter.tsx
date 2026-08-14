const YEAR = new Date().getFullYear()

/**
 * Web footer. Not rendered in the native app.
 * Keep it quiet — the Mushaf is the page, this is a signature.
 */
export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <p className="foot-main">
        بنایا&nbsp;ہے{' '}
        <a href="https://xuro.net" target="_blank" rel="noopener noreferrer">
          Zahid&nbsp;Abbasi
        </a>{' '}
        نے — <a href="https://xuro.net" target="_blank" rel="noopener noreferrer">xuro.net</a>
      </p>

      <p className="foot-sub">
        حفظ کرنے والوں کے لیے، صدقۂ جاریہ کی نیت سے۔
      </p>

      <nav className="foot-links" aria-label="روابط">
        <a href="https://github.com/madzahid/sabaq" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span aria-hidden="true">·</span>
        <a href="https://xuro.net" target="_blank" rel="noopener noreferrer">xuro.net</a>
        <span aria-hidden="true">·</span>
        <a href="/about">تعارف</a>
      </nav>

      <p className="foot-legal">
        © {YEAR} Zahid Abbasi · 16 سطری اِنڈوپاک مصحف · قرآنی متن مستند نسخوں سے
      </p>
    </footer>
  )
}
