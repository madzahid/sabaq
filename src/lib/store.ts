/**
 * localStorage that cannot throw.
 *
 * Storage is unavailable in Safari private mode, can be disabled by policy,
 * and throws on quota. None of that is worth crashing a Mushaf over — the app
 * must still open and render the page. Every failure here degrades to "the
 * preference does not persist", never to an error.
 */

/**
 * Keys carry the app's name, and the app was renamed from Sabaq to Quran for
 * Hifz. A reader who had already used it has their last page, their language
 * and their marks under the old prefix — losing those on an update would be a
 * silent data loss, and the marks in particular are somebody's evening of
 * listening.
 *
 * So a read that misses the new key falls back to the old one and copies the
 * value across. The old key is deliberately NOT deleted: an older build left
 * open in another tab still reads it, and leaving it costs a few bytes.
 */
const LEGACY_PREFIX = 'sabaq.'
const PREFIX = 'qfh.'

export function read(key: string): string | null {
  try {
    const v = localStorage.getItem(key)
    if (v !== null) return v

    if (!key.startsWith(PREFIX)) return null
    const legacy = localStorage.getItem(LEGACY_PREFIX + key.slice(PREFIX.length))
    if (legacy === null) return null

    localStorage.setItem(key, legacy)
    return legacy
  } catch {
    return null
  }
}

export function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Preference will not survive a reload. Not worth surfacing.
  }
}
