// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Menu, User as UserIcon, GraduationCap } from 'lucide-react'; // ✅ ADD GraduationCap
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarBtnRef = useRef(null);

  const handleLogout = () => {
    logout();
    alert('You have been logged out.');
    navigate('/login');
    setOpen(false);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    // ... your useEffect for closing the mobile panel
  }, [open]);

  useEffect(() => {
    // ... your useEffect for closing the profile dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const renderLinks = (isMobile = false) => {
    const linkAction = () => isMobile && setOpen(false);
    
    if (user) {
      return user.role === 'mentor' ? (
        <>
          <Link to="/chat" className="nav-link" onClick={linkAction}>Student Chats</Link>
          <Link to="/internships" className="nav-link" onClick={linkAction}>
            {/* ✅ ADD ICON for desktop */}
            {!isMobile && <GraduationCap size={18} />}
            Internships
          </Link>
          <Link to="/profile" className="nav-link" onClick={linkAction}>Profile</Link>
        </>
      ) : (
        <>
          <Link to="/mentors" className="nav-link" onClick={linkAction}>Find Mentor</Link>
          
          <Link to="/nearby-mentors" className="nav-link nearby-mentors" onClick={linkAction}>
            Nearby Achievers
          </Link>

          {/* ✅ ADD INTERNSHIP LINK */}
          <Link to="/internships" className="nav-link internship-link" onClick={linkAction}>
            {!isMobile && <GraduationCap size={18} />}
            Internships
          </Link>

          <Link to="/chat" className="nav-link" onClick={linkAction}>My Chats</Link>
          <Link to="/profile" className="nav-link" onClick={linkAction}>Profile</Link>
        </>
      );
    }
    
    return (
      <>
        <Link to="/mentors" className="nav-link" onClick={linkAction}>Mentors</Link>
        
        {/* ✅ ADD INTERNSHIP LINK FOR NON-LOGGED IN USERS */}
        <Link to="/internships" className="nav-link internship-link" onClick={linkAction}>
          {!isMobile && <GraduationCap size={18} />}
          Internships
        </Link>

        <Link to="/login" className="nav-button" onClick={linkAction}>Login</Link>
        <Link to="/signup" className="nav-button primary" onClick={linkAction}>Sign Up</Link>
      </>
    );
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">अत्यant</Link>

      {/* --- Desktop Menu --- */}
      <nav className="navbar-links desktop-only">
        {renderLinks()}
        {user && (
          <div className="profile-menu-container">
            <button ref={avatarBtnRef} onClick={() => setIsDropdownOpen(v => !v)} className="profile-avatar-btn">
              {user.profilePicture ? <img src={user.profilePicture} alt="Profile" /> : <UserIcon size={24} />}
            </button>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="profile-dropdown">
                <div className="dropdown-header">Signed in as <strong>{user.username}</strong></div>
                <button onClick={handleLogout} className="dropdown-item">Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>
      

      {/* --- Mobile Hamburger & Panel --- */}
      <button className="hamburger mobile-only" onClick={() => setOpen(v => !v)}>
        <Menu size={22} />
      </button>
      <div ref={panelRef} className={`menu-panel mobile-only ${open ? 'open' : ''}`}>
        {renderLinks(true)}
        {user && <hr />}
        {user && <button onClick={handleLogout} className="menu-button">Logout</button>}
      </div>
    </header>
  );
};

export default Navbar;