import React, { useState, useEffect, useContext, useCallback } from 'react';
import { API_URL } from '../services/api.js';
import { AuthContext } from '../AuthContext';
import { MapPin, RefreshCw, AlertCircle, CheckCircle, Plus, Circle } from 'lucide-react';
import './ProfilePage.css';
import MentorInfo from './MentorInfo';
import LoadingSpinner from './LoadingSpinner';

const ProfilePage = () => {
  const { user, setUser, updateUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    linkedinProfile: '',
    city: '',
    education: [{ institution: '', degree: '', field: '', year: '', cgpa: '' }],
    interests: [],
    expertise: [],
    domainExperience: [],
    primaryDomain: '',
    topCompanies: [],
    milestones: [],
    specialTags: [],
    companyDomain: '',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Autosave states
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', ''
  const [lastSaved, setLastSaved] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  
  // Location states
  const [locationStatus, setLocationStatus] = useState('checking');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Chip input states
  const [interestInput, setInterestInput] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');

  const isLocationLoading = locationStatus === 'updating' || locationStatus === 'checking';

  // Fetch profile data on mount
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
          const profileData = {
            username: data.username || '',
            bio: data.bio || '',
            linkedinProfile: data.linkedinProfile || '',
            city: data.city || '',
            education: data.education && data.education.length > 0 
              ? data.education 
              : [{ institution: '', degree: '', field: '', year: '', cgpa: '' }],
            interests: data.interests || [],
            expertise: data.expertise || [],
            domainExperience: data.domainExperience || [],
            primaryDomain: data.primaryDomain || '',
            topCompanies: data.topCompanies || [],
            milestones: data.milestones || [],
            specialTags: data.specialTags || [],
            companyDomain: data.companyDomain || ''
          };
          setFormData(profileData);
          setInitialFormData(JSON.parse(JSON.stringify(profileData)));
          setImagePreview(data.profilePicture || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Check location on mount
  useEffect(() => {
    checkUserLocation();
  }, []);

  const checkUserLocation = async () => {
    if (!user || !user.token) {
      setLocationStatus('disabled');
      setShowLocationPrompt(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/location/my-location`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (data.success && data.hasLocation) {
        setCurrentLocation(data.location);
        setLocationStatus('enabled');
        setShowLocationPrompt(false);
      } else {
        setLocationStatus('disabled');
        setShowLocationPrompt(true);
      }
    } catch (error) {
      console.error('Error checking location:', error);
      setLocationStatus('disabled');
    }
  };

  // Autosave functionality - debounced
  useEffect(() => {
    if (!initialFormData || loading) return;

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    if (!hasChanges) return;

    setSaveStatus('saving');
    const timeout = setTimeout(async () => {
      try {
        const filteredEducation = Array.isArray(formData.education)
          ? formData.education.filter(edu => 
              edu.institution && edu.degree && edu.field && edu.year
            )
          : [];

        const submitData = { ...formData, education: filteredEducation };

        const res = await fetch(`${API_URL}/api/profile/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(submitData)
        });

        if (res.ok) {
          setSaveStatus('saved');
          setLastSaved(new Date());
          setInitialFormData(JSON.parse(JSON.stringify({ ...formData, education: filteredEducation })));
          
          setTimeout(() => {
            setSaveStatus('');
          }, 2000);
        } else {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }, 1500); // Debounce 1.5 seconds

    return () => clearTimeout(timeout);
  }, [formData, initialFormData, loading, user]);

  // Toggle tag helper (bulletproof)
  const toggleTag = useCallback((field, value) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      return {
        ...prev,
        [field]: currentArray.includes(value) 
          ? currentArray.filter(item => item !== value) 
          : [...currentArray, value]
      };
    });
  }, []);

  // Location functions
  const enableLocation = async () => {
    setLocationStatus('updating');
    if (!navigator.geolocation) {
      setLocationStatus('disabled');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`${API_URL}/api/location/update-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await response.json();
          if (data.success) {
            setCurrentLocation(data.location);
            setLocationStatus('enabled');
            setShowLocationPrompt(false);
            setMessage({ text: '✅ Location enabled successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
          } else {
            setLocationStatus('disabled');
          }
        } catch (error) {
          setLocationStatus('disabled');
        }
      },
      () => setLocationStatus('disabled'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Image upload
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
      }
    } catch (err) {
      setMessage({ text: 'Upload failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // LinkedIn / Resume PDF Parsing
  const [isParsing, setIsParsing] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setMessage({ text: 'AI is reading your LinkedIn Profile...', type: 'success' });

    const uploadData = new FormData();
    uploadData.append('resumePdf', file);

    try {
      const res = await fetch(`${API_URL}/api/profile/parse-linkedin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: uploadData
      });
      
      const resData = await res.json();
      
      if (res.ok && resData.success) {
        const parsed = resData.data;
        
        setFormData(prev => {
          const newEdu = Array.isArray(parsed.education) && parsed.education.length > 0 
            ? parsed.education 
            : prev.education;

          return {
            ...prev,
            bio: parsed.bio || prev.bio,
            city: parsed.city || prev.city,
            topCompanies: [...new Set([...(prev.topCompanies || []), ...(parsed.topCompanies || [])])],
            expertise: [...new Set([...(prev.expertise || []), ...(parsed.expertise || [])])],
            education: newEdu
          };
        });
        setMessage({ text: '✨ Form auto-filled magic successful!', type: 'success' });
      } else {
        setMessage({ text: resData.message || 'Failed to parse resume.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'An error occurred during AI extraction.', type: 'error' });
    } finally {
      setIsParsing(false);
    }
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', year: '', cgpa: '' }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, education: newEducation }));
    }
  };

  // Chip handlers
  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInterest();
    }
    if (e.key === 'Backspace' && interestInput === '' && formData.interests.length > 0) {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.slice(0, -1)
      }));
    }
  };

  const addInterest = () => {
    const newInterest = interestInput.trim();
    if (newInterest && !formData.interests.includes(newInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleExpertiseKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addExpertise();
    }
    if (e.key === 'Backspace' && expertiseInput === '' && formData.expertise.length > 0) {
      setFormData(prev => ({
        ...prev,
        expertise: prev.expertise.slice(0, -1)
      }));
    }
  };

  const addExpertise = () => {
    const newExpertise = expertiseInput.trim();
    if (newExpertise && !formData.expertise.includes(newExpertise)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (index) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  const handleCompanyKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCompany();
    }
  };

  const addCompany = () => {
    const newCompany = companyInput.trim();
    if (newCompany && !(formData.topCompanies || []).includes(newCompany)) {
      setFormData(prev => ({
        ...prev,
        topCompanies: [...(prev.topCompanies || []), newCompany]
      }));
      setCompanyInput('');
    }
  };

  const removeCompany = (index) => {
    setFormData(prev => ({
      ...prev,
      topCompanies: (prev.topCompanies || []).filter((_, i) => i !== index)
    }));
  };

  // Manual save (if needed)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const filteredEducation = Array.isArray(formData.education)
      ? formData.education.filter(edu => edu.institution && edu.degree && edu.field && edu.year)
      : [];

    const submitData = { ...formData, education: filteredEducation };

    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setInitialFormData(JSON.parse(JSON.stringify({ ...formData, education: filteredEducation })));
      } else {
        const data = await res.json();
        setMessage({ text: data.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <LoadingSpinner message="Loading profile..." fullScreen={true} />;
  }

  return (
    <>
      {isLocationLoading && (
        <div className="location-loading-overlay">
          <div className="location-loading-spinner"></div>
          <div className="location-loading-text">
            {locationStatus === 'checking' ? 'Checking your location status...' : 'Fetching your location, please wait...'}
          </div>
        </div>
      )}

      <div className="profile-page-layout">
        {/* Autosave Status Bar - Sticky at top */}
        <div className="autosave-status-bar-profile">
          {saveStatus === 'saving' && (
            <span className="saving">
              <div className="spinner-small"></div>
              Auto-saving changes...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="saved">
              <CheckCircle size={16} /> All changes saved automatically
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="error-status">
              <AlertCircle size={16} /> Failed to save. Please try again.
            </span>
          )}
          {lastSaved && saveStatus === '' && (
            <span className="last-saved">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* LinkedIn-style Top Profile Card */}
        <div className="profile-picture-container">
          <div className="profile-banner-bg"></div>
          
          <div className="profile-header-content">
            <div className="avatar-wrapper">
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
            </div>

            <div className="profile-text-header">
              <h1>{formData.username || 'Your Name'}</h1>
              <p className="profile-headline">{formData.bio || 'Add a bio or headline...'}</p>
              <p className="profile-location">
                {currentLocation?.city ? `${currentLocation.city}, ` : ''}{currentLocation?.state || ''} 
                <span className="location-dot">•</span> Atyant Member
              </p>
            </div>

            <div className="profile-action-buttons">
              {imageFile ? (
                <button onClick={handleImageUpload} className="primary-action-btn" disabled={loading}>
                  Save Photo
                </button>
              ) : (
                <button className="primary-action-btn" type="button" onClick={() => document.getElementById('imageUpload').click()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Update Picture
                </button>
              )}
              <input 
                type="file" 
                id="resumeUpload" 
                accept=".pdf" 
                onChange={handleResumeUpload} 
                style={{ display: 'none' }} 
              />
              <button 
                className="linkedin-import-btn" 
                onClick={() => document.getElementById('resumeUpload').click()}
                disabled={isParsing}
              >
                {isParsing ? <div className="spinner-small"></div> : <CheckCircle size={16} />} 
                {isParsing ? 'Extracting...' : 'Import Data'}
              </button>
              <button className="more-action-btn">•••</button>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="profile-form-container">
          <h2>My Profile</h2>

          {/* Location Section */}
          <div className={`location-setup-section ${locationStatus === 'disabled' ? 'urgent' : ''}`}>
            <div className="location-header">
              <MapPin size={24} />
              <h3>Location Setup</h3>
              {locationStatus === 'enabled' && (
                <span className="status-badge success">
                  <CheckCircle size={16} /> Active
                </span>
              )}
              {locationStatus === 'disabled' && (
                <span className="status-badge warning">
                  <AlertCircle size={16} /> Not Set
                </span>
              )}
            </div>

            {locationStatus === 'disabled' && showLocationPrompt && (
              <div className="location-prompt-card">
                <h4>Enable Your Location</h4>
                <p>
                  {user?.role === 'mentor' 
                    ? 'To appear in nearby searches for students, enable location access.' 
                    : 'To find nearby mentors and connect with them, enable location access.'}
                </p>
                <button 
                  onClick={enableLocation} 
                  className="enable-location-btn" 
                  disabled={locationStatus === 'updating'}
                >
                  {locationStatus === 'updating' ? (
                    <>
                      <RefreshCw size={18} className="spinning" /> Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin size={18} /> Enable Location
                    </>
                  )}
                </button>
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
                </div>
                <button 
                  onClick={enableLocation} 
                  className="update-location-btn-small" 
                  disabled={locationStatus === 'updating'}
                >
                  <RefreshCw size={14} /> Update
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Basic Information */}
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
              placeholder="Bio..." 
              rows="4" 
            />
            <input 
              name="linkedinProfile" 
              value={formData.linkedinProfile} 
              onChange={handleChange} 
              placeholder="LinkedIn URL" 
            />

            {/* Education */}
            <h3>Education</h3>
            <div className="education-info-group">
              <label>Current City</label>
              <input 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="Type your city (e.g. Nagpur, Indore, Delhi)"
                required 
                autoComplete="off"
              />
            </div>

            {formData.education.map((edu, index) => (
              <div key={index} className="education-group">
                <div className="edu-field-wrap">
                  <label>College / University</label>
                  <input 
                    value={edu.institution} 
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} 
                    placeholder="Type your College name..."
                    required
                  />
                </div>

                <div className="edu-field-wrap">
                  <label>Degree</label>
                  <input 
                    value={edu.degree} 
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} 
                    placeholder="e.g. B.Tech, MBA"
                    required
                  />
                </div>

                <div className="edu-field-wrap">
                  <label>Expected Graduation</label>
                  <input 
                    value={edu.year} 
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)} 
                    placeholder="e.g. 4th Year, Graduated"
                    required
                  />
                </div>

                <div className="edu-field-wrap">
                  <label>Branch / Field of Study</label>
                  <input 
                    value={edu.field} 
                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)} 
                    placeholder="e.g. Computer Science"
                    required
                  />
                </div>

                <div>
                  <label>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 9.2"
                    value={edu.cgpa || ''}
                    onChange={e => handleEducationChange(index, 'cgpa', e.target.value)}
                    className="cgpa-input"
                  />
                </div>

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
              + Add Education
            </button>

            {/* Student Details */}
            {user?.role === 'user' && (
              <>
                <h3>Student Details</h3>
                <div className="field-type-indicator multiple">
                  <CheckCircle size={16} />
                  <span>Add multiple interests (Press Enter or comma)</span>
                </div>
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
                          &times;
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={interestInput} 
                      onChange={(e) => setInterestInput(e.target.value)} 
                      onKeyDown={handleInterestKeyDown} 
                      placeholder="Add interest..." 
                      className="chip-input" 
                    />
                    <button 
                      type="button" 
                      className="chip-add-btn" 
                      onClick={addInterest} 
                      disabled={!interestInput.trim()} 
                      title="Add interest"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Mentor Details */}
            {user?.role === 'mentor' && (
              <>
                <div className="mentor-exciting-section">
                  <h3>
                    Mentor Details <small>(USED BY OUR ATYANT ENGINE FOR ACCURATE ROUTING)</small>
                  </h3>

                  {/* Primary Focus */}
                  <div className="form-group">
                    <div className="field-type-indicator single">
                      <Circle size={16} />
                      <span>Select ONE option</span>
                    </div>
                    <h3>Primary Mentorship Focus*</h3>
                    <select 
                      name="primaryDomain" 
                      value={formData.primaryDomain} 
                      onChange={(e) => setFormData({...formData, primaryDomain: e.target.value})} 
                      className="engine-select"
                    >
                      <option value="">-- Focus --</option>
                      <option value="placement">Placement Focus</option>
                      <option value="internship">Internship Focus</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  {/* Mentor DNA Section */}
                  <MentorInfo mentor={user} onDnaUpdate={setUser} />

                  {/* Monetization Dashboard Button */}
                  <div className="form-group monetization-dashboard-section">
                    <button 
                      type="button" 
                      className="monetization-dashboard-btn"
                      onClick={() => window.location.href = '/mentor-monetization'}
                    >
                      <span className="dashboard-icon">💰</span>
                      <div className="dashboard-btn-content">
                        <span className="dashboard-btn-title">Monetization Dashboard</span>
                        <span className="dashboard-btn-subtitle">Track your earnings & analytics</span>
                      </div>
                      <span className="dashboard-arrow">→</span>
                    </button>
                  </div>

                  {/* Companies Expertise */}
                  <div className="form-group">
                    <div className="field-type-indicator multiple">
                      <CheckCircle size={16} />
                      <span>Add multiple companies (Press Enter or comma)</span>
                    </div>
                    <h3>Companies Expertise*</h3>
                    <div className="chip-input-container">
                      <div className="chips-wrapper">
                        {(formData.topCompanies || []).map((company, index) => (
                          <span key={index} className="chip company-chip">
                            {company} 
                            <button 
                              type="button" 
                              className="chip-remove" 
                              onClick={() => removeCompany(index)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input 
                          type="text" 
                          value={companyInput} 
                          onChange={(e) => setCompanyInput(e.target.value)} 
                          onKeyDown={handleCompanyKeyDown} 
                          placeholder="Type company name" 
                          className="chip-input" 
                        />
                        <button 
                          type="button" 
                          className="chip-add-btn" 
                          onClick={addCompany} 
                          disabled={!companyInput.trim()} 
                          title="Add company"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Company Domain */}
                  <div className="form-group">
                    <div className="field-type-indicator single">
                      <Circle size={16} />
                      <span>Select ONE domain</span>
                    </div>
                    <h3>Company Domain</h3>
                    <div className="domain-cards">
                      {[
                        { label: 'Tech', value: 'Tech', icon: '💻' },
                        { label: 'Data Analytics', value: 'Data Analytics', icon: '📊' },
                        { label: 'Consulting', value: 'Consulting', icon: '🧑‍💼' },
                        { label: 'Product', value: 'Product', icon: '📦' },
                        { label: 'Core Engineering', value: 'Core Engineering', icon: '⚙️' }
                      ].map(domain => (
                        <button
                          type="button"
                          key={domain.value}
                          className={`domain-card${formData.companyDomain === domain.value ? ' selected' : ''}`}
                          onClick={() => setFormData({ ...formData, companyDomain: domain.value })}
                        >
                          <span className="domain-icon">{domain.icon}</span>
                          {domain.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Placement Achievements */}
                  <div className="form-group">
                    <div className="field-type-indicator multiple">
                      <CheckCircle size={16} />
                      <span>Select ALL that apply</span>
                    </div>
                    <h3>Placement Achievements</h3>
                    <div className="tags-row">
                      {['On-campus Placement', 'Off-campus', 'PPO'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag('milestones', tag)}
                          className={`tag-btn${(formData.milestones || []).includes(tag) ? ' active' : ''}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Internship Achievements */}
                  <div className="form-group">
                    <div className="field-type-indicator multiple">
                      <CheckCircle size={16} />
                      <span>Select ALL that apply</span>
                    </div>
                    <h3>Internship Achievements</h3>
                    <div className="tags-row">
                      {[
                        'On Campus Internship',
                        'Off Campus Internship',
                        'IIT Research Intern',
                        'IIM Research Intern',
                        'Foreign Internship',
                        'Remote Internship',
                        'FAANG Cracked 🚀',
                      ].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag('specialTags', tag)}
                          className={`tag-btn${(formData.specialTags || []).includes(tag) ? ' active' : ''}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="chip-input-container">
                    <div className="field-type-indicator multiple">
                      <CheckCircle size={16} />
                      <span>Add multiple skills (Press Enter or comma)</span>
                    </div>
                    <h3>Skills</h3>
                    <div className="chips-wrapper">
                      {formData.expertise.map((skill, index) => (
                        <span key={index} className="chip">
                          {skill} 
                          <button 
                            type="button" 
                            className="chip-remove" 
                            onClick={() => removeExpertise(index)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        value={expertiseInput} 
                        onChange={(e) => setExpertiseInput(e.target.value)} 
                        onKeyDown={handleExpertiseKeyDown} 
                        placeholder="Like DSA, MERN, PowerBi, Casestudy..." 
                        className="chip-input" 
                      />
                      <button 
                        type="button" 
                        className="chip-add-btn" 
                        onClick={addExpertise} 
                        disabled={!expertiseInput.trim()} 
                        title="Add skill"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="save-profile-btn">
              {loading ? 'Saving...' : '💾 Save Profile'}
            </button>

            {message.text && (
              <p className={`form-message ${message.type}`}>{message.text}</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;