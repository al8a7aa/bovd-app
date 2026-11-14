import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // relative paths, so the build works from any folder on GitHub Pages
  base: './',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node' },
})
