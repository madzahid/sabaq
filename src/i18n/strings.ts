import type { Locale } from './locale'

/**
 * Every string of UI chrome, in the three UI languages.
 *
 * What is NOT in here, deliberately:
 *   - Quranic text. It comes from the database and is always Arabic.
 *   - The basmallah and the "سورة" heading on a surah-name line. Those are
 *     printed on the page, so they are page content, not chrome.
 *   - Surah names. Always Arabic — they must match the printed header the
 *     student is looking at. See i18n/surahs.ts.
 *   - The author's name. It lives in SiteFooter.tsx, public/about.html and
 *     package.json, and nowhere else. The strings below are the words that
 *     surround it, which is why the credit is split into before/after.
 */
export interface Strings {
  /** Accessible name of the brand link. */
  brand: string

  nav: {
    label: string
    prev: string
    next: string
    pageNumber: string
  }

  /** Juz label in the page header, e.g. "پارہ 21". */
  juz: string

  hifzMode: string
  luqma: (n: number) => string

  language: string

  loading: string
  loadFailed: (reason: string) => string

  footer: {
    /** Wraps the author's name, which stays literal in SiteFooter.tsx. */
    creditBefore: string
    creditAfter: string
    tagline: string
    linksLabel: string
    about: string
    /** Follows "© {year} {name}" in the legal line. */
    legalAfterName: string
  }
}

const ur: Strings = {
  brand: 'سبق',
  nav: {
    label: 'مصحف',
    prev: 'پچھلا صفحہ',
    next: 'اگلا صفحہ',
    pageNumber: 'صفحہ نمبر',
  },
  juz: 'پارہ',
  hifzMode: 'حفظ موڈ',
  luqma: (n) => `لقمے ${n}`,
  language: 'زبان',
  loading: 'لوڈ ہو رہا ہے…',
  loadFailed: (reason) => `ڈیٹا لوڈ نہیں ہوا: ${reason}`,
  footer: {
    creditBefore: 'بنایا ہے ',
    creditAfter: ' نے',
    tagline: 'حفظ کرنے والوں کے لیے، صدقۂ جاریہ کی نیت سے۔',
    linksLabel: 'روابط',
    about: 'تعارف',
    legalAfterName: ' · 16 سطری اِنڈوپاک مصحف · قرآنی متن مستند نسخوں سے',
  },
}

const en: Strings = {
  brand: 'Sabaq',
  nav: {
    label: 'Mushaf',
    prev: 'Previous page',
    next: 'Next page',
    pageNumber: 'Page number',
  },
  juz: 'Juz',
  hifzMode: 'Hifz mode',
  luqma: (n) => (n === 1 ? '1 luqma' : `${n} luqmas`),
  language: 'Language',
  loading: 'Loading…',
  loadFailed: (reason) => `Could not load the data: ${reason}`,
  footer: {
    creditBefore: 'Built by ',
    creditAfter: '',
    tagline: 'For those memorising the Quran — intended as sadaqah jariyah.',
    linksLabel: 'Links',
    about: 'About',
    legalAfterName: ' · 16-line Indo-Pak Mushaf · Quranic text from verified copies',
  },
}

const ar: Strings = {
  brand: 'سبق',
  nav: {
    label: 'المصحف',
    prev: 'الصفحة السابقة',
    next: 'الصفحة التالية',
    pageNumber: 'رقم الصفحة',
  },
  juz: 'الجزء',
  hifzMode: 'وضع الحفظ',
  luqma: (n) => `اللقمات ${n}`,
  language: 'اللغة',
  loading: 'جارٍ التحميل…',
  loadFailed: (reason) => `تعذّر تحميل البيانات: ${reason}`,
  footer: {
    creditBefore: 'أنشأه ',
    creditAfter: '',
    tagline: 'لحفظة القرآن الكريم، بنيّة صدقة جارية.',
    linksLabel: 'روابط',
    about: 'تعريف',
    legalAfterName: ' · مصحف إندوباك بستة عشر سطرًا · النص القرآني من نسخ موثّقة',
  },
}

export const STRINGS: Record<Locale, Strings> = { ur, en, ar }
