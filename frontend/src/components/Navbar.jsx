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
  const [userPhoto, setUserPhoto] = useState(null); // ✅ Shared photo state

  console.log('🔍 Navbar - Current User:', user);
  console.log('📋 User Details:', {
    name: user?.name,
    username: user?.username,
    email: user?.email,
    role: user?.role
  });

  // ✅ Fetch profile photo once for both avatars
  useEffect(() => {
    const fetchPhoto = async () => {
      if (user?.profilePicture) {
        setUserPhoto(user.profilePicture);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.profilePicture) {
            setUserPhoto(data.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    fetchPhoto();
  }, [user?.id]); // Only when user ID changes

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
    
    const openCommunityChat = () => {
      window.dispatchEvent(new CustomEvent('openCommunityChat'));
      if (isMobile) setOpen(false);
    };
    
    if (user) {
      return user.role === 'mentor' ? (
        <>
          <Link to="/dashboard" className="nav-link dashboard-link" onClick={linkAction}>
            {!isMobile && ''}
            Dashboard
          </Link>
          <Link to="/chat" className="nav-link mentor-chat-link" onClick={linkAction}>
            {!isMobile && ''}
            Student Chats
          </Link>
          <Link to="/internships" className="nav-link internship-link" onClick={linkAction}>
            {!isMobile && <GraduationCap size={18} />}
            Internships
          </Link>
         
        </>
      ) : (
        <>         
          <Link to="/my-questions" className="nav-link" onClick={linkAction}>My Questions</Link>
          <Link to="/internship-journey" className="nav-link internship-journey-link" onClick={linkAction}>
            Internship Journey
          </Link>
          <Link to="/internships" className="nav-link internship-link" onClick={linkAction}>
            {!isMobile && <GraduationCap size={18} />}
            Internships
          </Link>      
        </>
      );
    }
    
    return (
      <>
        <Link to="/internship-journey" className="nav-link internship-journey-link" onClick={linkAction}>
          Internship Journey
        </Link>
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
      <Link to="/" className="brand">Atyant</Link>

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
              {/* ✅ Use shared userPhoto */}
              <UserAvatar user={{...user, profilePicture: userPhoto}} size={40} />
            </button>
            {showDropdown && (
              <div ref={dropdownRef} className="profile-dropdown">
                <div className="dropdown-header">
                  {/* ✅ Use shared userPhoto */}
                  <UserAvatar user={{...user, profilePicture: userPhoto}} size={48} />
                  <div className="dropdown-user-info">
                    <span>Signed in as</span>
                    <strong>{user.name || user.username || user.email || 'User'}</strong>
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

      {/* Overlay for mobile menu */}
      {open && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)', // halka dark, ya transparent bhi rakh sakte ho
            zIndex: 2001
          }}
        />
      )}

      <div ref={panelRef} className={`menu-panel mobile-only ${open ? 'open' : ''}`}>
        {renderLinks(true)}
        {user && <hr />}
        {user && (
          <>
            <Link to="/profile" className="menu-button" onClick={() => setOpen(false)}>
              <UserIcon size={18} />
              My Profile
            </Link>
            <button onClick={handleLogout} className="menu-button">
              <LogOut size={18} />
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;