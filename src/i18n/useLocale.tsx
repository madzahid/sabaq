import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react'
import { DIR, loadLocale, persistLocaleIfUnset, saveLocale, type Locale } from './locale'
import { STRINGS, type Strings } from './strings'

interface LocaleContextValue {
  locale: Locale
  /** Strings for the active locale. Named `t` so call sites read as t.nav.next */
  t: Strings
  setLocale: (next: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale)

  // Persist the detected locale on first run, not just explicit choices.
  // public/about.html is a plain file that cannot import this module; giving
  // it a value to read is what keeps it from re-implementing detection.
  // Guarded, because every open tab runs this and localStorage is shared.
  useEffect(() => {
    persistLocaleIfUnset(locale)
    // Intentionally first-run only; later changes are saved by setLocale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The <html> element is the single source of truth for direction. Setting it
  // here rather than in index.html is what lets the English build go ltr while
  // the Mushaf sheet stays rtl on its own element.
  useEffect(() => {
    const el = document.documentElement
    el.lang = locale
    el.dir = DIR[locale]
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    saveLocale(next)
  }, [])

  const value = useMemo(
    () => ({ locale, t: STRINGS[locale], setLocale }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
