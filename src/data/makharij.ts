/**
 * The tooth names labelled on the makharij diagram (printed page 552).
 *
 * The artwork itself is left exactly as the Mushaf prints it — the labels on it
 * are handwritten Arabic and Urdu, and redrawing them in three languages would
 * mean re-lettering anatomy by hand. Getting a tooth wrong in a Qur'an app is
 * not a risk worth taking for a cosmetic gain.
 *
 * Instead the terms are listed here with their meanings, so an English or
 * Arabic reader can follow the picture. The Arabic term is the thing to learn
 * in any case — every tajweed teacher names these in Arabic, whatever language
 * the lesson is in.
 */
export interface MakhrajTerm {
  ar: string
  translit: string
  ur: string
  en: string
  arDesc: string
}

export const MAKHRAJ_TERMS: MakhrajTerm[] = [
  { ar: 'ثَنَايَا عُلْيَا', translit: 'Thanaya ulya',
    ur: 'اوپر کے دو سامنے والے دانت', en: 'The two upper front teeth',
    arDesc: 'السنّتان الأماميتان العلويتان' },
  { ar: 'ثَنَايَا سُفْلَى', translit: 'Thanaya sufla',
    ur: 'نیچے کے دو سامنے والے دانت', en: 'The two lower front teeth',
    arDesc: 'السنّتان الأماميتان السفليتان' },
  { ar: 'رَبَاعِيَة', translit: 'Rubaiya',
    ur: 'سامنے والے دانتوں کے ساتھ والے دانت', en: 'The teeth next to the front two',
    arDesc: 'ما يلي الثنايا من الأسنان' },
  { ar: 'نَاب', translit: 'Nab',
    ur: 'کچلی — نوکیلا دانت', en: 'The canine — the pointed tooth',
    arDesc: 'السنّ المدبّب' },
  { ar: 'ضَاحِكَة', translit: 'Dahika',
    ur: 'کچلی کے بعد والا دانت', en: 'The tooth just behind the canine',
    arDesc: 'ما يلي الناب' },
  { ar: 'طَوَاحِن', translit: 'Tawahin',
    ur: 'پیسنے والے دانت', en: 'The grinding teeth',
    arDesc: 'أسنان الطحن' },
  { ar: 'نَوَاجِذ', translit: 'Nawajidh',
    ur: 'سب سے آخری ڈاڑھیں', en: 'The last molars — the wisdom teeth',
    arDesc: 'أواخر الأضراس' },
  { ar: 'أَضْرَاس', translit: 'Adras',
    ur: 'ڈاڑھیں — سب پچھلے دانت', en: 'The molars, taken together',
    arDesc: 'الأضراس جميعًا' },
]
