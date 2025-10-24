// ...all your existing imports...
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
// ========== NEW: ADD THESE IMPORTS ==========
import { MapPin, RefreshCw } from 'lucide-react';
// ========== END NEW IMPORTS ==========

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user } = useAuth();
  
  // ...all your existing state variables remain same...
  
  // ========== NEW: ADD THESE STATE VARIABLES ==========
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  // ========== END NEW STATE VARIABLES ==========

  // ...all your existing useEffect and functions remain same...

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

  return (
    <div className="profile-container">
      {/* ...all your existing JSX remains exactly same... */}
      
      {/* Your existing profile sections */}
      <div className="profile-header">
        {/* ...existing header code... */}
      </div>

      <div className="profile-content">
        {/* ...all your existing sections... */}
        
        {/* ========== NEW: ADD THIS SECTION ANYWHERE ========== */}
        <div className="location-section">
          <h3>
            <MapPin size={24} />
            Your Location
          </h3>
          
          {currentLocation?.city && (
            <div className="current-location-display">
              <p>
                📍 Current Location: <strong>{currentLocation.city}</strong>
                {currentLocation.state && `, ${currentLocation.state}`}
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