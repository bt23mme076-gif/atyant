// src/components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import UserAvatar from './UserAvatar'; // ✅ Already imported
import { Menu, User as UserIcon, GraduationCap, LogOut, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const avatarBtnRef = useRef(null);

  console.log('🔍 Navbar - Current User:', user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const renderLinks = (isMobile = false) => {
    const linkAction = () => isMobile && setOpen(false);
    
    if (user) {
      return user.role === 'mentor' ? (
        <>
          <Link to="/chat" className="nav-link" onClick={linkAction}>Student Chats</Link>
          <Link to="/internships" className="nav-link" onClick={linkAction}>
            {!isMobile && <GraduationCap size={18} />}
            Internships
          </Link>
          <Link to="/profile" className="nav-link" onClick={linkAction}>Profile</Link>
        </>
      ) : (
        <>
          <Link to="/mentors" className="nav-link" onClick={linkAction}>Find Mentor</Link>

          <Link to="/internships" className="nav-link internship-link" onClick={linkAction}>
            {!isMobile && <GraduationCap size={18} />}
            Internships
          </Link>
          <Link to="/nearby-mentors" className="nav-link nearby-mentors" onClick={linkAction}>
            Nearby Achievers
          </Link>
          
          <Link to="/chat" className="nav-link" onClick={linkAction}>My Chats</Link>
        </>
      );
    }
    
    return (
      <>
        <Link to="/mentors" className="nav-link" onClick={linkAction}>Mentors</Link>
        
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
            <button 
              ref={avatarBtnRef} 
              onClick={() => setShowDropdown(v => !v)} 
              className="profile-avatar-btn"
            >
              {/* ✅ REPLACE THIS LINE - Use UserAvatar instead of img/UserIcon */}
              <UserAvatar user={user} size={40} />
            </button>
            {showDropdown && (
              <div ref={dropdownRef} className="profile-dropdown">
                <div className="dropdown-header">
                  {/* ✅ ADD UserAvatar in dropdown header too */}
                  <UserAvatar user={user} size={48} />
                  <div className="dropdown-user-info">
                    <span>Signed in as</span>
                    <strong>{user.username}</strong>
                  </div>
                </div>
                <Link to="/profile" className="dropdown-item">
                  <UserIcon size={18} />
                  My Profile
                </Link>
                
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <LogOut size={18} />
                  Logout
                </button>
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