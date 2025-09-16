// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Menu } from 'lucide-react'; // lucide-react icon
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const handleLogout = () => {
    logout();
    alert('You have been logged out.');
    navigate('/login');
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const LoggedInMentor = (
    <>
      <Link to="/chat" className="nav-link" onClick={() => setOpen(false)}>Student Chats</Link>
      <Link to="/profile" className="nav-link" onClick={() => setOpen(false)}>Profile</Link>
      <button onClick={handleLogout} className="nav-button primary">Logout</button>
    </>
  );

  const LoggedInUser = (
    <>
      <Link to="/mentors" className="nav-link" onClick={() => setOpen(false)}>Find Mentors</Link>
      <Link to="/chat" className="nav-link" onClick={() => setOpen(false)}>My Chats</Link>
      <Link to="/profile" className="nav-link" onClick={() => setOpen(false)}>Profile</Link>
      <button onClick={handleLogout} className="nav-button primary">Logout</button>
    </>
  );

  const LoggedOut = (
    <>
      <Link to="/mentors" className="nav-link" onClick={() => setOpen(false)}>Mentors</Link>
      <Link to="/login" className="nav-button" onClick={() => setOpen(false)}>Login</Link>
      <Link to="/signup" className="nav-button primary" onClick={() => setOpen(false)}>Sign Up</Link>
    </>
  );

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">अत्यant</Link>
      </div>

      {/* Desktop inline links (hidden on mobile via CSS) */}
      <nav className="navbar-links desktop-only">
        {user ? (user.role === 'mentor' ? LoggedInMentor : LoggedInUser) : LoggedOut}
      </nav>

      {/* Mobile hamburger (hidden on desktop via CSS) */}
      <button
        className="hamburger mobile-only"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      {/* Mobile slide-down panel */}
      <div ref={panelRef} className={`menu-panel mobile-only ${open ? 'open' : ''}`} role="menu">
        {user ? (user.role === 'mentor' ? LoggedInMentor : LoggedInUser) : LoggedOut}
      </div>
    </header>
  );
};

export default Navbar;
