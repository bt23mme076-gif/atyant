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
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
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