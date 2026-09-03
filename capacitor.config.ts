import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.quranforhifz.app',
  appName: 'Quran for Hifz',
  webDir: 'dist',
  // Everything is bundled; the app must never need the network.
  server: { androidScheme: 'https' },
}

export default config
