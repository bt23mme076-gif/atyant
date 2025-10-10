// src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';

// Import all components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/signup'; // Corrected capitalization
import ChatPage from './components/ChatPage';
import MentorListPage from './components/MentorListPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './components/ProfilePage';
import PublicProfilePage from './components/PublicProfilePage';
import AskQuestionPage from './components/AskQuestionPage';

function App() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const isChatPage = location.pathname === '/chat';

  return (
    <div className={isChatPage && user ? 'App chat-active' : 'App'}>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes (only accessible when logged in) */}
          <Route path="/mentors" element={<ProtectedRoute><MentorListPage /></ProtectedRoute>} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ChatPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />
          <Route path="/ask" element={<ProtectedRoute><AskQuestionPage /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isChatPage && <Footer />}
      <Analytics /> {/* 2. Add the Analytics component here */}
    </div>
  );
}

export default App;