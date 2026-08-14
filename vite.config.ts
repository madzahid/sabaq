import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // sql.js ships a .wasm that must not be bundled
  optimizeDeps: { exclude: ['sql.js'] },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
