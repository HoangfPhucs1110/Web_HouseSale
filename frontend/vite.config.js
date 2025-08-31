import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy:
      mode === 'development'
        ? {
            '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
  },
  plugins: [react(), tailwindcss()],
}));
