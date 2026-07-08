import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    
  ],
   base: '/Agency-63-EMS/',
   build: {
    chunkSizeWarningLimit: 1000, // silences the warning, quick fix
  },
})
