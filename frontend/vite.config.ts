import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: false,
        bypass(req) {
          // Don't proxy WebSocket connections - return the original URL to bypass proxy
          if (req.url?.startsWith('/api/ws')) {
            return req.url;
          }
        },
      }
    }
  }
})
