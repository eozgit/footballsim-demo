import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toLocaleTimeString()),
  },
  base: './',
  plugins: [
    react(),
  ],
  server: {
    port: 8080
  }
})
