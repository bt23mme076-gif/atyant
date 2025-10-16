import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // ========== STATE: Extended form data ==========
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    linkedinProfile: '',
    // ✅ NEW: Common fields
    city: '',
    education: [{ institution: '', degree: '', field: '', year: '' }],
    // ✅ NEW: Student-specific
    interests: [],
    // ✅ NEW: Mentor-specific
    expertise: [],
    domainExperience: []
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // ✅ NEW: State for profile picture
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
        setMessage({ text: 'An error occurred.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // ========== HANDLE IMAGE SELECTION ==========
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ========== HANDLE IMAGE UPLOAD ==========
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

  // ========== HANDLE FORM INPUT CHANGES (FIXED) ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Handle comma-separated arrays with better UX
    if (name === 'interests' || name === 'expertise' || name === 'domainExperience') {
      // Keep raw value for display, but split for storage
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.split(',').map(s => s.trim()).filter(s => s !== '')
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ NEW: Handle chip-based interest input
  const [interestInput, setInterestInput] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newInterest = interestInput.trim();
      
      if (newInterest && !formData.interests.includes(newInterest)) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, newInterest]
        }));
        setInterestInput(''); // Clear input
      }
    }
    
    // Handle backspace to remove last chip
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

  // ✅ NEW: Handle education field changes
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  // ✅ NEW: Add another education entry
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', year: '' }]
    }));
  };

  // ✅ NEW: Remove education entry
  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, education: newEducation }));
    }
  };

  // ========== SUBMIT FORM ==========
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

  // ✅ NEW: Data for interactive dropdowns
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

  if (loading && !formData.username) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
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
        <form onSubmit={handleSubmit}>
          
          {/* ========== BASIC INFORMATION ========== */}
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
          {/* ✅ MODIFIED: EDUCATION SECTION (now interactive) */}
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
              
              {/* College Dropdown (filters based on city) */}
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
              
              {/* Show text input if city is 'Other' or college is 'Other' */}
              {(formData.city === 'Other' || edu.institution === 'Other') && (
                <input
                  placeholder="Please specify your College/University"
                  value={edu.institution === 'Other' ? '' : edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  required
                />
              )}

              {/* Degree Dropdown */}
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
              
              {/* Year Dropdown */}
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

            {/* Branch Dropdown (Engineering Branches) */}
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

          {/* ========== ROLE-SPECIFIC FIELDS ========== */}
          
          {/* Student-specific fields */}
          {user?.role === 'user' && (
            <>
              <h3>Student Details</h3>
              
              {/* ✅ CHIP-BASED INTEREST INPUT */}
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
                    placeholder={formData.interests.length === 0 ? "Type interest and press Enter (e.g., DSA, Coding, AI)" : "Add more..."}
                    className="chip-input"
                  />
                </div>
              </div>
              <small className="helper-text">
                💡 Press <kbd>Enter</kbd> or <kbd>,</kbd> after each interest • Press <kbd>Backspace</kbd> to remove
              </small>
            </>
          )}

          {/* Mentor-specific fields */}
          {user?.role === 'mentor' && (
            <>
              <h3>Mentor Details</h3>
              
              {/* ✅ CHIP-BASED EXPERTISE INPUT */}
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
                    placeholder={formData.expertise.length === 0 ? "Type expertise and press Enter (e.g., React, Java)" : "Add more..."}
                    className="chip-input"
                  />
                </div>
              </div>
              <small className="helper-text">
                💡 Press <kbd>Enter</kbd> or <kbd>,</kbd> after each skill • Press <kbd>Backspace</kbd> to remove
              </small>
            </>
          )}

          {/* ========== SUBMIT BUTTON ========== */}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>

          {/* ========== MESSAGE DISPLAY ========== */}
          {message.text && (
            <p className={`form-message ${message.type}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
