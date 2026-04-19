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
      registerType: 'prompt', // Better to prompt or handle manually for more reliability
      manifest: require('./public/manifest.json'),
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Remove .html from patterns so index.html is NOT cached by service worker
        // This ensures the browser always fetches the latest index.html from server
        globPatterns: ['**/*.{js,css,png,svg,ico,json}'],
      },
    }),
  ],
  build: {
    target: 'esnext', // Modern browsers ke liye faster build
    minify: 'esbuild', // Terser se jyada stable hai React 18 ke liye
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Sabhi node_modules ko ek hi vendor file mein rakhein
        // Isse "Children of undefined" wali error hamesha ke liye khatam ho jayegi
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  // Esbuild debugging ke liye best hai
  esbuild: {
    drop: ['console', 'debugger'],
  }
});