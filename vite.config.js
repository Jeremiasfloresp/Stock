// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/Stock/', // Usa el nombre de tu repositorio exactamente
  plugins: [vue()]
})