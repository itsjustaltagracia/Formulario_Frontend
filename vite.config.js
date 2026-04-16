import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Configuramos el proxy para que el frontend (5173) hable con el backend (3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // HEMOS QUITADO EL 'rewrite' porque tu backend SÍ espera recibir la palabra '/api'
        secure: false,
      }
    }
  }
})