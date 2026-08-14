import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // sql.js resolves to dist/sql-wasm-browser.js, which is UMD/CommonJS. It must
  // go through Vite's dep pre-bundling so the CJS->ESM interop gives us a real
  // default export. Excluding it here serves the raw CJS file and the import of
  // initSqlJs fails at module-link time, blanking the whole app.
  // The .wasm is NOT bundled either way: scripts/copy-wasm.js puts it in public/
  // and db/quran.ts fetches it at runtime via locateFile.
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
