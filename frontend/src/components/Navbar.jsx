// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    alert('You have been logged out.');
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/">अत्यant</Link>
      </div>
      <nav className="navbar-links">
        {isLoggedIn ? (
          userRole === 'mentor' ? (
            <>
              <Link to="/chat" className="nav-link">Student Chats</Link>
              <button onClick={handleLogout} className="nav-button primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/mentors" className="nav-link">Find Mentors</Link>
              <Link to="/chat" className="nav-link">My Chats</Link>
              <button onClick={handleLogout} className="nav-button primary">Logout</button>
            </>
          )
        ) : (
          <>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
            <Link to="/mentors" className="nav-link">Mentors</Link>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/Signup" className="nav-button primary">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;