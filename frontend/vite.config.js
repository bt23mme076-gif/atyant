import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split React libraries separately
            if (id.includes('react/')) return 'react-core';
            if (id.includes('react-dom/')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('@tanstack/react-query')) return 'react-query';
            if (id.includes('socket.io-client')) return 'socket';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('swiper')) return 'swiper';
            // Everything else
            return 'vendor';
          }
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react']
  }
});