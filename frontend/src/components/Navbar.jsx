// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    alert('You have been logged out.');
    navigate('/login');
    setOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">अत्यant</Link>
      </div>

      <button
        className={`hamburger ${open ? 'is-open' : ''}`}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        ref={menuRef}
        className={`menu-panel ${open ? 'open' : ''}`}
        role="menu"
      >
        {user ? (
          user.role === 'mentor' ? (
            <>
              <Link to="/chat" className="menu-link" onClick={() => setOpen(false)}>Student Chats</Link>
              <Link to="/profile" className="menu-link" onClick={() => setOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="menu-button primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/mentors" className="menu-link" onClick={() => setOpen(false)}>Find Mentors</Link>
              <Link to="/chat" className="menu-link" onClick={() => setOpen(false)}>My Chats</Link>
              <Link to="/profile" className="menu-link" onClick={() => setOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="menu-button primary">Logout</button>
            </>
          )
        ) : (
          <>
            <Link to="/mentors" className="menu-link" onClick={() => setOpen(false)}>Mentors</Link>
            <Link to="/login" className="menu-button" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/signup" className="menu-button primary" onClick={() => setOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
