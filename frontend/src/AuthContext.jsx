// src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUserFromToken = (token) => {
    const decoded = jwtDecode(token);
    console.log('🔍 Building user from token:', decoded);
    
    return {
      token,
      role: decoded.role,
      id: decoded.userId,
      username: decoded.username,
      name: decoded.name || decoded.username,
      email: decoded.email,
      profilePicture: decoded.profilePicture || null, // ✅ GET FROM TOKEN
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
        } else {
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log('✅ User loaded from localStorage:', parsedUser);
              setUser(parsedUser);
            } catch (e) {
              console.warn('⚠️ Failed to parse stored user');
              const userData = buildUserFromToken(token);
              setUser(userData);
              localStorage.setItem('userData', JSON.stringify(userData));
            }
          } else {
            const userData = buildUserFromToken(token);
            setUser(userData);
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        }
      } catch (e) {
        console.error('Invalid token:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      const userData = buildUserFromToken(token);
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ User logged in with profilePicture:', userData.profilePicture);
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
    localStorage.removeItem('userData');
    setUser(null);
  };

  // ✅ UPDATE USER FUNCTION
  const updateUser = (updatedData) => {
    if (!user) {
      console.warn('⚠️ No user to update');
      return;
    }
    
    const updatedUser = { ...user, ...updatedData };
    
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    
    console.log('✅ User updated:', updatedUser);
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
