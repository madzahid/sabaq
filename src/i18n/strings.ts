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

  /**
   * Progress through the current para. Not printed in any Mushaf — the page
   * header gives the para number and the footer gives the manzil, but neither
   * answers "how much of this para is left", which is the thing a student
   * mid-revision actually wants to know.
   */
  progress: {
    /** Accessible name for the whole strip. */
    label: string
    /** e.g. "Page 3 of 20". */
    position: (index: number, total: number) => string
    /** e.g. "17 pages left". Never called with 0 — see lastPage. */
    remaining: (n: number) => string
    /** Shown in place of remaining() on the final page of a para. */
    lastPage: string
  }

  /**
   * The tajweed colour key. The printed Mushaf carries one of these on its
   * inside pages ("رنگوں کے استعمال کی تفصیل") listing four colours; our text
   * data marks two more, so the panel lists what the app actually paints.
   *
   * The rule NAMES stay Arabic in every language — they are the names of the
   * rules, not translations of them, and a student learns them in Arabic. Only
   * the explanations are translated.
   */
  tajweed: {
    /** Button and panel title. */
    title: string
    /** One line under the title. */
    intro: string
    /** Closing note: colour is an aid, a teacher is not optional. */
    note: string
    ghunnah: string
    ikhfa: string
    qalqala: string
    madd: string
    silent: string
    /** Tab labels for the three references. */
    tabColours: string
    tabWaqf: string
    tabMakharij: string
    /** Waqf tab: one line under the title. */
    waqfIntro: string
    /** Makharij tab: caption under the diagram. */
    makharijIntro: string
    makharijCredit: string
    /** The diagram's two headings, printed on the artwork in Urdu. */
    jawUpper: string
    jawLower: string
    /** Heading above the list of tooth names. */
    teeth: string
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
  brand: 'قرآن برائے حفظ',
  nav: {
    label: 'قرآن پاک',
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
  progress: {
    label: 'پارے میں پیش رفت',
    position: (i, total) => `صفحہ ${uiDigits(i, 'ur')} از ${uiDigits(total, 'ur')}`,
    remaining: (n) => `${uiDigits(n, 'ur')} ${n === 1 ? 'صفحہ' : 'صفحے'} باقی`,
    lastPage: 'پارے کا آخری صفحہ',
  },
  tajweed: {
    title: 'تجوید',
    intro: 'متن کے رنگ تجوید کے قواعد بتاتے ہیں۔',
    note: 'رنگ صرف یاد دہانی ہیں۔ تجوید اُستاد سے سیکھی جاتی ہے، کتاب سے نہیں۔',
    ghunnah: 'ناک سے آواز، دو حرکت کی مقدار میں۔',
    ikhfa: 'حرف کو چھپا کر، غنّہ کے ساتھ ہلکا پڑھنا۔',
    qalqala: 'ساکن حرف میں ہلکا جھٹکا۔',
    madd: 'آواز کو کھینچنا۔',
    silent: 'لکھا ہوا ہے مگر پڑھا نہیں جاتا۔',
    tabColours: 'رنگ',
    tabWaqf: 'رموزِ اوقاف',
    tabMakharij: 'مخارج',
    waqfIntro: 'یہ نشانات بتاتے ہیں کہ کہاں ٹھہرنا ہے اور کہاں نہیں۔',
    makharijIntro: 'حروف کے مخارج — منہ میں وہ مقام جہاں سے حرف نکلتا ہے۔',
    makharijCredit: 'یہی نقشہ اسی قرآن پاک کے صفحہ ۵۵۲ پر چھپا ہے۔',
    jawUpper: 'بالائی جبڑا',
    jawLower: 'بایاں نصف جبڑا',
    teeth: 'دانتوں کے نام',
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
  brand: 'Quran for Hifz',
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
  progress: {
    label: 'Progress through this para',
    position: (i, total) => `Page ${i} of ${total}`,
    remaining: (n) => (n === 1 ? '1 page left' : `${n} pages left`),
    lastPage: 'Last page of the para',
  },
  tajweed: {
    title: 'Tajweed',
    intro: 'The colours in the Quran text mark the rules of tajweed.',
    note: 'The colours are a reminder only. Tajweed is learnt from a teacher, not from a page.',
    ghunnah: 'A nasal sound, held for about two counts.',
    ikhfa: 'The letter is hidden — sounded lightly, with ghunnah.',
    qalqala: 'A slight echo on a letter with sukoon.',
    madd: 'The sound is stretched.',
    silent: 'Written, but not pronounced.',
    tabColours: 'Colours',
    tabWaqf: 'Pause marks',
    tabMakharij: 'Makharij',
    waqfIntro: 'These marks tell you where to stop and where not to.',
    makharijIntro: 'Makharij — the point in the mouth each letter is sounded from.',
    makharijCredit: 'The same chart is printed on page 552 of this Mushaf.',
    jawUpper: 'The upper jaw',
    jawLower: 'The left half of the jaw',
    teeth: 'The teeth, named',
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
  brand: 'القرآن للحفظ',
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
  progress: {
    label: 'التقدّم في الجزء',
    position: (i, total) => `صفحة ${uiDigits(i, 'ar')} من ${uiDigits(total, 'ar')}`,
    // Arabic counts its nouns by number: 1 takes واحدة, 2 the dual, 3-10 the
    // plural, 11 and above the singular again. An Arabic reader notices.
    remaining: (n) => {
      if (n === 1) return 'صفحة واحدة متبقية'
      if (n === 2) return 'صفحتان متبقيتان'
      if (n <= 10) return `${uiDigits(n, 'ar')} صفحات متبقية`
      return `${uiDigits(n, 'ar')} صفحة متبقية`
    },
    lastPage: 'آخر صفحة في الجزء',
  },
  tajweed: {
    title: 'التجويد',
    intro: 'ألوان النص تدلّ على أحكام التجويد.',
    note: 'الألوان تذكيرٌ فحسب؛ والتجويد يُؤخذ عن شيخ لا من صفحة.',
    ghunnah: 'صوت من الأنف بمقدار حركتين.',
    ikhfa: 'إخفاء الحرف ونطقه خفيفًا مع الغنّة.',
    qalqala: 'اضطراب يسير في الحرف الساكن.',
    madd: 'إطالة الصوت.',
    silent: 'يُكتب ولا يُنطق.',
    tabColours: 'الألوان',
    tabWaqf: 'رموز الأوقاف',
    tabMakharij: 'المخارج',
    waqfIntro: 'هذه العلامات تدلّ على مواضع الوقف والوصل.',
    makharijIntro: 'المخارج — موضع خروج الحرف من الفم.',
    makharijCredit: 'هذا الرسم مطبوع في صفحة ٥٥٢ من هذا المصحف.',
    jawUpper: 'الفكّ الأعلى',
    jawLower: 'النصف الأيسر من الفكّ',
    teeth: 'أسماء الأسنان',
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
