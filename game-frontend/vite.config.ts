import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      /**
       * 'autoUpdate' strategy:
       * The service worker updates silently in the background.
       * On next launch the player gets the latest version automatically.
       */
      registerType: 'autoUpdate',

      /**
       * Include all built assets in the precache manifest so the app
       * works fully offline after the first visit.
       */
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'icons/icon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png',
      ],

      /**
       * Web App Manifest — controls how the app looks when installed.
       */
      manifest: {
        name: 'Reverse Audio',
        short_name: 'Reverse Audio',
        description: 'Le jeu où vous imitez les sons à l\'envers — sans Internet !',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8f7ff',
        theme_color: '#6c63ff',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      /**
       * Workbox configuration — cache-first strategy for all assets.
       * Everything is precached so the game works 100% offline.
       */
      workbox: {
        // Precache all JS, CSS, HTML and font assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],

        // Cache-first for all navigation requests (app shell)
        navigateFallback: 'index.html',

        // Runtime caching for any additional network requests
        runtimeCaching: [
          {
            // Cache the app shell itself
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },

      /**
       * Dev options — enable the service worker in dev mode so you can
       * test the offline behaviour locally without deploying.
       */
      devOptions: {
        enabled: false, // Enable manually when testing offline: set to true
        type: 'module',
      },
    }),
  ],

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
