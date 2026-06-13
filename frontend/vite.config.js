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
      registerType: 'prompt',
      manifest: require('./public/manifest.json'),
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{png,svg,ico,json,woff,woff2,ttf,eot}'],
        // Do NOT let the SPA navigation fallback hijack the proxied product site.
        // These paths must hit the network so Vercel's rewrites serve the product app.
        navigateFallbackDenylist: [
          /^\/$/,                // exact root "/"  -> product site (Vercel rewrite)
          /^\/product-assets\//, // product asset proxy
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: false,
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