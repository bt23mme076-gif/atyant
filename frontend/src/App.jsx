// src/App.jsx
import React, { useContext, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import { Bot } from 'lucide-react';
import './components/FloatingAIButton.css';

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
const InternshipJourney = lazy(() => import('./components/InternshipJourney'));

function App() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [showAIChat, setShowAIChat] = useState(false);
  const isChatPage = location.pathname === '/chat';
  const isHomePage = location.pathname === '/';

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
    </div>
  );
}

export default App;