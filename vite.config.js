import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
 
export default defineConfig({
  base: '/',
 
  plugins: [
    react(),
 
    VitePWA({
      registerType: 'autoUpdate',
 
      includeAssets: ['icons/*.png'],
 
      manifest: {
        name: 'X2P — Expense & Spend',
        short_name: 'X2P',
        description:
          'X2P mobile expense capture, budget control and approvals — built on EmeraldX2P.',
 
        theme_color: '#046307',
        background_color: '#F6F8F4',
 
        display: 'standalone',
        orientation: 'portrait',
 
        start_url: '/',
        scope: '/',
 
        icons: [
          {
            src: 'icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
 
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,png,svg,ico,woff2}'
        ],
 
        navigateFallback: '/index.html',
 
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',
 
            handler: 'CacheFirst',
 
            options: {
              cacheName: 'x2p-images',
 
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
 
      devOptions: {
        enabled: true
      }
    })
  ]
})