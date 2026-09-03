/**
 * Per-surah metadata printed in the heading band of the 16-line Indo-Pak
 * Mushaf. The printed band carries four numbers, not two:
 *
 *   [ ركوعاتها ]  ◄ (surah no.) سورة الروم مكية (revelation order) ►  [ آياتها ]
 *   [    ٦     ]                                                      [   ٦٠   ]
 *
 * The bracketed number after the name is the surah's place in the ORDER OF
 * REVELATION, not its ayah count — Ar-Rum is the 30th surah in the Mushaf and
 * the 84th revealed, which is exactly what the print shows.
 *
 * GENERATED — do not edit by hand. Built from the QUL metadata already in
 * data/source/metadata: revelation_place, verses_count and revelation_order
 * from quran-metadata-surah-name.sqlite, and the ruku counts from
 * quran-metadata-ruku.json — the same file build_markers.py reads, so the
 * count printed here can never disagree with the ع marks in the margin.
 *
 * Kept as TypeScript rather than a table in quran.sqlite for the same reason
 * surah names are: 114 rows that will never change, needed synchronously at
 * render time, and not worth a query.
 *
 * Verified on generation: 558 rukus, 6236 ayahs, revelation order 1 = Al-Alaq
 * and 114 = An-Nasr, and the ruku counts every hafiz knows (Baqarah 40,
 * Aal-Imran 20, Yaseen 5, Rahman 3).
 */

/** Where the surah was revealed. Printed as مكية / مدنية. */
export type RevelationPlace = 'makkah' | 'madinah'

export interface SurahMeta {
  place: RevelationPlace
  ayahs: number
  rukus: number
  /** Position in the order of revelation. Printed in brackets after the name. */
  order: number
}

