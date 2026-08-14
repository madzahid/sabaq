import { read, write } from '../lib/store'

/**
 * The three UI languages. The Quranic text is always Arabic in all three —
 * only the chrome around the page changes. See strings.ts.
 */
export type Locale = 'ur' | 'en' | 'ar'

export const LOCALES: readonly Locale[] = ['ur', 'en', 'ar'] as const

/** Direction of the UI chrome. The Mushaf sheet itself is always rtl. */
export const DIR: Record<Locale, 'rtl' | 'ltr'> = { ur: 'rtl', en: 'ltr', ar: 'rtl' }

/** What the switcher shows. Each language names itself, never translated. */
export const ENDONYM: Record<Locale, string> = { ur: 'اردو', en: 'EN', ar: 'عربي' }

const STORAGE_KEY = 'sabaq.locale'

function isLocale(v: unknown): v is Locale {
  return v === 'ur' || v === 'en' || v === 'ar'
}

/* ------------------------------------------------------------------ *
 * Region detection
 *
 * Offline first: there is no IP lookup and no network call. Everything
 * below is read off the device — the language list the user configured
 * and the IANA timezone. That is all we get, and it is enough.
 * ------------------------------------------------------------------ */

/** Language subtags spoken where the Indo-Pak Mushaf is the standard script. */
const URDU_LANGS = new Set(['ur', 'pa', 'sd', 'ps', 'ks', 'bal', 'brh', 'hi'])

const URDU_REGIONS = new Set(['PK', 'IN'])

const ARAB_REGIONS = new Set([
  'SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'SY', 'IQ', 'YE',
  'PS', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO', 'DJ', 'KM', 'TD', 'ER',
])

/** Timezones are the last resort — a phone in English with no region tag. */
const URDU_ZONES = new Set(['Asia/Karachi', 'Asia/Kolkata', 'Asia/Calcutta'])

const ARAB_ZONE_PREFIXES = [
  'Asia/Riyadh', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Kuwait', 'Asia/Bahrain',
  'Asia/Muscat', 'Asia/Baghdad', 'Asia/Amman', 'Asia/Beirut', 'Asia/Damascus',
  'Asia/Aden', 'Asia/Hebron', 'Asia/Gaza', 'Africa/Cairo', 'Africa/Khartoum',
  'Africa/Tripoli', 'Africa/Tunis', 'Africa/Algiers', 'Africa/Casablanca',
  'Africa/Nouakchott', 'Africa/Mogadishu', 'Africa/Djibouti',
]

function deviceLanguages(): string[] {
  if (typeof navigator === 'undefined') return []
  const nav = navigator as Navigator & { userLanguage?: string }
  const list = nav.languages && nav.languages.length ? nav.languages : [nav.language]
  return list.filter(Boolean).concat(nav.userLanguage ? [nav.userLanguage] : [])
}

function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

/**
 * Pakistan / India -> Urdu, Arab countries -> Arabic, everywhere else -> English.
 *
 * Language tags win over timezone, because a user who set their phone to Arabic
 * while living in London means it. Region subtags are checked before the bare
 * timezone for the same reason: en-PK is a deliberate statement, Asia/Karachi
 * is only a guess.
 */
export function detectLocale(): Locale {
  const langs = deviceLanguages()

  // 1. An explicit Arabic or Urdu-belt language tag.
  for (const tag of langs) {
    const [base = '', ...rest] = tag.toLowerCase().split(/[-_]/)
    if (base === 'ar') return 'ar'
    if (URDU_LANGS.has(base)) return 'ur'
    void rest
  }

  // 2. A region subtag on any tag, e.g. en-PK or en-AE.
  for (const tag of langs) {
    const region = tag.split(/[-_]/)[1]?.toUpperCase()
    if (!region) continue
    if (URDU_REGIONS.has(region)) return 'ur'
    if (ARAB_REGIONS.has(region)) return 'ar'
  }

  // 3. Timezone, for devices that report a bare language with no region.
  const tz = timezone()
  if (URDU_ZONES.has(tz)) return 'ur'
  if (ARAB_ZONE_PREFIXES.some((z) => tz === z)) return 'ar'

  return 'en'
}

/** The stored choice if the user has made one, otherwise a fresh detection. */
export function loadLocale(): Locale {
  const saved = read(STORAGE_KEY)
  if (isLocale(saved)) return saved
  return detectLocale()
}

export function saveLocale(locale: Locale): void {
  write(STORAGE_KEY, locale)
}

/**
 * Write the detected locale only if the reader has never had one stored.
 *
 * localStorage is shared by every tab on the origin, so an unconditional write
 * on mount lets a tab that was opened earlier clobber a language the reader
 * chose in another tab a moment ago. Only the genuine first run needs this;
 * after that, setLocale is the only thing allowed to write.
 */
export function persistLocaleIfUnset(locale: Locale): void {
  if (read(STORAGE_KEY) === null) write(STORAGE_KEY, locale)
}
