// src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';

// Import all components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup'; // Corrected capitalization
import ChatPage from './components/ChatPage';
import MentorListPage from './components/MentorListPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './components/ProfilePage';

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
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}

export default App;