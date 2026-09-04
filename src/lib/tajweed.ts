import type { Marks, TajweedRule } from '../types'

/** Rule -> CSS class. Seventeen rules, six colours. */
export const RULE_CLASS: Record<TajweedRule, string> = {
  ghunnah: 'gh', idgham_ghunnah: 'gh', idgham_shafawi: 'gh',
  ikhafa: 'ik', ikhafa_shafawi: 'ik', iqlab: 'ik',
  qalaqah: 'ql',
  slnt: 'si', ham_wasl: 'si', laam_shamsiyah: 'si',
  idgham_wo_ghunnah: 'si', idgham_mutajanisayn: 'si', idgham_mutaqaribayn: 'si',
  madda_normal: 'md', madda_permissible: 'md',
  madda_obligatory: 'md', madda_necessary: 'md',
}

/**
 * Rule -> character, for the compact `marks` encoding in the database.
 *
 * The column used to hold JSON: a word with one rule on its first letter was
 * stored as ["ham_wasl",null,null,null,null,null,null]. Across 83,668 words
 * that came to 3.59 MB — most of a database that a reader on a phone has to
 * download before a single word appears. The same word is now "h......".
 *
 * ORDER IS THE FORMAT. Appending a rule is safe; reordering or removing one
 * silently re-labels every mark in the Mushaf, which would put the wrong
 * tajweed colour on the wrong letter. Change it only by rebuilding the
 * database with scripts/compact-db.js in the same commit.
 */
const RULE_CHARS: TajweedRule[] = [
  'ghunnah', 'idgham_ghunnah', 'idgham_shafawi', 'ikhafa', 'ikhafa_shafawi',
  'iqlab', 'qalaqah', 'slnt', 'ham_wasl', 'laam_shamsiyah', 'idgham_wo_ghunnah',
  'idgham_mutajanisayn', 'idgham_mutaqaribayn', 'madda_normal',
  'madda_permissible', 'madda_obligatory', 'madda_necessary',
]

/** '.' means no rule on that character. */
export function decodeMarks(encoded: string | null): Marks | null {
  if (!encoded) return null
  const out: Marks = []
  for (const ch of encoded) {
    out.push(ch === '.' ? null : RULE_CHARS[ch.charCodeAt(0) - 97] ?? null)
  }
  return out
}

export interface Segment { text: string; cls: string | null }

/**
 * Split a word into coloured runs. Adjacent characters sharing a rule collapse
 * into one segment, so a word yields two or three spans instead of thirty.
 */
export function segments(text: string, marks: Marks | null): Segment[] {
  if (!marks) return [{ text, cls: null }]
  const chars = [...text]
  const out: Segment[] = []
  let current: TajweedRule | null = null
  let buffer = ''

  const flush = () => {
    if (!buffer) return
    out.push({ text: buffer, cls: current ? RULE_CLASS[current] : null })
    buffer = ''
  }

  for (let i = 0; i < chars.length; i++) {
    const rule = marks[i] ?? null
    if (rule !== current) { flush(); current = rule }
    buffer += chars[i]
  }
  flush()
  return out
}

/** True for a real word; false for the ayah-number glyph and waqf-only tokens. */
const HARF = /[ء-يٱ-ۓ]/
export const isRealWord = (text: string): boolean => HARF.test(text)
