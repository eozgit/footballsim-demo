import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    BUILD_TIME: JSON.stringify(new Date().toLocaleTimeString()),
  },
  base: './',
  plugins: [
    react(),
  ],
  server: {
    port: 8080
  }
})
