import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../AuthContext';
import { MapPin, RefreshCw, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import './ProfilePage.css';

import MentorInfo from './MentorInfo';
import LoadingSpinner from './LoadingSpinner';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const { user, setUser, updateUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    linkedinProfile: '',
    city: '',
    education: [{ institution: '', degree: '', field: '', year: '' }],
    interests: [],
    expertise: [],
    domainExperience: [],
    // 🚀 NEW ENGINE FIELDS
    primaryDomain: null,
    topCompanies: [],
    milestones: [],
    specialTags: [],
    companyDomain: null, // <-- add this
  });

  // Fetch latest user profile only on mount (not on every user change)
  useEffect(() => {
    let didFetch = false;
    const fetchProfile = async () => {
      if (didFetch) return;
      didFetch = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          updateUser(data); // ✅ Update AuthContext
          setFormData(prev => ({
            ...prev,
            ...data,
            strategy: data.strategy || prev.strategy
          }));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Options for Structured Tags
  const domains = ['placement', 'internship', 'both'];
  const milestoneOptions = ['PPO', 'Off-campus Winner', 'On-campus Placement', 'Remote Internship'];
  const companyDomains = ['Tech', 'Data Analytics', 'Consulting', 'Product', 'Core Engineering'];
  // 📋 Internship & Placement Optimized Categories
  const specialCategoryOptions = [
    'Foreign Internship 🌍', 
    'IIT Research Intern 🎓', 
    'IIM Research Intern 💼', 
    'FAANG Cracked 🚀',
    'On Campus Internship',
    'Off Campus Internship',
    'Remote Internship'
  
  ];

  // Company input state and handlers
  const [companyInput, setCompanyInput] = useState('');

  const handleCompanyKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newCompany = companyInput.trim();
      // Ensure company is not empty and not already added
      if (newCompany && !(formData.topCompanies || []).includes(newCompany)) {
        setFormData(prev => ({
          ...prev,
          topCompanies: [...(prev.topCompanies || []), newCompany]
        }));
        setCompanyInput('');
      }
    }
  };

  const removeCompany = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      topCompanies: (prev.topCompanies || []).filter((_, index) => index !== indexToRemove)
    }));
  };
  
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

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Add this before the return statement:
  const isLocationLoading = locationStatus === 'updating' || locationStatus === 'checking';

  // ========== FETCH PROFILE DATA (Safety Added) ==========
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
            domainExperience: data.domainExperience || [],
            primaryDomain: data.primaryDomain || '',
            topCompanies: data.topCompanies || [],
            milestones: data.milestones || [],
            specialTags: data.specialTags || [],
            companyDomain: data.companyDomain || ''
          });
          // Store initial data to track changes
          setInitialFormData({
            username: data.username || '',
            bio: data.bio || '',
            linkedinProfile: data.linkedinProfile || '',
            city: data.city || '',
            education: data.education && data.education.length > 0 
              ? data.education 
              : [{ institution: '', degree: '', field: '', year: '' }],
            interests: data.interests || [],
            expertise: data.expertise || [],
            domainExperience: data.domainExperience || [],
            primaryDomain: data.primaryDomain || '',
            topCompanies: data.topCompanies || [],
            milestones: data.milestones || [],
            specialTags: data.specialTags || [],
            companyDomain: data.companyDomain || ''
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

  // 🚀 Helper Fix: Bulletproof array handling
  const toggleTag = (field, value) => {
    setFormData(prev => {
      // 🛡️ Safety Check: Ensure array exists before calling .includes
      const currentArray = prev[field] || [];
      return {
        ...prev,
        [field]: currentArray.includes(value) 
          ? currentArray.filter(item => item !== value) 
          : [...currentArray, value]
      };
    });
  };

  // Check for unsaved changes when form data changes
  useEffect(() => {
    // Agar initialFormData abhi tak set nahi hua, ya loading hai, toh check mat karo
    if (!initialFormData || loading) {
      setHasUnsavedChanges(false);
      return;
    }
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(isChanged);
  }, [formData, initialFormData, loading]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Add company with button (for mobile)
  const addCompany = () => {
    const newCompany = companyInput.trim();
    if (newCompany && !(formData.topCompanies || []).includes(newCompany)) {
      setFormData(prev => ({
        ...prev,
        topCompanies: [...(prev.topCompanies || []), newCompany]
      }));
      setCompanyInput('');
      setHasUnsavedChanges(true);
    }
  };

  // Add expertise with button (for mobile)
  const addExpertise = () => {
    const newExpertise = expertiseInput.trim();
    if (newExpertise && !formData.expertise.includes(newExpertise)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise]
      }));
      setExpertiseInput('');
      setHasUnsavedChanges(true);
    }
  };

  // Add interest with button (for mobile)
  const addInterest = () => {
    const newInterest = interestInput.trim();
    if (newInterest && !formData.interests.includes(newInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest]
      }));
      setInterestInput('');
      setHasUnsavedChanges(true);
    }
  };

  // ========== CHECK IF LOCATION IS ALREADY SAVED ==========
  // Only check location on mount (not every user change)
  useEffect(() => {
    checkUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserLocation = async () => {
    // Guard: Only fetch if user and token exist
    if (!user || !user.token) {
      setLocationStatus('disabled');
      setShowLocationPrompt(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/location/my-location`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
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

  // ========== ENABLE LOCATION USING GPS ==========
  const enableLocation = async () => {
    setLocationStatus('updating');
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location services');
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
            setLocationError('Failed to save location: ' + data.message);
            setLocationStatus('disabled');
          }
        } catch (error) {
          setLocationError('Error saving location. Please try again.');
          setLocationStatus('disabled');
        }
      },
      (error) => {
        setLocationStatus('disabled');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ========== UPDATE LOCATION (REFRESH GPS) ==========
  const updateLocation = () => {
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
    setHasUnsavedChanges(true);
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', year: '' }]
    }));
    setHasUnsavedChanges(true);
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, education: newEducation }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Filter out incomplete education entries before sending
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
        setInitialFormData({ ...formData, education: filteredEducation });
        setHasUnsavedChanges(false);
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

  const branches = [
    'Computer Science and Engineering', 'Information Technology', 'Mechanical Engineering', 
    'Civil Engineering', 'Electrical Engineering', 'Electronics and Communication Engineering', 
    'Chemical Engineering', 'Biomedical Engineering', 'Aerospace Engineering', 
    'Environmental Engineering', 'Artificial Intelligence and Data Science', 'Electronics Engineering', 
    'Instrumentation Engineering', 'Automobile Engineering', 'Biotechnology Engineering', 
    'Mining Engineering', 'Production/Manufacturing Engineering', 'Industrial Engineering', 
    'Metallurgy and Materials Engineering', 'Other'
  ];

  const collegeData = {
    'Indore': ['IIT Indore', 'SGSITS', 'IET-DAVV', 'Acropolis Institute of Technology and Research', 'Indore Institute of Science & Technology'],
    'Bhopal': ['MANIT Bhopal', 'IIIT Bhopal', 'LNCT Bhopal', 'VIT Bhopal University', 'Radharaman Engineering College'],
    'Nagpur': ['IIIT Nagpur', 'VNIT Nagpur', 'GHRCE Nagpur', 'RCOEM Nagpur', 'YCCE Nagpur', 'Priyadarshini College of Engineering'],
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
      {isLocationLoading && (
        <div className="location-loading-overlay">
          <div className="location-loading-spinner"></div>
          <div className="location-loading-text">
            {locationStatus === 'checking' ? 'Checking your location status...' : 'Fetching your location, please wait...'}
          </div>
        </div>
      )}

      <div className="profile-page-layout">
        {/* ========== PROFILE PICTURE SECTION ========== */}
        <div className="profile-picture-container">
          {/* Profile Avatar */}
          <img src={imagePreview || `https://ui-avatars.com/api/?name=${formData.username || 'User'}&background=random&size=150`} alt="Profile" className="profile-avatar" />
          {/* Unsaved Warning */}
          {hasUnsavedChanges && (
            <div className="unsaved-warning">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#f59e0b" strokeWidth="2" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              You have unsaved changes. Don't forget to save!
            </div>
          )}
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          <label htmlFor="imageUpload" className="upload-btn">Choose Image</label>
          {imageFile && <button onClick={handleImageUpload} className="save-photo-btn" disabled={loading}>Save Photo</button>}
        </div>

        {/* ========== PROFILE FORM SECTION ========== */}
        <div className="profile-form-container">
          <h2>My Profile</h2>

          <div className={`location-setup-section ${locationStatus === 'disabled' ? 'urgent' : ''}`}>
            <div className="location-header">
              <MapPin size={24} />
              <h3>Location Setup</h3>
              {locationStatus === 'enabled' && <span className="status-badge success"><CheckCircle size={16} /> Active</span>}
              {locationStatus === 'disabled' && <span className="status-badge warning"><AlertCircle size={16} /> Not Set</span>}
            </div>

            {locationStatus === 'disabled' && showLocationPrompt && (
              <div className="location-prompt-card">
                <h4>Enable Your Location</h4>
                <p>{user?.role === 'mentor' ? 'To appear in nearby searches for students, enable location access.' : 'To find nearby mentors and connect with them, enable location access.'}</p>
                <button onClick={enableLocation} className="enable-location-btn" disabled={locationStatus === 'updating'}>
                  {locationStatus === 'updating' ? <><RefreshCw size={18} className="spinning" /> Getting Location...</> : <><MapPin size={18} /> Enable Location</>}
                </button>
              </div>
            )}

            {locationStatus === 'enabled' && currentLocation && (
              <div className="location-enabled-card">
                <CheckCircle size={20} className="check-icon" />
                <div className="location-details">
                  <p className="location-text">📍 <strong>{currentLocation.city || 'Location Set'}</strong>, {currentLocation.state || ''}</p>
                </div>
                <button onClick={updateLocation} className="update-location-btn-small" disabled={locationStatus === 'updating'}><RefreshCw size={14} /> Update</button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <h3>Basic Information</h3>
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio..." rows="4" />
            <input name="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange} placeholder="LinkedIn URL" />

            <h3>Education</h3>
            <select name="city" value={formData.city} onChange={handleChange} required>
              <option value="" disabled>-- Select Your City --</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>

            {formData.education.map((edu, index) => (
              <div key={index} className="education-group">
                <select value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} required>
                  <option value="" disabled>-- Select Your College --</option>
                  {formData.city && collegeData[formData.city]?.map(college => <option key={college} value={college}>{college}</option>)}
                </select>
                <select value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} required>
                  {degrees.map(degree => <option key={degree} value={degree}>{degree}</option>)}
                </select>
                <select value={edu.year} onChange={(e) => handleEducationChange(index, 'year', e.target.value)} required>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={edu.field} onChange={(e) => handleEducationChange(index, 'field', e.target.value)} required>
                  {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                </select>
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
                {formData.education.length > 1 && <button type="button" className="remove-btn" onClick={() => removeEducation(index)}>&times;</button>}
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addEducation}>+ Add Education</button>


            {user?.role === 'user' && (
              <>
                <h3>Student Details</h3>
                <div className="chip-input-container">
                  <div className="chips-wrapper">
                    {formData.interests.map((interest, index) => (
                      <span key={index} className="chip">{interest} <button type="button" className="chip-remove" onClick={() => removeInterest(index)}>&times;</button></span>
                    ))}
                    <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={handleInterestKeyDown} placeholder="Add interest..." className="chip-input" />
                    <button type="button" className="chip-add-btn" onClick={addInterest} disabled={!interestInput.trim()} title="Add interest">
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {user?.role === 'mentor' && (
              <>
                <div className="mentor-exciting-section"> {/* 🔥 Container ko yahan se shuru kiya */}
                  <h3>Mentor Details <small>(USED BY OUR ATYANT ENGINE FOR ACCURATE ROUTING)</small></h3>
                  <div className="form-group">
                    <h3>Primary Mentorship Focus*</h3>
                    <select name="primaryDomain" value={formData.primaryDomain} onChange={(e) => setFormData({...formData, primaryDomain: e.target.value})} className="engine-select">
                      <option value="">-- Focus --</option>
                      <option value="placement">Placement Focus</option>
                      <option value="internship">Internship Focus</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  {/* Mentor Info (DNA) Section */}
                  <MentorInfo mentor={user} onDnaUpdate={setUser} />
                  <div className="form-group">
                    <h3>Companies Expertise*</h3>
                    <div className="chip-input-container">
                      <div className="chips-wrapper">
                        {(formData.topCompanies || []).map((company, index) => (
                          <span key={index} className="chip company-chip">{company} <button type="button" className="chip-remove" onClick={() => removeCompany(index)}>×</button></span>
                        ))}
                        <input type="text" value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} onKeyDown={handleCompanyKeyDown} placeholder="Type company name" className="chip-input" />
                        <button type="button" className="chip-add-btn" onClick={addCompany} disabled={!companyInput.trim()} title="Add company">
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* 1. Company Domain */}
                  <div className="form-group">
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

                  {/* 2. Placement Achievements */}
                  <div className="form-group">
                    <h3>Placement Achievements</h3>
                    <div className="tags-row">
                      {['On-campus Placement', 'Off-campus', 'PPO'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag('milestones', tag)}
                          className={`tag-btn${(formData.milestones || []).includes(tag) ? ' active' : ''}`}
                        >{tag}</button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Internship Achievements */}
                  <div className="form-group">
                    <h3>Internship Achievements</h3>
                    <div className="tags-row">
                      {['On Campus Internship',
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
                        >{tag}</button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Skills */}
                  <div className="chip-input-container">
                    <h3>Skills</h3>
                    <div className="chips-wrapper">
                      {formData.expertise.map((skill, index) => (
                        <span key={index} className="chip">{skill} <button type="button" className="chip-remove" onClick={() => removeExpertise(index)}>&times;</button></span>
                      ))}
                      <input type="text" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyDown={handleExpertiseKeyDown} placeholder="Like DSA, MERN, PowerBi, Casestudy..." className="chip-input" />
                      <button type="button" className="chip-add-btn" onClick={addExpertise} disabled={!expertiseInput.trim()} title="Add skill ">
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {hasUnsavedChanges && (
              <div className="unsaved-warning">
                <AlertCircle size={18} />
                <span>You have unsaved changes. Don't forget to save!</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="save-profile-btn">
              {loading ? 'Saving...' : hasUnsavedChanges ? '💾 Save Changes' : 'Save Profile'}
            </button>
            {message.text && <p className={`form-message ${message.type}`}>{message.text}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;