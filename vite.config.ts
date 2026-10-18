import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pwaBuild } from './scripts/pwa-build.js'

export default defineConfig({
  plugins: [react(), pwaBuild()],
})
