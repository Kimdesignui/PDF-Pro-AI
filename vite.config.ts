import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Ép hệ thống dùng chuẩn esnext để hỗ trợ Top-level await
    target: 'esnext', 
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
