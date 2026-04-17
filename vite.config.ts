import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Root URL on custom domain (evolutionofcivilizations.earth). Use '/' for local dev.
  base: '/',
  plugins: [react()],
  server: {
    port: 3002,
    host: 'localhost',
    strictPort: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true
  }
})