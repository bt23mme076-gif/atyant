// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeMarketplace from './components/ResumeMarketplace';

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
const CommunityChat        = lazy(() => import('./components/CommunityChat'));
const WebinarRegistration  = lazy(() => import('./components/WebinarRegistration'));
const PrivacyPolicy        = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService       = lazy(() => import('./components/TermsOfService'));

function App() {
  const location = useLocation();

  const [showCommunityChat, setShowCommunityChat] = useState(false);

  const isNewHomePage      = location.pathname === '/home';
  const isAuthPage         = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isWebinarPage      = location.pathname === '/webinar';
  const isResumeStorePage  = location.pathname === '/resume-store';

  // Listen for community chat open event from Navbar
  useEffect(() => {
    const handler = () => setShowCommunityChat(true);
    window.addEventListener('openCommunityChat', handler);
    return () => window.removeEventListener('openCommunityChat', handler);
  }, []);

  const hideShell = isNewHomePage || isAuthPage || isWebinarPage || isResumeStorePage;

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
    </div>
  );
}

export default App;
