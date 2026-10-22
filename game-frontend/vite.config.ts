import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@audio': fileURLToPath(new URL('src/audio', import.meta.url)),
      '@game': fileURLToPath(new URL('src/game', import.meta.url)),
      '@components': fileURLToPath(new URL('src/components', import.meta.url)),
      '@hooks': fileURLToPath(new URL('src/hooks', import.meta.url)),
      '@styles': fileURLToPath(new URL('src/styles', import.meta.url)),
      '@types-app': fileURLToPath(new URL('src/types', import.meta.url)),
      '@utils': fileURLToPath(new URL('src/utils', import.meta.url)),
    },
  },
});
