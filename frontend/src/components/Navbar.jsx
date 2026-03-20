// src/components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import UserAvatar from './UserAvatar';
import { Menu, User as UserIcon, GraduationCap, LogOut } from 'lucide-react';
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
  const navigate    = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [open,         setOpen]         = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userPhoto,    setUserPhoto]    = useState(null);
  const dropdownRef = useRef(null);
  const panelRef    = useRef(null);

  // 🔴 FIX: Removed console.logs from render — only fetch photo when needed
  useEffect(() => {
    if (!user) { setUserPhoto(null); return; }
    if (user.profilePicture) { setUserPhoto(user.profilePicture); return; }

    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;
    fetch(`${API_URL}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data?.profilePicture) setUserPhoto(data.profilePicture); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [user?.id || user?._id]);   // Only re-fetch when user ID changes

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // Listen for community chat event
  useEffect(() => {
    const handler = () => {};
    window.addEventListener('openCommunityChat', handler);
    return () => window.removeEventListener('openCommunityChat', handler);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const openCommunityChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openCommunityChat'));
    setOpen(false);
  }, []);

  const renderLinks = (isMobile = false) => {
    const close = () => isMobile && setOpen(false);

    if (!user) return (
      <>
        <Link to="/internships"   className="nav-link internship-link"    onClick={close}><GraduationCap size={18} /> Internships</Link>
        <Link to="/career-guides" className="nav-link career-guides-link" onClick={close}><GraduationCap size={18} /> Career Guides</Link>
        <Link to="/login"         className="nav-button"                  onClick={close}>Login</Link>
        <Link to="/signup"        className="nav-button primary"          onClick={close}>Sign Up</Link>
      </>
    );

    if (user.role === 'mentor') return (
      <>
        <Link to="/dashboard"      className="nav-link dashboard-link"    onClick={close}>Dashboard</Link>
        <Link to="/chat"           className="nav-link mentor-chat-link"  onClick={close}>Student Chats</Link>
        <Link to="/internships"    className="nav-link internship-link"   onClick={close}><GraduationCap size={18} /> Internships</Link>
        <Link to="/career-guides"  className="nav-link career-guides-link" onClick={close}><GraduationCap size={18} /> Career Guides</Link>
      </>
    );

    return (
      <>
        <Link to="/my-questions"   className="nav-link"                   onClick={close}>My Questions</Link>
        <Link to="/internships"    className="nav-link internship-link"   onClick={close}><GraduationCap size={18} /> Internships</Link>
        <Link to="/career-guides"  className="nav-link career-guides-link" onClick={close}><GraduationCap size={18} /> Career Guides</Link>
      </>
    );
  };

  const avatarUser = user ? { ...user, profilePicture: userPhoto } : null;

  return (
    <header className="navbar">
      <Link to="/" className="brand">Atyant</Link>

      {/* Desktop */}
      <nav className="navbar-links desktop-only">
        {renderLinks()}
        {user && (
          <div className="profile-menu-container" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(v => !v)} className="profile-avatar-btn">
              <UserAvatar user={avatarUser} size={40} />
            </button>
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <UserAvatar user={avatarUser} size={48} />
                  <div className="dropdown-user-info">
                    <span>Signed in as</span>
                    <strong>{user.name || user.username || user.email || 'User'}</strong>
                  </div>
                </div>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <UserIcon size={18} /> My Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile hamburger */}
      <button className="hamburger mobile-only" onClick={() => setOpen(v => !v)}>
        <Menu size={22} />
      </button>

      {open && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.18)', zIndex:2001 }}
        />
      )}

      <div ref={panelRef} className={`menu-panel mobile-only ${open ? 'open' : ''}`}>
        {renderLinks(true)}
        {user && (
          <>
            <hr />
            <Link to="/profile" className="menu-button" onClick={() => setOpen(false)}>
              <UserIcon size={18} /> My Profile
            </Link>
            <button onClick={handleLogout} className="menu-button">
              <LogOut size={18} /> Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
