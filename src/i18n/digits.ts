/**
 * Numerals.
 *
 * The Indo-Pak Mushaf sets every number — juz, page, surah, ruku, manzil — in
 * Arabic-Indic digits, in the Urdu/Persian forms (۴ ۵ ۶), not the Arabic ones
 * (٤ ٥ ٦). Anything printed on the page therefore uses `pageDigits`, whatever
 * the UI language is, for the same reason surah names stay Arabic: it has to
 * match the copy in the student's hands.
 *
 * The chrome around the page is free to use the reader's own numerals.
 */
const INDO_PAK = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const ARABIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

function convert(n: number | string, table: readonly string[]): string {
  return String(n).replace(/\d/g, (d) => table[Number(d)])
}

/** Digits as printed on the Mushaf page. Always Indo-Pak, never localised. */
export function pageDigits(n: number | string): string {
  return convert(n, INDO_PAK)
}

/** Digits for UI chrome, in the reader's own script. */
export function uiDigits(n: number | string, locale: 'ur' | 'en' | 'ar'): string {
  if (locale === 'en') return String(n)
  return convert(n, locale === 'ar' ? ARABIC : INDO_PAK)
}
