import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
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
