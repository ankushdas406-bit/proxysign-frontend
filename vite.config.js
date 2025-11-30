import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ DEFAULT WORKING VITE CONFIG (NO HTTPS)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // allow phone access
    port: 5173       // keep same port
  }
})
