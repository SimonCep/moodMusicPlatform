import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    https: {
      key: fs.readFileSync('/app/certs/key.pem'),
      cert: fs.readFileSync('/app/certs/cert.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://backend:8000',
        secure: false,
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
