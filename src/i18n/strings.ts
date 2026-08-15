import { uiDigits } from './digits'
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
    surah: string
    juz: string
    page: string
  }

  /** Juz label in the page header, e.g. "پارہ 21". */
  juz: string

  hifzMode: string
  luqma: (n: number) => string
  /** اٹکنا — faltered but recovered without being prompted. */
  atakna: (n: number) => string

  language: string

  review: {
    title: string
    empty: string
    close: string
    clear: string
  }

  loading: string
  loadFailed: (reason: string) => string

  footer: {
    /** Wraps the author's name, which stays literal in SiteFooter.tsx. */
    creditBefore: string
    creditAfter: string
    tagline: string
    linksLabel: string
    about: string
    /** Link to the usage guide page. */
    guide: string
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
    surah: 'سورت',
    juz: 'پارہ',
    page: 'صفحہ',
  },
  juz: 'پارہ',
  hifzMode: 'حفظ موڈ',
  luqma: (n) => `${uiDigits(n, 'ur')} ${n === 1 ? 'لقمہ' : 'لقمے'}`,
  atakna: (n) => `${uiDigits(n, 'ur')} اَٹْکَن`,
  language: 'زبان',
  review: {
    title: 'نشان زد الفاظ',
    empty: 'ابھی کوئی نشان نہیں۔',
    close: 'بند کریں',
    clear: 'سب نشان مٹا دیں',
  },
  loading: 'لوڈ ہو رہا ہے…',
  loadFailed: (reason) => `ڈیٹا لوڈ نہیں ہوا: ${reason}`,
  footer: {
    creditBefore: '',
    creditAfter: ' کی ایک کاوش',
    tagline: 'حفاظِ کرام اور اُن کے سننے والوں کے لیے — صدقۂ جاریہ کی نیت سے۔',
    linksLabel: 'روابط',
    about: 'تعارف',
    guide: 'رہنمائی',
    legalAfterName: '',
  },
}

const en: Strings = {
  brand: 'Sabaq',
  nav: {
    label: 'Mushaf',
    prev: 'Previous page',
    next: 'Next page',
    pageNumber: 'Page number',
    surah: 'Surah',
    juz: 'Juz',
    page: 'Page',
  },
  juz: 'Juz',
  hifzMode: 'Hifz mode',
  luqma: (n) => (n === 1 ? '1 luqma' : `${n} luqmas`),
  atakna: (n) => (n === 1 ? '1 atakna' : `${n} ataknas`),
  language: 'Language',
  review: {
    title: 'Marked words',
    empty: 'Nothing marked yet.',
    close: 'Close',
    clear: 'Clear all marks',
  },
  loading: 'Loading…',
  loadFailed: (reason) => `Could not load the data: ${reason}`,
  footer: {
    creditBefore: 'A project by ',
    creditAfter: '',
    tagline: 'For those memorising the Quran, and for those who listen to them — as sadaqah jariyah.',
    linksLabel: 'Links',
    about: 'About',
    guide: 'How to use',
    legalAfterName: '',
  },
}

const ar: Strings = {
  brand: 'سبق',
  nav: {
    label: 'المصحف',
    prev: 'الصفحة السابقة',
    next: 'الصفحة التالية',
    pageNumber: 'رقم الصفحة',
    surah: 'السورة',
    juz: 'الجزء',
    page: 'الصفحة',
  },
  juz: 'الجزء',
  hifzMode: 'وضع الحفظ',
  luqma: (n) => `اللقمات ${uiDigits(n, 'ar')}`,
  atakna: (n) => `التعثرات ${uiDigits(n, 'ar')}`,
  language: 'اللغة',
  review: {
    title: 'الكلمات المعلَّمة',
    empty: 'لا توجد علامات بعد.',
    close: 'إغلاق',
    clear: 'مسح كل العلامات',
  },
  loading: 'جارٍ التحميل…',
  loadFailed: (reason) => `تعذّر تحميل البيانات: ${reason}`,
  footer: {
    creditBefore: 'من إنشاء ',
    creditAfter: '',
    tagline: 'لحفظة القرآن الكريم ولمن يستمع إليهم — بنيّة صدقة جارية.',
    linksLabel: 'روابط',
    about: 'تعريف',
    guide: 'دليل الاستخدام',
    legalAfterName: '',
  },
}

export const STRINGS: Record<Locale, Strings> = { ur, en, ar }
