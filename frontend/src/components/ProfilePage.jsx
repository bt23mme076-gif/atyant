import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { MapPin, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import './ProfilePage.css';
import LoadingSpinner from './LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    linkedinProfile: '',
    city: '',
    education: [{ institution: '', degree: '', field: '', year: '' }],
    interests: [],
    expertise: [],
    domainExperience: []
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Location states
  const [locationStatus, setLocationStatus] = useState('checking');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Chip input states
  const [interestInput, setInterestInput] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');

  // Add this before the return statement:
  const isLocationLoading = locationStatus === 'updating' || locationStatus === 'checking';

  // ========== FETCH PROFILE DATA ==========
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) return;
      
      setLoading(true);
      
      try {
        const res = await fetch(`${API_URL}/api/profile/me`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          setFormData({
            username: data.username || '',
            bio: data.bio || '',
            linkedinProfile: data.linkedinProfile || '',
            city: data.city || '',
            education: data.education && data.education.length > 0 
              ? data.education 
              : [{ institution: '', degree: '', field: '', year: '' }],
            interests: data.interests || [],
            expertise: data.expertise || [],
            domainExperience: data.domainExperience || []
          });
          
          setImagePreview(data.profilePicture || '');
        } else {
          setMessage({ text: 'Failed to load profile.', type: 'error' });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage({ text: 'An error occurred.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // ========== CHECK IF LOCATION IS ALREADY SAVED ==========
  useEffect(() => {
    if (user && user.token) {
      checkUserLocation();
    }
  }, [user]);

  const checkUserLocation = async () => {
    try {
      console.log('🔍 Checking saved location...');
      
      const response = await fetch(`${API_URL}/api/location/my-location`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.hasLocation) {
        console.log('✅ Location already saved:', data.location.city);
        setCurrentLocation(data.location);
        setLocationStatus('enabled');
        setShowLocationPrompt(false);
      } else {
        console.log('⚠️ No location saved');
        setLocationStatus('disabled');
        setShowLocationPrompt(true);
      }
    } catch (error) {
      console.error('Error checking location:', error);
      setLocationStatus('disabled');
    }
  };

  // ========== ENABLE LOCATION USING GPS ==========
  const enableLocation = async () => {
    setLocationStatus('updating');
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location services');
      setLocationStatus('disabled');
      return;
    }

    console.log('📍 Getting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log('✅ GPS coordinates received:', { latitude, longitude });

        try {
          const response = await fetch(`${API_URL}/api/location/update-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              latitude,
              longitude
            })
          });

          const data = await response.json();

          console.log('📍 Backend response:', data);

          if (data.success) {
            setCurrentLocation(data.location);
            setLocationStatus('enabled');
            setShowLocationPrompt(false);
            setMessage({ text: '✅ Location enabled successfully!', type: 'success' });
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              setMessage({ text: '', type: '' });
            }, 3000);
          } else {
            setLocationError('Failed to save location: ' + data.message);
            setLocationStatus('disabled');
          }
        } catch (error) {
          console.error('❌ Error saving location:', error);
          setLocationError('Error saving location. Please try again.');
          setLocationStatus('disabled');
        }
      },
      (error) => {
        console.error('❌ GPS error:', error);
        
        if (error.code === 1) {
          setLocationError('Location permission denied. Please enable location access in your browser settings.');
        } else if (error.code === 2) {
          setLocationError('Location information unavailable. Please check your device GPS.');
        } else if (error.code === 3) {
          setLocationError('Location request timeout. Please try again.');
        }
        
        setLocationStatus('disabled');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // ========== UPDATE LOCATION (REFRESH GPS) ==========
  const updateLocation = () => {
    console.log('🔄 Updating location...');
    enableLocation();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setLoading(true);
    
    const uploadData = new FormData();
    uploadData.append('profilePicture', imageFile);

    try {
      const res = await fetch(`${API_URL}/api/profile/upload-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: uploadData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setImagePreview(data.profilePicture);
        setMessage({ text: 'Picture updated successfully!', type: 'success' });
        setImageFile(null);
      } else {
        setMessage({ text: data.message || 'Upload failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred during upload.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'interests' || name === 'expertise' || name === 'domainExperience') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.split(',').map(s => s.trim()).filter(s => s !== '')
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newInterest = interestInput.trim();
      
      if (newInterest && !formData.interests.includes(newInterest)) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, newInterest]
        }));
        setInterestInput('');
      }
    }
    
    if (e.key === 'Backspace' && interestInput === '' && formData.interests.length > 0) {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.slice(0, -1)
      }));
    }
  };

  const handleExpertiseKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newExpertise = expertiseInput.trim();
      
      if (newExpertise && !formData.expertise.includes(newExpertise)) {
        setFormData(prev => ({
          ...prev,
          expertise: [...prev.expertise, newExpertise]
        }));
        setExpertiseInput('');
      }
    }
    
    if (e.key === 'Backspace' && expertiseInput === '' && formData.expertise.length > 0) {
      setFormData(prev => ({
        ...prev,
        expertise: prev.expertise.slice(0, -1)
      }));
    }
  };

  const removeInterest = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, index) => index !== indexToRemove)
    }));
  };

  const removeExpertise = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, education: newEducation }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setMessage({ text: data.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const branches = [
    'Computer Science and Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics and Communication Engineering',
    'Chemical Engineering',
    'Biomedical Engineering',
    'Aerospace Engineering',
    'Environmental Engineering',
    'Artificial Intelligence and Data Science',
    'Electronics Engineering',
    'Instrumentation Engineering',
    'Automobile Engineering',
    'Biotechnology Engineering',
    'Mining Engineering',
    'Production/Manufacturing Engineering',
    'Industrial Engineering',
    'Metallurgy and Materials Engineering',
    'Other'
  ];

  const collegeData = {
    'Indore': [
      'IIT Indore',
      'SGSITS',
      'IET-DAVV',
      'Acropolis Institute of Technology and Research',
      'Indore Institute of Science & Technology'
    ],
    'Bhopal': [
      'MANIT Bhopal',
      'IIIT Bhopal',
      'LNCT Bhopal',
      'VIT Bhopal University',
      'Radharaman Engineering College'
    ],
    'Nagpur': [
      'IIIT Nagpur',
      'VNIT Nagpur',
      'GHRCE Nagpur',
      'RCOEM Nagpur',
      'YCCE Nagpur',
      'Priyadarshini College of Engineering'
    ],
    'Other': ['Other']
  };

  const cities = Object.keys(collegeData);
  const degrees = ['B.Tech', 'B.Sc', 'MBA', 'M.Tech', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];

  if (loading) {
    return <LoadingSpinner message="Loading profile..." fullScreen={true} />;
  }

  return (
    <>
      {/* Location Loading Overlay */}
      {isLocationLoading && (
        <div className="location-loading-overlay">
          <div className="location-loading-spinner"></div>
          <div className="location-loading-text">
            {locationStatus === 'checking'
              ? 'Checking your location status...'
              : 'Fetching your location, please wait...'}
          </div>
        </div>
      )}

      {/* Existing Profile Page */}
      <div className="profile-page-layout">
        {/* ========== PROFILE PICTURE SECTION ========== */}
        <div className="profile-picture-container">
          <h3>Profile Picture</h3>
          <img
            src={imagePreview || `https://ui-avatars.com/api/?name=${formData.username || 'User'}&background=random&size=150`}
            alt="Profile"
            className="profile-avatar"
          />
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="imageUpload" className="upload-btn">
            Choose Image
          </label>
          {imageFile && (
            <button onClick={handleImageUpload} className="save-photo-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Save Photo'}
            </button>
          )}
        </div>

        {/* ========== PROFILE FORM SECTION ========== */}
        <div className="profile-form-container">
          <h2>My Profile</h2>

          {/* ========== LOCATION SETUP SECTION ========== */}
          <div className={`location-setup-section ${locationStatus === 'disabled' ? 'urgent' : ''}`}>
            <div className="location-header">
              <MapPin size={24} />
              <h3>Location Setup</h3>
              {locationStatus === 'enabled' && (
                <span className="status-badge success">
                  <CheckCircle size={16} />
                  Active
                </span>
              )}
              {locationStatus === 'disabled' && (
                <span className="status-badge warning">
                  <AlertCircle size={16} />
                  Not Set
                </span>
              )}
            </div>

            {locationStatus === 'disabled' && showLocationPrompt && (
              <div className="location-prompt-card">
                <div className="prompt-icon">📍</div>
                <h4>Enable Your Location</h4>
                <p>
                  {user?.role === 'mentor' 
                    ? 'To appear in nearby searches for students, enable location access.'
                    : 'To find nearby mentors and connect with them, enable location access.'
                  }
                </p>
                <button 
                  onClick={enableLocation}
                  className="enable-location-btn"
                  disabled={locationStatus === 'updating'}
                >
                  {locationStatus === 'updating' ? (
                    <>
                      <RefreshCw size={18} className="spinning" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      Enable Location
                    </>
                  )}
                </button>
                {locationError && (
                  <div className="location-error-message">
                    <AlertCircle size={16} />
                    {locationError}
                  </div>
                )}
              </div>
            )}

            {locationStatus === 'enabled' && currentLocation && (
              <div className="location-enabled-card">
                <CheckCircle size={20} className="check-icon" />
                <div className="location-details">
                  <p className="location-text">
                    📍 <strong>{currentLocation.city || 'Location Set'}</strong>
                    {currentLocation.state && `, ${currentLocation.state}`}
                  </p>
                  {/* ========== SHOW EXACT COORDINATES ========== */}
                  {currentLocation.coordinates && (
                    <p className="coordinates-text">
                      🗺️ Coordinates: {currentLocation.coordinates[1].toFixed(6)}, {currentLocation.coordinates[0].toFixed(6)}
                    </p>
                  )}
                  {currentLocation.lastUpdated && (
                    <p className="last-updated">
                      Updated: {new Date(currentLocation.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                  <p className="location-benefit">
                    {user?.role === 'mentor' 
                      ? '✨ Students can now find you in nearby searches'
                      : '✨ You can now find mentors near your location'
                    }
                  </p>
                </div>
                <button 
                  onClick={updateLocation}
                  className="update-location-btn-small"
                  disabled={locationStatus === 'updating'}
                >
                  <RefreshCw size={14} />
                  Update
                </button>
              </div>
            )}
          </div>

          {/* ========== PROFILE FORM ========== */}
          <form onSubmit={handleSubmit}>
            <h3>Basic Information</h3>
            
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
            
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a short bio about yourself..."
              rows="4"
            />
            
            <input
              name="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={handleChange}
              placeholder="LinkedIn Profile URL"
            />

            <h3>Education</h3>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- Select Your City --</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {formData.education.map((edu, index) => (
              <div key={index} className="education-group">
                <select
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  disabled={!formData.city || formData.city === 'Other'}
                  required
                >
                  <option value="" disabled>
                    {formData.city ? '-- Select Your College --' : 'Please select a city first'}
                  </option>
                  {formData.city && collegeData[formData.city] && collegeData[formData.city].map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
                
                {(formData.city === 'Other' || edu.institution === 'Other') && (
                  <input
                    placeholder="Please specify your College/University"
                    value={edu.institution === 'Other' ? '' : edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    required
                  />
                )}

                <select
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Degree --</option>
                  {degrees.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
                
                <select
                  value={edu.year}
                  onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Year --</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={edu.field}
                  onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Branch --</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                
                {formData.education.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn" 
                    onClick={() => removeEducation(index)}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            
            <button type="button" className="add-btn" onClick={addEducation}>
              + Add Another Education
            </button>

            {user?.role === 'user' && (
              <>
                <h3>Student Details</h3>
                
                <div className="chip-input-container">
                  <div className="chips-wrapper">
                    {formData.interests.map((interest, index) => (
                      <span key={index} className="chip">
                        {interest}
                        <button 
                          type="button" 
                          className="chip-remove" 
                          onClick={() => removeInterest(index)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={handleInterestKeyDown}
                      placeholder={formData.interests.length === 0 ? "Type interest and press Enter" : "Add more..."}
                      className="chip-input"
                    />
                  </div>
                </div>
                <small className="helper-text">
                  💡 Press <kbd>Enter</kbd> or <kbd>,</kbd> after each interest
                </small>
              </>
            )}

            {user?.role === 'mentor' && (
              <>
                <h3>Mentor Details</h3>
                
                <div className="chip-input-container">
                  <div className="chips-wrapper">
                    {formData.expertise.map((skill, index) => (
                      <span key={index} className="chip">
                        {skill}
                        <button 
                          type="button" 
                          className="chip-remove" 
                          onClick={() => removeExpertise(index)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyDown={handleExpertiseKeyDown}
                      placeholder={formData.expertise.length === 0 ? "Type expertise and press Enter" : "Add more..."}
                      className="chip-input"
                    />
                  </div>
                </div>
                <small className="helper-text">
                  💡 Press <kbd>Enter</kbd> or <kbd>,</kbd> after each skill
                </small>
              </>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>

            {message.text && (
              <p className={`form-message ${message.type}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
