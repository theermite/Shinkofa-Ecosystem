import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Podcast The Ermite',
        short_name: 'PodcastErm',
        description: 'App enrichissement podcast audio',
        theme_color: '#192040',
        background_color: '#eaeaeb',
        display: 'standalone',
        icons: []
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: false
  }
});
