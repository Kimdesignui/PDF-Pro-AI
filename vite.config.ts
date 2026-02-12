import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // THÊM DÒNG NÀY: Giúp trình duyệt tìm đúng file assets trên GitHub Pages
  base: '/PDF-Pro-AI/', 
  build: {
    // Hỗ trợ Top-level await cho các thư viện PDF hiện đại
    target: 'esnext',
    outDir: 'dist',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
