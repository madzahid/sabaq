/**
 * localStorage that cannot throw.
 *
 * Storage is unavailable in Safari private mode, can be disabled by policy,
 * and throws on quota. None of that is worth crashing a Mushaf over — the app
 * must still open and render the page. Every failure here degrades to "the
 * preference does not persist", never to an error.
 */

export function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
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
