import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Atyant – AI-Powered Student Guidance Engine',
        short_name: 'Atyant',
        description: 'AI matches you with seniors who\'ve already cracked it. Get human-verified roadmaps for internships, placements & career clarity.',
        start_url: '/',
        display: 'standalone',
        theme_color: '#6366f1',
        background_color: '#0a0a0f',
        lang: 'en-IN',
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      },
    })
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  }
});
