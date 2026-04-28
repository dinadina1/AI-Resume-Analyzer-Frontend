import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // target: 'http://localhost:3000',
        target: 'https://ai-resume-analyzer-backend-hdh5.onrender.com',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    strictPort: true
  }
});
