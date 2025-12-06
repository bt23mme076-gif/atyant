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
      token,
      role: decoded.role,
      id: decoded.userId,
      username: decoded.username,
      name: decoded.name || decoded.username,
      email: decoded.email,
      profilePicture: decoded.profilePicture || null,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // ✅ Check if we have updated user data in localStorage
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              console.log('✅ Loaded user from localStorage:', parsedUser);
            } catch (e) {
              // Fallback to token
              setUser(buildUserFromToken(token));
            }
          } else {
            setUser(buildUserFromToken(token));
          }
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
      
      // ✅ Store user data separately
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ User logged in:', userData);
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
    localStorage.removeItem('userData'); // ✅ Clear user data
    setUser(null);
  };

  // ✅ FIXED updateUser function
  const updateUser = (updatedData) => {
    if (!user) {
      console.warn('⚠️ No user to update');
      return;
    }
    
    const updatedUser = { ...user, ...updatedData };
    
    // Update state
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    
    console.log('✅ User updated in context:', updatedUser);
    console.log('✅ Profile Picture:', updatedUser.profilePicture);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
