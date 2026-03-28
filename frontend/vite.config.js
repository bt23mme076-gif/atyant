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
      manifest: require('./public/manifest.json'),
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
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