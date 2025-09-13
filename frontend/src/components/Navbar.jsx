// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Use the custom hook
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from the hook

  const handleLogout = () => {
    logout();
    alert('You have been logged out.');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/">अत्यant</Link>
      </div>
      <nav className="navbar-links">
        {user ? (
          // --- LOGGED-IN VIEW ---
          user.role === 'mentor' ? (
            // --- MENTOR'S NAVBAR ---
            <>
              <Link to="/chat" className="nav-link">Student Chats</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="nav-button primary">Logout</button>
            </>
          ) : (
            // --- USER'S NAVBAR ---
            <>
              <Link to="/mentors" className="nav-link">Find Mentors</Link>
              <Link to="/chat" className="nav-link">My Chats</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="nav-button primary">Logout</button>
            </>
          )
        ) : (
          // --- LOGGED-OUT VIEW ---
          <>
            <Link to="/mentors" className="nav-link">Mentors</Link>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/signup" className="nav-button primary">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};
export default Navbar;