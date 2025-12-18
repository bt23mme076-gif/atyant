// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initCarouselFix } from './utils/carouselFix';
import QueryProvider from './providers/QueryProvider'; // ✅ NEW IMPORT

initCarouselFix();

// ✅ Register service worker for caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered');
      })
      .catch(err => {
        console.log('SW registration failed:', err);
      });
  });
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <QueryProvider> {/* ✅ WRAP EVERYTHING */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);