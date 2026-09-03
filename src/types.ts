export type TajweedRule =
  | 'ghunnah' | 'idgham_ghunnah' | 'idgham_shafawi'
  | 'ikhafa' | 'ikhafa_shafawi' | 'iqlab'
  | 'qalaqah'
  | 'slnt' | 'ham_wasl' | 'laam_shamsiyah'
  | 'idgham_wo_ghunnah' | 'idgham_mutajanisayn' | 'idgham_mutaqaribayn'
  | 'madda_normal' | 'madda_permissible' | 'madda_obligatory' | 'madda_necessary'

/** One character's rule, or null. Length always equals [...word.text].length */
export type Marks = (TajweedRule | null)[]

export interface Word {
  id: number
  surah: number
  ayah: number
  position: number
  text: string
  /** true when this "word" is the ayah-number glyph, not a real word */
  isMarker: boolean
  marks: Marks | null
}

export type LineType = 'ayah' | 'surah_name' | 'basmallah'

export interface Line {
  lineNo: number
  type: LineType
  isCentered: boolean
  surah: number | null
  words: Word[]
}

/** A mark printed in the page margin, not part of the text. */
export type MarkerKind = 'ruku' | 'sajdah' | 'rub' | 'nisf' | 'thalatha'

export interface Marker {
  lineNo: number
  kind: MarkerKind
  /** The glyph or word as printed, where the mark is a word. */
  label: string | null
  /** Ruku only: ayahs in the ruku, printed above the ع. */
  nAbove: number | null
  /** Ruku only: the ruku's number within its para, printed below the ع. */
  nBelow: number | null
}

export interface Page {
  page: number
  juz: number
  surah: number
  firstAyah: string
  lines: Line[]
  markers: Marker[]
  /** Printed at the foot of every page in this Mushaf. */
  manzil: number | null
  /**
   * True when a para opens on this page. The print bands that line in green;
   * it is always the page's first ayah line.
   */
  paraStart: boolean
}

/** A mark made by whoever is listening to the student recite. */
export type MistakeKind =
  | 'luqma'        // لقمہ — had to be prompted. The metric madrasas grade by.
  | 'atakna'       // اٹکنا — hesitated, recovered alone
  | 'substitution'
  | 'omission'
  | 'mutashabih'   // jumped to a parallel ayah
  | 'tajweed'

export interface Mistake {
  wordId: number
  kind: MistakeKind
  /** ms offset into the session recording */
  at: number
}
