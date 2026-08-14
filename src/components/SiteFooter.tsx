import { useLocale } from '../i18n/useLocale'

const YEAR = new Date().getFullYear()

/** Author credit. One of exactly three places this name appears — the others
 *  are public/about.html and package.json. It is never translated, so it is
 *  never allowed into i18n/strings.ts; the strings there are the words that
 *  surround it. */
const AUTHOR = 'Zahid Abbasi'
const SITE = 'https://xuro.net'

/**
 * Web footer. Not rendered in the native app.
 * Keep it quiet — the Mushaf is the page, this is a signature.
 */
export default function SiteFooter() {
  const { t } = useLocale()

  return (
    <footer className="site-foot">
      <p className="foot-main">
        {t.footer.creditBefore}
        <a className="author" href={SITE} target="_blank" rel="noopener noreferrer">{AUTHOR}</a>
        {t.footer.creditAfter} —{' '}
        <a href={SITE} target="_blank" rel="noopener noreferrer">xuro.net</a>
      </p>

      <p className="foot-sub">{t.footer.tagline}</p>

      {/* about.html is a plain file in public/, not a route. The .html must
          stay: without it Vite's SPA fallback serves index.html and the link
          silently re-renders the Mushaf. BASE_URL keeps it correct if the app
          is ever deployed under a sub-path. */}
      <nav className="foot-links" aria-label={t.footer.linksLabel}>
        <a href="https://github.com/madzahid/sabaq" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span aria-hidden="true">·</span>
        <a href={SITE} target="_blank" rel="noopener noreferrer">xuro.net</a>
        <span aria-hidden="true">·</span>
        <a href={`${import.meta.env.BASE_URL}about.html`}>{t.footer.about}</a>
      </nav>

      <p className="foot-legal">
        © {YEAR} {AUTHOR}{t.footer.legalAfterName}
      </p>
    </footer>
  )
}
