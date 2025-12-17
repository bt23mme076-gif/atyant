import React, { useState, useEffect, useContext } from 'react';
import { useAuth, AuthContext } from '../AuthContext';
// ========== NEW: ADD THESE IMPORTS ==========
import { MapPin, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
// ========== END NEW IMPORTS ==========
// ✅ ADD THIS IMPORT AT TOP
import LoadingSpinner from './LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user, updateUser, login } = useContext(AuthContext); // ✅ Get updateUser and login functions
  
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  // ========== NEW: ADD THIS FUNCTION ==========
  const fetchCurrentLocation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/location/my-location`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentLocation(data.location);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const updateLocation = async () => {
    setUpdatingLocation(true);
    setLocationStatus('Getting your location...');

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      setUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'AtyantApp/1.0' } }
          );
          const geoData = await geoResponse.json();
          
          const city = geoData.address?.city || geoData.address?.town || 'Unknown';
          const state = geoData.address?.state || '';

          const response = await fetch(`${API_URL}/api/location/update-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              latitude,
              longitude,
              city,
              state
            })
          });

          const data = await response.json();

          if (data.success) {
            setLocationStatus(`✅ Location updated: ${city}, ${state}`);
            setCurrentLocation(data.location);
          } else {
            setLocationStatus('❌ Failed to update location');
          }
        } catch (error) {
          setLocationStatus('❌ Error updating location');
        } finally {
          setUpdatingLocation(false);
          setTimeout(() => setLocationStatus(''), 3000);
        }
      },
      (error) => {
        setLocationStatus('❌ Location permission denied');
        setUpdatingLocation(false);
        setTimeout(() => setLocationStatus(''), 3000);
      }
    );
  };

  useEffect(() => {
    if (user && user.token) {
      fetchCurrentLocation();
    }
  }, [user]);
  // ========== END NEW FUNCTION ==========

  // ✅ ADD THIS AFTER IMPORTS
  const ProfileSkeleton = () => (
    <div className="profile-skeleton">
      <div className="skeleton skeleton-avatar" style={{ width: '120px', height: '120px', margin: '0 auto 20px' }}></div>
      <div className="skeleton skeleton-title" style={{ width: '60%', margin: '0 auto 12px' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto 24px' }}></div>
      
      <div className="form-skeleton">
        <div className="skeleton skeleton-text" style={{ marginBottom: '8px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '45px', marginBottom: '16px' }}></div>
        
        <div className="skeleton skeleton-text" style={{ marginBottom: '8px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '45px', marginBottom: '16px' }}></div>
        
        <div className="skeleton skeleton-text" style={{ marginBottom: '8px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '100px', marginBottom: '16px' }}></div>
      </div>
    </div>
  );

  // ✅ UPDATE THIS FUNCTION
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/users/upload-profile-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Upload Response:', response.data);

      // ✅ USE NEW TOKEN WITH PROFILE PICTURE
      if (response.data.token) {
        login(response.data.token); // Updates user context
        toast.success('Profile picture updated! ✅');
        
        // Reload after 1 second
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." fullScreen={true} />;
  }

  return (
    <div className="profile-container">
      {/* ...all your existing JSX remains exactly same... */}
      
      {/* Your existing profile sections */}
      <div className="profile-header">
        {/* ...existing header code... */}
      </div>

      <div className="profile-content">
        {/* ...all your existing sections... */        
        {/* ========== NEW: ADD THIS SECTION ANYWHERE ========== */}
        <div className="location-section">
          <h3>
            <MapPin size={24} />
            Your Location
          </h3>
          
          {currentLocation?.city && typeof currentLocation.city === 'string' && (
            <div className="current-location-display">
              <p>
                📍 Current Location: <strong>{currentLocation.city}</strong>
                {currentLocation.state && typeof currentLocation.state === 'string' && `, ${currentLocation.state}`}
              </p>
              <p className="location-updated">
                Last updated: {currentLocation.lastUpdated 
                  ? new Date(currentLocation.lastUpdated).toLocaleDateString() 
                  : 'Not set'}
              </p>
            </div>
          )}
          
          <p className="location-description">
            Update your location to be discovered by nearby mentors and students
          </p>
          
          <button 
            onClick={updateLocation}
            disabled={updatingLocation}
            className="update-location-btn"
          >
            {updatingLocation ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Updating...
              </>
            ) : (
              <>
                <MapPin size={18} />
                Update My Location
              </>
            )}
          </button>

          {locationStatus && (
            <p className="location-status">{locationStatus}</p>
          )}
        </div>
        {/* ========== END NEW SECTION ========== */}

        {/* ...rest of your existing sections... */}
      </div>
    </div>
  );
};

export default Profile;