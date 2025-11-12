import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  
  build: {
    minify: 'esbuild', // ✅ USE THIS
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react','react-dom','react-router-dom'],
          socket: ['socket.io-client']
        }
      }
    }
  },
  
  esbuild: { drop: ['console','debugger'] }
});