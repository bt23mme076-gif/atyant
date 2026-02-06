// src/App.jsx
import React, { useContext, useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import { Bot } from 'lucide-react';
import './components/FloatingAIButton.css';
import GoogleLoginModal from './components/GoogleLoginModal';

// ✅ KEEP THESE (Need immediately)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// ✅ LAZY LOAD HEAVY COMPONENTS
const Home = lazy(() => import('./components/Home'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/signup'));
const ChatPage = lazy(() => import('./components/ChatPage'));
const MentorListPage = lazy(() => import('./components/MentorListPage'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const PublicProfilePage = lazy(() => import('./components/PublicProfilePage'));
const NearbyMentors = lazy(() => import('./components/NearbyMentors'));
const AIChat = lazy(() => import('./components/AIChat'));
const InternshipPage = lazy(() => import('./components/InternshipPage'));
const EngineView = lazy(() => import('./components/EngineView')); // ✅ ATYANT ENGINE
const MentorDashboard = lazy(() => import('./components/MentorDashboard')); // ✅ MENTOR DASHBOARD
const MyQuestions = lazy(() => import('./components/MyQuestions')); // ✅ USER QUESTIONS LIST
const EnhancedAskQuestion = lazy(() => import('./components/EnhancedAskQuestion')); // ✅ NEW ENHANCED ASK FLOW
const InternshipJourney = lazy(() => import('./components/InternshipJourney'));
const IITLinksPage = lazy(() => import('./components/IITLinksPage'));
const IIMLinksPage = lazy(() => import('./components/IIMLinksPage'));
const IIMDirectory = lazy(() => import('./components/IIMDirectory'));
const IITDirectory = lazy(() => import('./components/IITDirectory'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));


function App() {
  const location = useLocation();
  const { user, login } = useContext(AuthContext);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const isChatPage = location.pathname === '/chat';
  const isHomePage = location.pathname === '/';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '906654136908-h073tkun6s64bitgliluu03nr66bqbne.apps.googleusercontent.com';

  // Show modal on first visit if not logged in and not dismissed
  React.useEffect(() => {
    // Debug: Log modal logic
    console.log('Auth modal check:', { user, dismissed: localStorage.getItem('atyant_google_modal_dismissed') });
    if (!user && !localStorage.getItem('atyant_google_modal_dismissed')) {
      setShowGoogleModal(true);
    }
  }, [user]);

  // Google login handler (used by both modal and button)
  const handleGoogleSuccess = (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) return;
    fetch(`${API_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          login(data.token);
          setShowGoogleModal(false);
          localStorage.setItem('atyant_google_modal_dismissed', 'true');
        } else if (data.message && data.message.toLowerCase().includes('signup')) {
          // Redirect to signup page if signup required
          window.location.href = '/signup';
        } else {
          // Show error
          alert(data.message || 'Google login failed.');
        }
      });
  };

  const handleGoogleError = () => {
    // Optionally show a toast or error message
  };

  const handleModalClose = () => {
    setShowGoogleModal(false);
    localStorage.setItem('atyant_google_modal_dismissed', 'true');
  };

  return (
    <div className={isChatPage && user ? 'App chat-active' : 'App'}>
      <Navbar />
      <main>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary>
            <Routes>
              {/* ========== PUBLIC ROUTES ========== */}
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* ✅ INTERNSHIP PAGE - PUBLIC (but links are protected) */}
              <Route path="/internships" element={<InternshipPage />} />
              <Route path="/internship-journey" element={<InternshipJourney />} />
              <Route path="/iit-links" element={<IITLinksPage />} />
              <Route path="/iim-links" element={<IIMLinksPage />} />
              <Route path="/iim-directory" element={<IIMDirectory />} />
              <Route path="/iim-list" element={<IIMDirectory />} />
              <Route path="/iit-list"  element={<IITDirectory />} />

              
              {/* ========== PROTECTED ROUTES ========== */}
            
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/mentors" element={
                <ProtectedRoute>
                  <MentorListPage />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ChatPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/chat/:mentorId" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ChatPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:username" element={<PublicProfilePage />} />
              <Route path="/nearby-mentors" element={
                <ProtectedRoute>
                  <NearbyMentors />
                </ProtectedRoute>
              } />
              
              {/* ✅ ATYANT ENGINE ROUTES */}
              <Route path="/engine/:questionId" element={
                <ProtectedRoute>
                  <EngineView />
                </ProtectedRoute>
              } />
              
              <Route path="/my-questions" element={
                <ProtectedRoute>
                  <MyQuestions />
                </ProtectedRoute>
              } />
              
              {/* ✅ NEW ENHANCED ASK QUESTION FLOW */}
              <Route path="/ask" element={
                <ProtectedRoute>
                  <EnhancedAskQuestion />
                </ProtectedRoute>
              } />
              
              {/* ✅ MENTOR DASHBOARD */}
              <Route path="/mentor-dashboard" element={
                <ProtectedRoute>
                  <MentorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/internship-journey" element={
                <ProtectedRoute>
                  <InternshipJourney />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </main>
      {!isChatPage && <Footer />}
      <Analytics />
      
      {isHomePage && (
        <button 
          className="ai-chat-fab"
          onClick={() => setShowAIChat(true)}
          title="Need help? Ask AI"
        >
          <Bot size={24} />
          <span className="pulse-ring"></span>
        </button>
      )}

      {showAIChat && (
        <Suspense fallback={null}>
          <AIChat onClose={() => setShowAIChat(false)} />
        </Suspense>
      )}
      {/* Google Login Modal Integration */}
      <GoogleLoginModal
        isOpen={showGoogleModal && !user}
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;