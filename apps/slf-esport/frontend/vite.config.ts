import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Custom SPA fallback plugin for Vite
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Skip API requests and static assets
        if (
          req.url?.startsWith('/api') ||
          req.url?.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map)$/)
        ) {
          return next()
        }
        // Rewrite all other requests to /index.html for client-side routing
        if (req.url && !req.url.startsWith('/@') && req.method === 'GET') {
          req.url = '/index.html'
        }
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    spaFallback(),
    VitePWA({
      registerType: 'autoUpdate',
      // Only include PWA essentials - NO app code precaching
      includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png'],
      devOptions: {
        enabled: false,
        type: 'module'
      },
      manifest: {
        name: 'SLF E-Sport Training Platform',
        short_name: 'SLF E-Sport',
        description: 'Plateforme d\'entraînement e-sport holistique La Salade de Fruits',
        theme_color: '#1c3049',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // CRITICAL: Force immediate activation of new SW
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        // MINIMAL PRECACHING: Only PWA icons, NOT app code
        // This ensures users always get fresh JS/CSS/HTML from network
        globPatterns: ['pwa-*.png', 'favicon.ico', 'favicon.png', 'apple-touch-icon.png'],

        // Navigation fallback for SPA
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\.[a-z]+$/i],

        runtimeCaching: [
          // API: Always network, no cache (fresh data)
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkOnly'
          },
          // HTML/JS/CSS: Network first, cache only as offline fallback
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour max
              },
              networkTimeoutSeconds: 3 // Fast timeout, prefer fresh
            }
          },
          // HTML pages: Always fresh
          {
            urlPattern: /\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 3
            }
          },
          // Images: Cache with revalidation (images change less often)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // Fonts: Cache longer (rarely change)
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@theermite/brain-training': path.resolve(__dirname, './brain-training-package/src')
    }
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'lslf.shinkofa.com',
      'devslf.shinkofa.com',
      '217.182.206.127',
      'localhost',
      '.localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false
      }
    },
    fs: {
      strict: false
    },
    middlewareMode: false
  },
  preview: {
    middlewareMode: false
  },
  appType: 'spa',
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-big-calendar', 'recharts'],
          'form-vendor': ['react-hook-form', 'zod']
        }
      }
    }
  }
})
