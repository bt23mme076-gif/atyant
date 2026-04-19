// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { inject } from '@vercel/analytics'; // if using analytics
inject(); // if using analytics
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async'; // ✅ NEW IMPORT
import { initCarouselFix } from './utils/carouselFix';
import QueryProvider from './providers/QueryProvider';
import './registerSW';

initCarouselFix();

// Permanent Root Fix for "Failed to fetch dynamically imported module"
// This happens when a new version is deployed and the browser tries to load old JS chunks.
const handleChunkError = async (error) => {
  const message = error?.message || error?.toString() || '';
  if (message.includes('Failed to fetch dynamically imported module') || 
      message.includes('Loading chunk') || 
      message.includes('ChunkLoadError')) {
    
    const lastReload = sessionStorage.getItem('atyant_root_reload');
    const now = Date.now();
    
    // Prevent infinite loops: only reload if last reload was > 10s ago
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem('atyant_root_reload', now.toString());
      console.warn('Chunk error detected. Clearing all caches and forcing refresh...');
      
      // Clear all caches to be 100% sure we get the newest version from server
      try {
        if ('caches' in window) {
          const names = await window.caches.keys();
          await Promise.all(names.map(name => window.caches.delete(name)));
        }
        // Unregister service workers as well
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(r => r.unregister()));
        }
      } catch (e) {
        console.error('Cache clear failed:', e);
      }
      
      window.location.reload();
    }
  }
};

window.addEventListener('error', (e) => handleChunkError(e), true);
window.addEventListener('unhandledrejection', (e) => handleChunkError(e.reason));

// // ✅ Register service worker for caching
// if ('serviceWorker' in navigator && import.meta.env.PROD) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('SW registered');
//       })
//       .catch(err => {
//         console.log('SW registration failed:', err);
//       });
//   });
// }

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '906654136908-78n0mflji3f1tipai19auc545bf96tdj.apps.googleusercontent.com';

// Debug: Check if client ID is loaded
if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID missing in .env, using hardcoded fallback');
} else {
  console.log('✅ Google Client ID loaded from .env');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider> {/* ✅ ADD THIS */}
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <QueryProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </QueryProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider> {/* ✅ CLOSE HERE */}
  </React.StrictMode>
);