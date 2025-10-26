// src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUserFromToken = (token) => {
    const decoded = jwtDecode(token);
    return {
      token, // ← Added for AI Chat
      role: decoded.role,
      id: decoded.userId,
      username: decoded.username,
      profilePicture: decoded.profilePicture || null,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Token expiry check
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(buildUserFromToken(token));
        }
      } catch (e) {
        console.error('Invalid token:', e);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      const userData = buildUserFromToken(token);
      setUser(userData);
      return userData;
    } catch (e) {
      console.error('Failed to decode token on login:', e);
      localStorage.removeItem('token');
      setUser(null);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Fixed: context null check करें undefined नहीं
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
