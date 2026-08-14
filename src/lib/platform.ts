/**
 * True on the web build. False inside the Capacitor app, where the OS provides
 * navigation chrome and every pixel of screen height matters to a reader.
 */
export function isWeb(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return !cap?.isNativePlatform?.()
}
