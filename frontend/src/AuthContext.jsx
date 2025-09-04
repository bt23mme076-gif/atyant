// src/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Updated import

// 1. AuthContext create kiya gaya
export const AuthContext = createContext(null);

// 2. AuthProvider component banaya gaya jo state manage karega
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Jab component load hoga, token check karega localStorage se
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Agar token expire ho gaya hai to logout kar do
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({
            token,
            role: decoded.role,
            id: decoded.userId,
            username: decoded.username,
          });
        }
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  // Login function: token store karta hai aur user state update karta hai
  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser({
        token,
        role: decoded.role,
        id: decoded.userId,
        username: decoded.username,
      });
    } catch (e) {
      console.error("Failed to decode token on login:", e);
      setUser(null);
    }
  };

  // Logout function: token remove karta hai aur user state clear karta hai
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // ✅ Main Fix: AuthContext.Provider se value ko pass kiya gaya
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook (useAuth) banaya gaya taki context aasani se use ho sake
export const useAuth = () => {
  return useContext(AuthContext);
};
