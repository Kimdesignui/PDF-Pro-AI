import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Quan trọng: Target 'esnext' cho phép sử dụng top-level await
    // Đây là yêu cầu bắt buộc khi dùng pdfjs-dist hoặc các thư viện WASM/ESM hiện đại
    target: 'esnext',
    outDir: 'dist',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
});