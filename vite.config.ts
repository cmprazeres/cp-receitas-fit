import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Isto garante que o process.env.API_KEY do Vercel seja injetado no código do browser
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env': {} 
  },
  server: {
    port: 3000
  }
});