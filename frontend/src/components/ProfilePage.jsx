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
    domainExperience: [],
    // 🚀 NEW ENGINE FIELDS
    primaryDomain: '',
    topCompanies: [],
    milestones: [],
    specialTags: []
  });

  // Options for Structured Tags
  const domains = ['placement', 'internship', 'both'];
  const milestoneOptions = ['PPO', 'Off-campus Winner', 'On-campus Placement', 'Remote Internship'];

  // 📋 Internship & Placement Optimized Categories
  const specialCategoryOptions = [
    'Foreign Internship 🌍', 
    'IIT Research Intern 🎓', 
    'IIM MBA Intern 💼', 
    'FAANG Cracked 🚀',
    'International Job Offer ✈️',
    'Tier-1 College (IIT/NIT/BITS)',
    'Masters Abroad 🏛️'
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
            // 🚀 Load new engine fields with fallback to prevent errors
            primaryDomain: data.primaryDomain || '',
            topCompanies: data.topCompanies || [],
            milestones: data.milestones || [],
            specialTags: data.specialTags || [] // 🔥 THIS LINE FIXES THE REFRESH ISSUE
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

  // ========== CHECK IF LOCATION IS ALREADY SAVED ==========
  useEffect(() => {
    if (user && user.token) {
      checkUserLocation();
    }
  }, [user]);

  const checkUserLocation = async () => {
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
        // 🔥 formData ab saare fields (specialTags sahit) backend bhejega
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
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
          <h3>Profile Picture</h3>
          <img
            src={imagePreview || `https://ui-avatars.com/api/?name=${formData.username || 'User'}&background=random&size=150`}
            alt="Profile"
            className="profile-avatar"
          />
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
                    <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={handleInterestKeyDown} placeholder="Add interest... and enter to add" className="chip-input" />
                  </div>
                </div>
              </>
            )}

            {user?.role === 'mentor' && (
              <>
                <h3>Mentor Details</h3>
                {/* 🚀 Atyant Engine Optimization Section */}
                <div className="engine-optimization-section">
                  <h3 className="section-title">🚀 Atyant Engine Optimization</h3>
                  <p className="helper-text">Standardize your profile for Placement & Internship matching.</p>

                  <div className="form-group">
                    <label>Primary Mentorship Focus</label>
                    <select name="primaryDomain" value={formData.primaryDomain} onChange={(e) => setFormData({...formData, primaryDomain: e.target.value})} className="engine-select">
                      <option value="">-- Focus --</option>
                      <option value="placement">Placement Focus</option>
                      <option value="internship">Internship Focus</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Companies Expertise</label>
                    <div className="chip-input-container">
                      <div className="chips-wrapper">
                        {(formData.topCompanies || []).map((company, index) => (
                          <span key={index} className="chip company-chip">{company} <button type="button" className="chip-remove" onClick={() => removeCompany(index)}>×</button></span>
                        ))}
                        <input type="text" value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} onKeyDown={handleCompanyKeyDown} placeholder="Type company & Enter" className="chip-input" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Achievement Categories</label>
                    <div className="tags-grid">
                      {specialCategoryOptions.map(tag => (
                        <button type="button" key={tag} onClick={() => toggleTag('specialTags', tag)} className={`tag-btn special ${(formData.specialTags || []).includes(tag) ? 'active' : ''}`}>{tag}</button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Career Milestones</label>
                    <div className="tags-grid">
                      {milestoneOptions.map(m => (
                        <button type="button" key={m} onClick={() => toggleTag('milestones', m)} className={`tag-btn milestone ${(formData.milestones || []).includes(m) ? 'active' : ''}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="chip-input-container">
                  <div className="chips-wrapper">
                    {formData.expertise.map((skill, index) => (
                      <span key={index} className="chip">{skill} <button type="button" className="chip-remove" onClick={() => removeExpertise(index)}>&times;</button></span>
                    ))}
                    <input type="text" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyDown={handleExpertiseKeyDown} placeholder="Add skill... and enter to add" className="chip-input" />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="save-profile-btn">{loading ? 'Saving...' : 'Save Profile'}</button>
            {message.text && <p className={`form-message ${message.type}`}>{message.text}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;