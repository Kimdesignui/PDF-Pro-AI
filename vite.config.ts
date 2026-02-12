import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // THÊM DÒNG NÀY: Thay 'PDF-Pro-AI' bằng đúng tên Repository trên GitHub của bạn
  base: '/PDF-Pro-AI/', 
  build: {
    target: 'esnext', // Hỗ trợ Top-level await
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
