import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'pawloka.svg',
        'pawloka-192.png',
        'pawloka-512.png',
      ],
      manifest: {
        name: 'PawLoka — Pet Adoption & Shelter Directory',
        short_name: 'PawLoka',
        description:
          'Temukan hewan untuk diadopsi dan shelter tepercaya.',
        theme_color: '#d7f0e2',
        background_color: '#fffdf6',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pawloka-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pawloka-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pawloka-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
  host: '127.0.0.1',
  port: 4173,
  strictPort: true,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:3001',
      changeOrigin: true,
    },
  },
},
})