import { useEffect } from 'react';
import { useAuth } from '../AuthContext';

const LocationService = () => {
  const { user } = useAuth();

  useEffect(() => {
    // ========== ONLY CHECK, DON'T AUTO-REQUEST ==========
    if (user && user.token) {
      console.log('📍 LocationService: User logged in');
      // Don't automatically request location
      // User will enable it manually from profile page
    }
  }, [user]);

  return null;
};

export default LocationService;