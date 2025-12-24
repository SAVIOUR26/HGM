import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './',
  publicDir: 'public',
  base: '/', // Root path for web deployment
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    manifest: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/api',
        changeOrigin: true
      }
    }
  }
});