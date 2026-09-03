/**
 * The page each of the 30 paras begins on — internal page numbers.
 *
 * READ OFF THE PRINT, not computed from juz metadata. Every para in this
 * Mushaf begins on the first ayah line of a page, and that line is printed
 * with a green band behind it. All 30 bands were located by scanning the
 * scanned PDF for a full-width pale-green row and discarding the bands that
 * belong to a surah heading; every one landed on the first ayah line of its
 * page, which is how we know the rule holds throughout.
 *
 * Why not derive this from the juz metadata: the Indo-Pak para division and
 * the juz division in quran-metadata-juz.json disagree, in BOTH directions.
 *
 *     para  metadata says   the print says
 *        4  3:93            3:92   — one ayah earlier, page 57
 *        7  5:82            5:83   — one ayah later,  page 111
 *       11  9:93            9:94   — one ayah later,  page 183
 *       21  29:46           29:45  — one ayah earlier, page 363
 *
 * Printed 111 is headed ۷ واذا سمعوا ۷ with وَاِذَا سَمِعُوْا (5:83) banded on
 * line 1; printed 363 is headed ۲۱ اتل مآ اوحی ۲۱ with أُتْلُ مَآ أُوحِىَ
 * (29:45) banded. Both were checked against the printed copy directly.
 *
 * GENERATED — do not edit by hand. Source: the green bands in
 * 16-line-quran-tajwid-colored.pdf, cross-checked against photographs of the
 * printed Mushaf.
 */

/** Internal page each para opens on. printedPage() converts for display. */
export const JUZ_START_PAGE: Record<number, number> = {
  1: 1,   // printed 2
  2: 20,   // printed 21
  3: 38,   // printed 39
  4: 56,   // printed 57
  5: 74,   // printed 75
  6: 92,   // printed 93
  7: 110,   // printed 111
  8: 128,   // printed 129
  9: 146,   // printed 147
  10: 164,   // printed 165
  11: 182,   // printed 183
  12: 200,   // printed 201
  13: 218,   // printed 219
  14: 236,   // printed 237
  15: 254,   // printed 255
  16: 272,   // printed 273
  17: 290,   // printed 291
  18: 308,   // printed 309
  19: 326,   // printed 327
  20: 344,   // printed 345
  21: 362,   // printed 363
  22: 380,   // printed 381
  23: 398,   // printed 399
  24: 416,   // printed 417
  25: 434,   // printed 435
  26: 452,   // printed 453
  27: 470,   // printed 471
  28: 488,   // printed 489
  29: 508,   // printed 509
  30: 528,   // printed 529
}
