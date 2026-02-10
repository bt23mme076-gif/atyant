// src/App.jsx
import React, { useContext, useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import { MessageCircle } from 'lucide-react';
import './components/CommunityChatButton.css';
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
const InternshipPage = lazy(() => import('./components/InternshipPage'));
const CommunityChat = lazy(() => import('./components/CommunityChat'));
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
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCommunityChat, setShowCommunityChat] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [currentNotification, setCurrentNotification] = useState(0);
  
  // Random community activity messages
  const communityNotifications = [
    '💬 Join the Community Chat!',
    '👋 Hello from VNIT students!',
    '🙋‍♀️ Shwati: Need placement help',
    '🎉 Priyanka got intern at IIM!',
    '🔬 Ravi got IIT research intern!',
    '💼 Arjun cracked Google SDE role',
    '🚀 Live discussions happening now',
    '🎓 MANIT students sharing tips',
    '✨ Get instant career guidance',
    '🤝 Connect with 500+ students',
    '📚 Rohan sharing coding resources',
    '💡 Neha got Microsoft internship',
    '🏆 Success stories daily shared',
    '🔥 Active mentors online now!',
  ];
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

  // Listen for community chat open event from Navbar
  React.useEffect(() => {
    const handleOpenCommunityChat = () => {
      setShowCommunityChat(true);
    };
    window.addEventListener('openCommunityChat', handleOpenCommunityChat);
    return () => window.removeEventListener('openCommunityChat', handleOpenCommunityChat);
  }, []);

  // Handle community chat toggle with debounce
  const handleToggleCommunityChat = React.useCallback(() => {
    setShowCommunityChat(prev => !prev);
    setNewMessageCount(0); // Reset count when opening chat
  }, []);

  // Rotate notification messages every 5 seconds (only on homepage)
  React.useEffect(() => {
    if (!isHomePage || showCommunityChat) return;

    const interval = setInterval(() => {
      setCurrentNotification(prev => (prev + 1) % communityNotifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHomePage, showCommunityChat, communityNotifications.length]);

  // Check for new community messages
  React.useEffect(() => {
    if (!user || showCommunityChat) return;

    const checkNewMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/api/community-chat/messages?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const messages = await response.json();
          if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            
            // Initialize lastMessageId on first load
            if (!lastMessageId) {
              setLastMessageId(latestMessage._id);
              return;
            }

            // Check if there's a new message
            if (latestMessage._id !== lastMessageId) {
              setNewMessageCount(prev => prev + 1);
              setLastMessageId(latestMessage._id);
            }
          }
        }
      } catch (error) {
        // Silently fail - don't spam console
      }
    };

    // Check immediately
    checkNewMessages();

    // Then check every 15 seconds
    const interval = setInterval(checkNewMessages, 15000);

    return () => clearInterval(interval);
  }, [user, showCommunityChat, lastMessageId, API_URL]);

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
      
      {/* Community Chat Floating Button - Only on Home Page (visible to everyone) */}
      {!showCommunityChat && isHomePage && (
        <button 
          className={`community-chat-fab ${newMessageCount > 0 ? 'has-new-messages' : ''}`}
          onClick={handleToggleCommunityChat}
          title="Open Community Chat"
          aria-label="Open Community Chat"
        >
          <MessageCircle size={24} />
          <span className="pulse-ring"></span>
          {newMessageCount > 0 && (
            <>
              <span className="notification-badge pulse">
                {newMessageCount > 9 ? '9+' : newMessageCount}
              </span>
              <span className="new-message-text">New!</span>
            </>
          )}
          {/* Flying Pop-Pop Notification - Shows after 2 seconds */}
          <span className="flying-notification" key={currentNotification}>
            {communityNotifications[currentNotification]}
          </span>
        </button>
      )}

      {/* Community Chat Modal */}
      {showCommunityChat && (
        <Suspense fallback={null}>
          <CommunityChat onClose={() => setShowCommunityChat(false)} />
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