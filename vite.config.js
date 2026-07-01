import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single-file preview mode (VITE_SINGLEFILE=1) inlines all JS/CSS into one
// index.html that opens straight from the filesystem — no server needed. Pair
// with VITE_HASH_ROUTER=true so routing works under file://.
const singlefile = process.env.VITE_SINGLEFILE === '1'

// Base path: '/' for local dev / custom domains; on GitHub Pages project sites
// the deploy workflow sets VITE_BASE=/<repo-name>/. Single-file uses relative.
const base = singlefile ? './' : process.env.VITE_BASE || '/'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const plugins = [react()]
  if (singlefile) {
    const { viteSingleFile } = await import('vite-plugin-singlefile')
    plugins.push(viteSingleFile())
  }
  return {
    base,
    plugins,
    server: {
      host: true,
      port: 5173,
    },
  }
})
