import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    if (user.role === 'mentor') {
      navigate('/mentor-dashboard', { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else {
      // Regular users stay on dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default RoleBasedDashboard;
