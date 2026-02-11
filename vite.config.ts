import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Hỗ trợ các tính năng JS hiện đại cho PDF & AI
    target: 'esnext', 
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
