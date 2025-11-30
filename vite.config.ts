import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages base — MUST match your repo name
  base: '/theworld/',
  plugins: [react()],
  server: {
    port: 3002
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true
  }
})

