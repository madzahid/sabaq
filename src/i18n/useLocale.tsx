import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react'
import { DIR, loadLocale, saveLocale, type Locale } from './locale'
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