export const SURAH_META: Record<number, SurahMeta> = {
  1: { place: 'makkah', ayahs: 7, rukus: 1, order: 5 },  // الفاتحة — Al-Fatihah
  2: { place: 'madinah', ayahs: 286, rukus: 40, order: 87 },  // البقرة — Al-Baqarah
  3: { place: 'madinah', ayahs: 200, rukus: 20, order: 89 },  // آل عمران — Ali 'Imran
  4: { place: 'madinah', ayahs: 176, rukus: 24, order: 92 },  // النساء — An-Nisa
  5: { place: 'madinah', ayahs: 120, rukus: 16, order: 112 },  // المائدة — Al-Ma'idah
  6: { place: 'makkah', ayahs: 165, rukus: 20, order: 55 },  // الأنعام — Al-An'am
  7: { place: 'makkah', ayahs: 206, rukus: 24, order: 39 },  // الأعراف — Al-A'raf
  8: { place: 'madinah', ayahs: 75, rukus: 10, order: 88 },  // الأنفال — Al-Anfal
  9: { place: 'madinah', ayahs: 129, rukus: 16, order: 113 },  // التوبة — At-Tawbah
  10: { place: 'makkah', ayahs: 109, rukus: 11, order: 51 },  // يونس — Yunus
  11: { place: 'makkah', ayahs: 123, rukus: 10, order: 52 },  // هود — Hud
  12: { place: 'makkah', ayahs: 111, rukus: 12, order: 53 },  // يوسف — Yusuf
  13: { place: 'madinah', ayahs: 43, rukus: 6, order: 96 },  // الرعد — Ar-Ra'd
  14: { place: 'makkah', ayahs: 52, rukus: 7, order: 72 },  // ابراهيم — Ibrahim
  15: { place: 'makkah', ayahs: 99, rukus: 6, order: 54 },  // الحجر — Al-Hijr
  16: { place: 'makkah', ayahs: 128, rukus: 16, order: 70 },  // النحل — An-Nahl
  17: { place: 'makkah', ayahs: 111, rukus: 12, order: 50 },  // الإسراء — Al-Isra
  18: { place: 'makkah', ayahs: 110, rukus: 12, order: 69 },  // الكهف — Al-Kahf
  19: { place: 'makkah', ayahs: 98, rukus: 6, order: 44 },  // مريم — Maryam
  20: { place: 'makkah', ayahs: 135, rukus: 8, order: 45 },  // طه — Taha
  21: { place: 'makkah', ayahs: 112, rukus: 7, order: 73 },  // الأنبياء — Al-Anbya
  22: { place: 'madinah', ayahs: 78, rukus: 10, order: 103 },  // الحج — Al-Hajj
  23: { place: 'makkah', ayahs: 118, rukus: 6, order: 74 },  // المؤمنون — Al-Mu'minun
  24: { place: 'madinah', ayahs: 64, rukus: 9, order: 102 },  // النور — An-Nur
  25: { place: 'makkah', ayahs: 77, rukus: 6, order: 42 },  // الفرقان — Al-Furqan
  26: { place: 'makkah', ayahs: 227, rukus: 11, order: 47 },  // الشعراء — Ash-Shu'ara
  27: { place: 'makkah', ayahs: 93, rukus: 7, order: 48 },  // النمل — An-Naml
  28: { place: 'makkah', ayahs: 88, rukus: 9, order: 49 },  // القصص — Al-Qasas
  29: { place: 'makkah', ayahs: 69, rukus: 7, order: 85 },  // العنكبوت — Al-'Ankabut
  30: { place: 'makkah', ayahs: 60, rukus: 6, order: 84 },  // الروم — Ar-Rum
  31: { place: 'makkah', ayahs: 34, rukus: 4, order: 57 },  // لقمان — Luqman
  32: { place: 'makkah', ayahs: 30, rukus: 3, order: 75 },  // السجدة — As-Sajdah
  33: { place: 'madinah', ayahs: 73, rukus: 9, order: 90 },  // الأحزاب — Al-Ahzab
  34: { place: 'makkah', ayahs: 54, rukus: 6, order: 58 },  // سبإ — Saba
  35: { place: 'makkah', ayahs: 45, rukus: 5, order: 43 },  // فاطر — Fatir
  36: { place: 'makkah', ayahs: 83, rukus: 5, order: 41 },  // يس — Ya-Sin
  37: { place: 'makkah', ayahs: 182, rukus: 5, order: 56 },  // الصافات — As-Saffat
  38: { place: 'makkah', ayahs: 88, rukus: 5, order: 38 },  // ص — Sad
  39: { place: 'makkah', ayahs: 75, rukus: 8, order: 59 },  // الزمر — Az-Zumar
  40: { place: 'makkah', ayahs: 85, rukus: 9, order: 60 },  // غافر — Ghafir
  41: { place: 'makkah', ayahs: 54, rukus: 6, order: 61 },  // فصلت — Fussilat
  42: { place: 'makkah', ayahs: 53, rukus: 5, order: 62 },  // الشورى — Ash-Shuraa
  43: { place: 'makkah', ayahs: 89, rukus: 7, order: 63 },  // الزخرف — Az-Zukhruf
  44: { place: 'makkah', ayahs: 59, rukus: 3, order: 64 },  // الدخان — Ad-Dukhan
  45: { place: 'makkah', ayahs: 37, rukus: 4, order: 65 },  // الجاثية — Al-Jathiyah
  46: { place: 'makkah', ayahs: 35, rukus: 4, order: 66 },  // الأحقاف — Al-Ahqaf
  47: { place: 'madinah', ayahs: 38, rukus: 4, order: 95 },  // محمد — Muhammad
  48: { place: 'madinah', ayahs: 29, rukus: 4, order: 111 },  // الفتح — Al-Fath
  49: { place: 'madinah', ayahs: 18, rukus: 2, order: 106 },  // الحجرات — Al-Hujurat
  50: { place: 'makkah', ayahs: 45, rukus: 3, order: 34 },  // ق — Qaf
  51: { place: 'makkah', ayahs: 60, rukus: 3, order: 67 },  // الذاريات — Adh-Dhariyat
  52: { place: 'makkah', ayahs: 49, rukus: 2, order: 76 },  // الطور — At-Tur
  53: { place: 'makkah', ayahs: 62, rukus: 3, order: 23 },  // النجم — An-Najm
  54: { place: 'makkah', ayahs: 55, rukus: 3, order: 37 },  // القمر — Al-Qamar
  55: { place: 'madinah', ayahs: 78, rukus: 3, order: 97 },  // الرحمن — Ar-Rahman
  56: { place: 'makkah', ayahs: 96, rukus: 3, order: 46 },  // الواقعة — Al-Waqi'ah
  57: { place: 'madinah', ayahs: 29, rukus: 4, order: 94 },  // الحديد — Al-Hadid
  58: { place: 'madinah', ayahs: 22, rukus: 3, order: 105 },  // المجادلة — Al-Mujadila
  59: { place: 'madinah', ayahs: 24, rukus: 3, order: 101 },  // الحشر — Al-Hashr
  60: { place: 'madinah', ayahs: 13, rukus: 2, order: 91 },  // الممتحنة — Al-Mumtahanah
  61: { place: 'madinah', ayahs: 14, rukus: 2, order: 109 },  // الصف — As-Saf
  62: { place: 'madinah', ayahs: 11, rukus: 2, order: 110 },  // الجمعة — Al-Jumu'ah
  63: { place: 'madinah', ayahs: 11, rukus: 2, order: 104 },  // المنافقون — Al-Munafiqun
  64: { place: 'madinah', ayahs: 18, rukus: 2, order: 108 },  // التغابن — At-Taghabun
  65: { place: 'madinah', ayahs: 12, rukus: 2, order: 99 },  // الطلاق — At-Talaq
  66: { place: 'madinah', ayahs: 12, rukus: 2, order: 107 },  // التحريم — At-Tahrim
  67: { place: 'makkah', ayahs: 30, rukus: 2, order: 77 },  // الملك — Al-Mulk
  68: { place: 'makkah', ayahs: 52, rukus: 2, order: 2 },  // القلم — Al-Qalam
  69: { place: 'makkah', ayahs: 52, rukus: 2, order: 78 },  // الحاقة — Al-Haqqah
  70: { place: 'makkah', ayahs: 44, rukus: 2, order: 79 },  // المعارج — Al-Ma'arij
  71: { place: 'makkah', ayahs: 28, rukus: 2, order: 71 },  // نوح — Nuh
  72: { place: 'makkah', ayahs: 28, rukus: 2, order: 40 },  // الجن — Al-Jinn
  73: { place: 'makkah', ayahs: 20, rukus: 2, order: 3 },  // المزمل — Al-Muzzammil
  74: { place: 'makkah', ayahs: 56, rukus: 2, order: 4 },  // المدثر — Al-Muddaththir
  75: { place: 'makkah', ayahs: 40, rukus: 2, order: 31 },  // القيامة — Al-Qiyamah
  76: { place: 'madinah', ayahs: 31, rukus: 2, order: 98 },  // الانسان — Al-Insan
  77: { place: 'makkah', ayahs: 50, rukus: 2, order: 33 },  // المرسلات — Al-Mursalat
  78: { place: 'makkah', ayahs: 40, rukus: 2, order: 80 },  // النبإ — An-Naba
  79: { place: 'makkah', ayahs: 46, rukus: 2, order: 81 },  // النازعات — An-Nazi'at
  80: { place: 'makkah', ayahs: 42, rukus: 1, order: 24 },  // عبس — 'Abasa
  81: { place: 'makkah', ayahs: 29, rukus: 1, order: 7 },  // التكوير — At-Takwir
  82: { place: 'makkah', ayahs: 19, rukus: 1, order: 82 },  // الإنفطار — Al-Infitar
  83: { place: 'makkah', ayahs: 36, rukus: 1, order: 86 },  // المطففين — Al-Mutaffifin
  84: { place: 'makkah', ayahs: 25, rukus: 1, order: 83 },  // الإنشقاق — Al-Inshiqaq
  85: { place: 'makkah', ayahs: 22, rukus: 1, order: 27 },  // البروج — Al-Buruj
  86: { place: 'makkah', ayahs: 17, rukus: 1, order: 36 },  // الطارق — At-Tariq
  87: { place: 'makkah', ayahs: 19, rukus: 1, order: 8 },  // الأعلى — Al-A'la
  88: { place: 'makkah', ayahs: 26, rukus: 1, order: 68 },  // الغاشية — Al-Ghashiyah
  89: { place: 'makkah', ayahs: 30, rukus: 1, order: 10 },  // الفجر — Al-Fajr
  90: { place: 'makkah', ayahs: 20, rukus: 1, order: 35 },  // البلد — Al-Balad
  91: { place: 'makkah', ayahs: 15, rukus: 1, order: 26 },  // الشمس — Ash-Shams
  92: { place: 'makkah', ayahs: 21, rukus: 1, order: 9 },  // الليل — Al-Layl
  93: { place: 'makkah', ayahs: 11, rukus: 1, order: 11 },  // الضحى — Ad-Duhaa
  94: { place: 'makkah', ayahs: 8, rukus: 1, order: 12 },  // الشرح — Ash-Sharh
  95: { place: 'makkah', ayahs: 8, rukus: 1, order: 28 },  // التين — At-Tin
  96: { place: 'makkah', ayahs: 19, rukus: 1, order: 1 },  // العلق — Al-'Alaq
  97: { place: 'makkah', ayahs: 5, rukus: 1, order: 25 },  // القدر — Al-Qadr
  98: { place: 'madinah', ayahs: 8, rukus: 1, order: 100 },  // البينة — Al-Bayyinah
  99: { place: 'madinah', ayahs: 8, rukus: 1, order: 93 },  // الزلزلة — Az-Zalzalah
  100: { place: 'makkah', ayahs: 11, rukus: 1, order: 14 },  // العاديات — Al-'Adiyat
  101: { place: 'makkah', ayahs: 11, rukus: 1, order: 30 },  // القارعة — Al-Qari'ah
  102: { place: 'makkah', ayahs: 8, rukus: 1, order: 16 },  // التكاثر — At-Takathur
  103: { place: 'makkah', ayahs: 3, rukus: 1, order: 13 },  // العصر — Al-'Asr
  104: { place: 'makkah', ayahs: 9, rukus: 1, order: 32 },  // الهمزة — Al-Humazah
  105: { place: 'makkah', ayahs: 5, rukus: 1, order: 19 },  // الفيل — Al-Fil
  106: { place: 'makkah', ayahs: 4, rukus: 1, order: 29 },  // قريش — Quraysh
  107: { place: 'makkah', ayahs: 7, rukus: 1, order: 17 },  // الماعون — Al-Ma'un
  108: { place: 'makkah', ayahs: 3, rukus: 1, order: 15 },  // الكوثر — Al-Kawthar
  109: { place: 'makkah', ayahs: 6, rukus: 1, order: 18 },  // الكافرون — Al-Kafirun
  110: { place: 'madinah', ayahs: 3, rukus: 1, order: 114 },  // النصر — An-Nasr
  111: { place: 'makkah', ayahs: 5, rukus: 1, order: 6 },  // المسد — Al-Masad
  112: { place: 'makkah', ayahs: 4, rukus: 1, order: 22 },  // الإخلاص — Al-Ikhlas
  113: { place: 'makkah', ayahs: 5, rukus: 1, order: 20 },  // الفلق — Al-Falaq
  114: { place: 'makkah', ayahs: 6, rukus: 1, order: 21 },  // الناس — An-Nas
}
