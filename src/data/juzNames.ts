/**
 * The traditional name of each para, as the printed Mushaf heads its pages.
 *
 * Every page in this Mushaf is headed with the para's NUMBER AND NAME, not the
 * number alone — printed 363 reads ۲۱ اتل مآ اوحی ۲۱. A para is named after the
 * words it opens with, which is how students refer to them: nobody says "para
 * twenty-one", they say "Utlu ma oohiya".
 *
 * Transcribed from the index on printed pages 553-554 (قرآن مجید کی سورتوں کی
 * فہرست), which lists all thirty against their start pages.
 *
 * These are Quranic words, so like the surah names they stay in Arabic script
 * in all three UI languages and are never transliterated on the page.
 */
export const JUZ_NAME: Record<number, string> = {
  1: 'الٓمّٓ',
  2: 'سَیَقُوْل',
  3: 'تِلْکَ الرُّسُل',
  4: 'لَنْ تَنَالُوا',
  5: 'وَالْمُحْصَنٰت',
  6: 'لَایُحِبُّ اللّٰہ',
  7: 'وَاِذَا سَمِعُوْا',
  8: 'وَلَوْ اَنَّنَا',
  9: 'قَالَ الْمَلَاُ',
  10: 'وَاعْلَمُوْا',
  11: 'یَعْتَذِرُوْن',
  12: 'وَمَا مِنْ دَآبَّۃ',
  13: 'وَمَآ اُبَرِّئُ',
  14: 'رُبَمَا',
  15: 'سُبْحٰنَ الَّذِیْ',
  16: 'قَالَ اَلَمْ',
  17: 'اِقْتَرَبَ لِلنَّاس',
  18: 'قَدْ اَفْلَحَ',
  19: 'وَقَالَ الَّذِیْنَ',
  20: 'اَمَّنْ خَلَقَ',
  21: 'اُتْلُ مَاۤ اُوْحِیَ',
  22: 'وَمَنْ یَّقْنُتْ',
  23: 'وَمَا لِیَ',
  24: 'فَمَنْ اَظْلَمُ',
  25: 'اِلَیْہِ یُرَدُّ',
  26: 'حٰمٓ',
  27: 'قَالَ فَمَا خَطْبُکُمْ',
  28: 'قَدْ سَمِعَ اللّٰہُ',
  29: 'تَبٰرَکَ الَّذِیْ',
  30: 'عَمَّ',
}
