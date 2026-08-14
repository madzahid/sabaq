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
