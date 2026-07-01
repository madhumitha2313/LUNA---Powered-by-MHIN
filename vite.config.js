import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: '/' for local dev and custom domains; on GitHub Pages project
// sites the deploy workflow sets VITE_BASE=/<repo-name>/ so assets resolve.
const base = process.env.VITE_BASE || '/'

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
