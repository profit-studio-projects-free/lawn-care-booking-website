import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Use relative asset paths so the production build works whether it is served
  // from a domain root or a subfolder (e.g. Hostinger public_html). Absolute
  // "/assets/..." paths 404 when the build is hosted in a subdirectory, which
  // causes a blank white page. This does not affect local dev or app behavior.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
