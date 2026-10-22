import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vitest configuration — separate from vite.config.ts to avoid plugin
 * version conflicts between Vite 6 and Vitest 2's bundled Vite.
 */
export default defineConfig({
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
