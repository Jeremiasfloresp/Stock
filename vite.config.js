import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/Stock/',  // Cambia 'Stock' por el nombre de tu repositorio
  plugins: [vue()]
})