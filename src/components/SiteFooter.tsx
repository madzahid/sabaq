import type { Locale } from '../i18n/locale'
import { useLocale } from '../i18n/useLocale'

const YEAR = new Date().getFullYear()

/**
 * Author credit. One of exactly three places this name appears — the others
 * are public/about.html and package.json.
 *
 * The name is transliterated, not translated, so all three forms stay HERE
 * rather than moving into i18n/strings.ts. Putting them there would make the
 * credit live in a fourth place and quietly break the rule above.
 */
const AUTHOR: Record<Locale, string> = {
  ur: 'زاہد عباسی',
  en: 'Zahid Abbasi',
  ar: 'زاهد عباسي',
}

const SITE = 'https://xuro.net'
/** The credit points at the author's about page, not the site root. */
const AUTHOR_URL = 'https://xuro.net/about'

/**
 * Web footer. Not rendered in the native app.
 * Keep it quiet — the Mushaf is the page, this is a signature.
 */
export default function SiteFooter() {
  const { locale, t } = useLocale()
  const author = AUTHOR[locale]

  return (
    <footer className="site-foot">
      <p className="foot-main">
        {t.footer.creditBefore}
        <a className="author" href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">{author}</a>
        {t.footer.creditAfter}
      </p>

      <p className="foot-sub">{t.footer.tagline}</p>

      {/* about.html is a plain file in public/, not a route. The .html must
          stay: without it Vite's SPA fallback serves index.html and the link
          silently re-renders the Mushaf. BASE_URL keeps it correct if the app
          is ever deployed under a sub-path. */}
      <nav className="foot-links" aria-label={t.footer.linksLabel}>
        <a href={`${import.meta.env.BASE_URL}guide.html`}>{t.footer.guide}</a>
        <span aria-hidden="true">·</span>
        <a href={`${import.meta.env.BASE_URL}about.html`}>{t.footer.about}</a>
      </nav>

      <p className="foot-legal">
        © {YEAR} {author}{t.footer.legalAfterName}
      </p>

      {/* Left in English in all three languages: it is a maker's mark, the same
          way the قرآن wordmark does not translate. Move it into
          i18n/strings.ts if it should ever read in Urdu and Arabic. */}
      <p className="foot-brand">
        Proudly developed by{' '}
        <a href={SITE} target="_blank" rel="noopener noreferrer">Xuro.Net</a>
      </p>
    </footer>
  )
}
