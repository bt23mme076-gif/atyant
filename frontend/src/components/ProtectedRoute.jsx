// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // YEH SABSE ZAROORI HISSA HAI
  if (loading) {
    // Jab tak guest list check ho rahi hai, "Loading..." dikhao
    return <div>Loading...</div>;
  }

  if (!user) {
    // Ab jab humein pakka pata hai ki user logged in nahi hai, tabhi usse bahar bhejo
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;