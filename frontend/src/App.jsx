// src/App.jsx
import React, { useContext, useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import GoogleLoginModal from './components/GoogleLoginModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeMarketplace from './components/ResumeMarketplace';
import { API_URL } from './services/api.js';

// Lazy-loaded pages
const AtyantLandingPage    = lazy(() => import('./components/AtyantLandingPage'));
const Login                = lazy(() => import('./components/Login'));
const Signup               = lazy(() => import('./components/signup'));
const ForgotPassword       = lazy(() => import('./components/ForgotPassword'));
const ResetPasswordPage    = lazy(() => import('./components/ResetPasswordPage'));
const AuthSuccess          = lazy(() => import('./components/AuthSuccess'));
const InternshipPage       = lazy(() => import('./components/InternshipPage'));
const CareerGuidesPage     = lazy(() => import('./components/CareerGuidesPage'));
const PublicProfilePage    = lazy(() => import('./components/PublicProfilePage'));
const ProfilePage          = lazy(() => import('./components/ProfilePage'));
const IntelligenceTerminal = lazy(() => import('./components/intelligenceTerminal'));
const CommunityChat        = lazy(() => import('./components/CommunityChat'));
const WebinarRegistration  = lazy(() => import('./components/WebinarRegistration'));
const PrivacyPolicy        = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService       = lazy(() => import('./components/TermsOfService'));

function App() {
  const location = useLocation();
  const { user, login } = useContext(AuthContext);

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCommunityChat, setShowCommunityChat] = useState(false);

  const isNewHomePage      = location.pathname === '/home';
  const isIntelligencePage = location.pathname === '/intelligence';
  const isAuthPage         = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isWebinarPage      = location.pathname === '/webinar';
  const isResumeStorePage  = location.pathname === '/resume-store';

  // Show Google modal once per session if not logged in
  useEffect(() => {
    if (!user && !localStorage.getItem('atyant_google_modal_dismissed')) {
      setShowGoogleModal(true);
    }
  }, [user]);

  // Listen for community chat open event from Navbar
  useEffect(() => {
    const handler = () => setShowCommunityChat(true);
    window.addEventListener('openCommunityChat', handler);
    return () => window.removeEventListener('openCommunityChat', handler);
  }, []);

  const handleGoogleSuccess = useCallback((credentialResponse) => {
    if (!credentialResponse?.credential) return;
    fetch(`${API_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          login(data.token);
          setShowGoogleModal(false);
          localStorage.setItem('atyant_google_modal_dismissed', 'true');
        } else if (data.message?.toLowerCase().includes('signup')) {
          window.location.href = '/signup';
        }
      })
      .catch(console.error);
  }, [login]);

  const handleModalClose = useCallback(() => {
    setShowGoogleModal(false);
    localStorage.setItem('atyant_google_modal_dismissed', 'true');
  }, []);

  const hideShell = isNewHomePage || isIntelligencePage || isAuthPage || isWebinarPage || isResumeStorePage;

  return (
    <div className="App">
      {!hideShell && <Navbar />}
      <main>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary>
            <Routes>
              {/* ── Public ── */}
              <Route path="/home"              element={<AtyantLandingPage />} />
              <Route path="/login"             element={<Login />} />
              <Route path="/signup"            element={<Signup />} />
              <Route path="/forgot-password"   element={<ForgotPassword />} />
              <Route path="/reset-password"    element={<ResetPasswordPage />} />
              <Route path="/auth-success"      element={<AuthSuccess />} />
              <Route path="/internships"       element={<InternshipPage />} />
              <Route path="/dad"               element={<InternshipPage />} />
              <Route path="/career-guides"     element={<CareerGuidesPage />} />
              <Route path="/profile/:username" element={<PublicProfilePage />} />
              <Route path="/resume-store"      element={<ResumeMarketplace />} />
              <Route path="/webinar"           element={<WebinarRegistration />} />
              <Route path="/privacy"           element={<PrivacyPolicy />} />
              <Route path="/terms"             element={<TermsOfService />} />

              {/* ── Protected ── */}
              <Route path="/intelligence" element={<ProtectedRoute><IntelligenceTerminal /></ProtectedRoute>} />
              <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </main>

      {!hideShell && <Footer />}
      <Analytics />

      {showCommunityChat && (
        <Suspense fallback={null}>
          <CommunityChat onClose={() => setShowCommunityChat(false)} />
        </Suspense>
      )}

      <GoogleLoginModal
        isOpen={showGoogleModal && !user}
        onSuccess={handleGoogleSuccess}
        onError={() => {}}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;
