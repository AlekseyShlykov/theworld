import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deployment: Set base to your repository name
// Example: if repo is "GGS-4.1", base should be "/GGS-4.1/"
// For root domain deployment, use "/"
export default defineConfig({
  base: '/GGS-4.1/', // TODO: Update this to match your GitHub repository name
  plugins: [react()],
  server: {
    port: 3002
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper handling of public assets
    copyPublicDir: true
  }
})

