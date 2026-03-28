// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { inject } from '@vercel/analytics'; // if using analytics
inject(); // if using analytics
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async'; // ✅ NEW IMPORT
import { initCarouselFix } from './utils/carouselFix';
import QueryProvider from './providers/QueryProvider';
import './registerSW';

initCarouselFix();

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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Debug: Check if client ID is loaded
if (!GOOGLE_CLIENT_ID) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not defined!');
  console.log('Available env vars:', import.meta.env);
} else {
  console.log('✅ Google Client ID loaded successfully');
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