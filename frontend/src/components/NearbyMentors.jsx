import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { MapPin, Navigation, Users, MessageCircle, Search, X, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import './NearbyMentors.css';
import './shared.css';
import LoadingSpinner from './LoadingSpinner';
import SEO from './SEO'; // ✅ NEW IMPORT

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ========== EXPERTISE CATEGORIES ==========
const expertiseCategories = {
  '🎓 Academic & College Life': [
    'Exam preparation',
    'Notes & study material',
    'Lab work help',
    'Project guidance',
    'Internships',
    'College event participation',
    'Time management',
    'Branch change guidance',
    'Club/society joining'
  ],
  '💻 Technical & Skill-Based': [
    'Placement Preparation',
    'DSA',
    'Web Development',
    'Mobile App Development',
    'Machine Learning',
    'Artificial intelligence',
    'Data Science',
    'Cloud Computing',
    'Cybersecurity',
    'UI/UX Design',
    'Competitive Programming',
    'DevOps',
    'Blockchain',
    'Game Development',
    'IoT'
  ],
  '🚀 Career & Growth': [
    'Career Guidance',
    'Interview Preparation',
    'Resume Building',
    'Internship search', 
    'Job placement',
    'Startup guidance',
    'Freelancing',
    'Public speaking',
    'Networking'
  ],
  '💬 Personal & Lifestyle': [
    'Productivity',
    'Motivation',
    'Fitness & health in college',
    'Mental well-being',
    'Communication skills',
    'English speaking'
  ],
  '🧭 Entrepreneurship': [
    'Startup/Entrepreneurship',
    'Idea validation',
    'MVP building',
    'Fundraising',
    'Pitch deck preparation',
    'Marketing strategy',
    'Growth hacking',
    'Startup registration',
    'Building a founding team'
  ],
  '🔬 Research & Advanced': [
    'Research & Publications',
    'Open Source'
  ]
};

const NearbyMentors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [maxDistance, setMaxDistance] = useState(100000);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [sortBy, setSortBy] = useState('distance');
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // ========== LOAD SAVED LOCATION ==========
  useEffect(() => {
    if (user && user.token) {
      loadSavedLocation();
    }
  }, [user]);

  const loadSavedLocation = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading saved location from profile...');

      const response = await fetch(`${API_URL}/api/location/my-location`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (data.success && data.hasLocation && data.location.coordinates) {
        const [longitude, latitude] = data.location.coordinates;
        
        const location = {
          lat: latitude,
          lng: longitude,
          city: data.location.city,
          state: data.location.state
        };

        console.log('✅ Loaded saved location:', {
          city: location.city,
          coordinates: { lat: location.lat, lng: location.lng }
        });

        setUserLocation(location);
        fetchNearbyMentors(location);
      } else {
        setLocationError('Please enable location in your profile first');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error loading saved location:', error);
      setLocationError('Failed to load your location. Please check your profile.');
      setLoading(false);
    }
  };

  // ========== FETCH NEARBY MENTORS ==========
  const fetchNearbyMentors = async (location) => {
    try {
      setLoading(true);
      
      console.log('========================================');
      console.log('🔍 FRONTEND: Searching nearby mentors');
      console.log('📍 My Location:', {
        city: location.city,
        lat: location.lat,
        lng: location.lng
      });
      console.log('🔍 Search Radius:', maxDistance / 1000, 'km');
      console.log('========================================');

      const response = await fetch(`${API_URL}/api/location/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          maxDistance: maxDistance
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Found mentors:', data.count);
        
        data.mentors.forEach((mentor, index) => {
          console.log(`${index + 1}. ${mentor.username} - ${mentor.distanceText}`);
        });

        setMentors(data.mentors);
        setFilteredMentors(data.mentors);
        setLocationError(null);
      } else {
        console.error('❌ Error:', data.message);
        setLocationError(data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching mentors:', error);
      setLocationError('Failed to fetch nearby mentors');
    } finally {
      setLoading(false);
    }
  };

  // ========== TOGGLE CATEGORY EXPANSION ==========
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // ========== SELECT CATEGORY ==========
  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
      setExpandedCategories({});
    } else {
      setSelectedCategory(category);
      setExpandedCategories({ [category]: true });
    }
  };

  // ========== TOGGLE EXPERTISE SELECTION ==========
  const toggleExpertise = (expertise) => {
    setSelectedExpertise(prev => {
      if (prev.includes(expertise)) {
        return prev.filter(e => e !== expertise);
      } else {
        return [...prev, expertise];
      }
    });
  };

  // ========== INTELLIGENT SEARCH FUNCTION ==========
  useEffect(() => {
    let results = [...mentors];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      results = results.filter(mentor => {
        const nameMatch = mentor.username?.toLowerCase().includes(query);
        const bioMatch = mentor.bio?.toLowerCase().includes(query);
        const expertiseMatch = mentor.expertise?.some(exp => 
          exp.toLowerCase().includes(query)
        );
        const skillsMatch = mentor.skills?.some(skill => 
          skill.toLowerCase().includes(query)
        );
        const locationMatch = mentor.location?.city?.toLowerCase().includes(query) ||
                              mentor.location?.state?.toLowerCase().includes(query);

        const keywords = query.split(' ').filter(k => k.length > 2);
        const keywordMatch = keywords.some(keyword => 
          mentor.username?.toLowerCase().includes(keyword) ||
          mentor.bio?.toLowerCase().includes(keyword) ||
          mentor.expertise?.some(exp => exp.toLowerCase().includes(keyword)) ||
          mentor.skills?.some(skill => skill.toLowerCase().includes(keyword))
        );

        return nameMatch || bioMatch || expertiseMatch || skillsMatch || locationMatch || keywordMatch;
      });
    }

    // 2. Multi-Expertise Filter
    if (selectedExpertise.length > 0) {
      results = results.filter(mentor =>
        selectedExpertise.some(selected =>
          mentor.expertise?.some(exp => 
            exp.toLowerCase().includes(selected.toLowerCase())
          )
        )
      );
    }

    // 3. Sorting
    results.sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance;
      } else if (sortBy === 'name') {
        return a.username.localeCompare(b.username);
      } else if (sortBy === 'relevance') {
        const aMatches = a.expertise?.filter(exp => 
          exp.toLowerCase().includes(searchQuery.toLowerCase())
        ).length || 0;
        const bMatches = b.expertise?.filter(exp => 
          exp.toLowerCase().includes(searchQuery.toLowerCase())
        ).length || 0;
        return bMatches - aMatches;
      }
      return 0;
    });

    setFilteredMentors(results);
  }, [searchQuery, selectedExpertise, sortBy, mentors]);

  // ========== CLEAR FILTERS ==========
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedExpertise([]);
    setExpandedCategories({});
    setSortBy('distance');
    setShowFilters(false);
  };

  // ========== START CHAT WITH MENTOR (FIXED) ==========
  const handleStartChat = (mentor) => {
    navigate('/chat', {
      state: { 
        selectedContact: {
          _id: mentor._id,
          username: mentor.username,
          profilePicture: mentor.profilePicture
        }
      }
    });
  };

  // ========== GET DIRECTIONS (FIXED) ==========
  const handleGetDirections = (mentor) => {
    if (!userLocation) {
      alert('Your location is not available. Please enable location in your profile first.');
      return;
    }

    if (!mentor.location || !mentor.location.coordinates || mentor.location.coordinates.length !== 2) {
      alert('Mentor location information is not available.');
      return;
    }

    // Extract coordinates
    const myLat = userLocation.lat;
    const myLng = userLocation.lng;
    const mentorLat = mentor.location.coordinates[1]; // MongoDB stores [lng, lat]
    const mentorLng = mentor.location.coordinates[0];

    // Verify coordinates
    if (isNaN(myLat) || isNaN(myLng) || isNaN(mentorLat) || isNaN(mentorLng)) {
      console.error('❌ Invalid coordinates:', {
        myLat, myLng, mentorLat, mentorLng
      });
      alert('Invalid location coordinates. Please update your location.');
      return;
    }

    // Build Google Maps URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${myLat},${myLng}&destination=${mentorLat},${mentorLng}&travelmode=driving`;

    console.log('\n========================================');
    console.log('🗺️ OPENING GOOGLE MAPS DIRECTIONS');
    console.log('📍 From (Your Location):');
    console.log('   City:', userLocation.city || 'Unknown');
    console.log('   Coordinates:', `${myLat}, ${myLng}`);
    console.log('📍 To (Mentor Location):');
    console.log('   Name:', mentor.username);
    console.log('   City:', mentor.location.city || 'Unknown');
    console.log('   Coordinates:', `${mentorLat}, ${mentorLng}`);
    console.log('🔗 Google Maps URL:');
    console.log('   ', directionsUrl);
    console.log('========================================\n');

    // Open in new tab
    window.open(directionsUrl, '_blank');
  };

  // ========== REFRESH LOCATION ==========
  const handleRefresh = () => {
    if (userLocation) {
      console.log('🔄 Refreshing with current location');
      fetchNearbyMentors(userLocation);
    } else {
      loadSavedLocation();
    }
  };

  // ========== HIGHLIGHT SEARCH TERMS ==========
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="search-highlight">{part}</mark> : part
    );
  };

  // ========== UPDATE WHEN DISTANCE CHANGES ==========
  useEffect(() => {
    if (userLocation) {
      fetchNearbyMentors(userLocation);
    }
  }, [maxDistance]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('✅ User location:', position.coords);
        },
        (error) => {
          console.error('❌ Location error:', error);
        }
      );
    }
  }, []);

  // Loading state
  if (loading && !mentors.length) {
    return <LoadingSpinner message="Finding nearby mentors..." fullScreen={true} />;
  }

  // Location error state
  if (locationError) {
    return (
      <div className="nearby-mentors-page">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Location Required</h3>
          <p>{locationError}</p>
          <button 
            onClick={() => navigate('/profile')}
            className="enable-location-btn"
          >
            <MapPin size={18} />
            Enable Location in Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-mentors-page">
      {/* ✅ SEO FOR NEARBY MENTORS PAGE */}
      <SEO 
        title="Find Nearby Achievers & Mentors"
        description="Discover mentors near your location who've cracked placements, internships & career goals. Connect with seniors from IITs, NITs & top colleges. Get real guidance, not generic advice."
        keywords="nearby mentors, find mentors near me, college seniors near me, placement guidance, internship help, career mentors India, VNIT mentors, IIT mentors, NIT seniors, local student mentors"
        url="https://atyant.in/nearby-mentors"
      />

      {/* ========== HEADER ========== */}
      <div className="nearby-header">
        <div className="header-content">
          <h1>
            <MapPin size={32} />
            Nearby Achievers
          </h1>
          {userLocation && (
            <p>
              📍 Searching near <strong>{userLocation.city || 'your location'}</strong>
            </p>
          )}
          <p>Find mentors near you and connect instantly</p>
        </div>

        {/* ========== SMART SEARCH BAR ========== */}
        <div className="search-section">
          <div className="search-bar-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name, skills, expertise, or ask 'Who can help with DSA?'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>

          {/* Search Suggestions */}
          {searchQuery.length > 0 && (
            <div className="search-suggestions">
              <span className="suggestion-label">Try:</span>
              {['Web Development', 'Interview Preparation', 'Startup Guidance', 'Machine Learning', 'DSA', 'Placement Preparation'].map(suggestion => (
                <button
                  key={suggestion}
                  className="suggestion-chip"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========== FILTERS & CONTROLS ========== */}
        <div className={`controls-section ${showFilters ? 'show' : ''}`}>
          <div className="left-controls">
            {/* Distance Filter */}
            <div className="control-group">
              <label>📍 Radius:</label>
              <select 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="control-select"
              >
                <option value="10000">10 km</option>
                <option value="50000">50 km</option>
                <option value="100000">100 km</option>
                <option value="300000">300 km</option>
                <option value="500000">500 km</option>
                <option value="1000000">1000 km</option>
              </select>
            </div>

            {/* Hierarchical Expertise Filter */}
            <div className="control-group">
              <label>🎯 Expertise:</label>
              <div className="hierarchical-select-wrapper">
                <button 
                  className="multi-select-button"
                  onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}
                >
                  {selectedExpertise.length === 0 
                    ? 'Select Expertise' 
                    : `${selectedExpertise.length} selected`}
                  <span className={`dropdown-arrow ${showExpertiseDropdown ? 'open' : ''}`}>▼</span>
                </button>

                {showExpertiseDropdown && (
                  <div className="hierarchical-dropdown">
                    <div className="dropdown-header">
                      <span>Select Category & Expertise</span>
                      {selectedExpertise.length > 0 && (
                        <button 
                          className="clear-all-btn"
                          onClick={() => {
                            setSelectedExpertise([]);
                            setSelectedCategory('');
                            setExpandedCategories({});
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="dropdown-categories">
                      {/* Category List */}
                      <div className="category-list">
                        {Object.keys(expertiseCategories).map(category => (
                          <div key={category} className="category-item">
                            <button
                              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                              onClick={() => handleCategorySelect(category)}
                            >
                              <span>{category}</span>
                              <ChevronRight 
                                size={18} 
                                className={`category-arrow ${expandedCategories[category] ? 'rotated' : ''}`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Subcategory List */}
                      {selectedCategory && (
                        <div className="subcategory-list">
                          <div className="subcategory-header">
                            <span>{selectedCategory}</span>
                          </div>
                          <div className="subcategory-options">
                            {expertiseCategories[selectedCategory].map(expertise => (
                              <label key={expertise} className="checkbox-option">
                                <input
                                  type="checkbox"
                                  checked={selectedExpertise.includes(expertise)}
                                  onChange={() => toggleExpertise(expertise)}
                                />
                                <span className="checkbox-label">{expertise}</span>
                                {selectedExpertise.includes(expertise) && (
                                  <span className="check-icon">✓</span>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort By */}
            <div className="control-group">
              <label>⚡ Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select"
              >
                <option value="distance">Nearest First</option>
                <option value="name">Alphabetical</option>
                {searchQuery && <option value="relevance">Most Relevant</option>}
              </select>
            </div>
          </div>

          <div className="right-controls">
            {(searchQuery || selectedExpertise.length > 0 || selectedCategory) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <X size={16} />
                Clear Filters
              </button>
            )}
            
            <button onClick={handleRefresh} className="refresh-btn">
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Selected Category & Expertise Tags */}
        {(selectedCategory || selectedExpertise.length > 0) && (
          <div className="selected-filters-display">
            {selectedCategory && (
              <div className="selected-category-badge">
                <span className="category-icon">📂</span>
                <span>{selectedCategory}</span>
                <button onClick={() => {
                  setSelectedCategory('');
                  setExpandedCategories({});
                }}>×</button>
              </div>
            )}
            {selectedExpertise.length > 0 && (
              <div className="selected-expertise-tags">
                <span className="tags-label">Selected:</span>
                {selectedExpertise.map(exp => (
                  <span key={exp} className="selected-tag">
                    {exp}
                    <button 
                      className="remove-tag"
                      onClick={() => toggleExpertise(exp)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== RESULTS COUNT ========== */}
      {!loading && !locationError && filteredMentors.length > 0 && (
        <div className="mentors-count">
          <Users size={20} />
          <span>
            <strong>{filteredMentors.length}</strong> {filteredMentors.length === 1 ? 'mentor' : 'mentors'}
            {searchQuery && ' matching your search'}
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedExpertise.length > 0 && ` with selected expertise`}
          </span>
        </div>
      )}

      {/* ========== NO MENTORS FOUND ========== */}
      {!loading && !locationError && filteredMentors.length === 0 && (
        <div className="no-mentors">
          <Search size={48} />
          <h3>No mentors found</h3>
          <p>Try adjusting your filters or search query</p>
          {(searchQuery || selectedExpertise.length > 0 || selectedCategory) && (
            <button className="clear-filters-btn-large" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* ========== MENTORS GRID ========== */}
      {!loading && !locationError && filteredMentors.length > 0 && (
        <div className="mentors-grid">
          {filteredMentors.map((mentor) => (
            <div key={mentor._id} className="mentor-card">
              {/* Header with Badge */}
              <div className="mentor-card-header">
                {mentor.profilePicture ? (
                  <img 
                    src={mentor.profilePicture} 
                    alt={mentor.username}
                    className="mentor-avatar"
                  />
                ) : (
                  <div className="mentor-avatar-placeholder">
                    {mentor.username[0].toUpperCase()}
                  </div>
                )}
                <div className="mentor-badge">
                  <span className="role-badge mentor-role">Mentor</span>
                  <div className="distance-badge">
                    <MapPin size={14} />
                    {mentor.distanceText}
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="mentor-info">
                <h3 className="mentor-name">{highlightText(mentor.username, searchQuery)}</h3>
                
                {mentor.bio && (
                  <p className="mentor-bio">
                    {highlightText(
                      mentor.bio.length > 80 
                        ? `${mentor.bio.substring(0, 80)}...` 
                        : mentor.bio,
                      searchQuery
                    )}
                  </p>
                )}

                {/* Location */}
                <div className={`mentor-distance ${mentor.distance === 0 ? 'distance-same' : ''}`}>
                  <MapPin size={16} />
                  <span>
                    {mentor.distance === 0 
                      ? '📍 Same Location' 
                      : `${mentor.distanceText} away`}
                  </span>
                </div>

                {mentor.location?.city && (
                  <p className="location-city">
                    📌 {highlightText(mentor.location.city, searchQuery)}
                    {mentor.location.state && `, ${mentor.location.state}`}
                  </p>
                )}

                {/* Expertise */}
                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="expertise-tags">
                    <strong>Expertise:</strong>
                    <div className="skills-list">
                      {mentor.expertise.slice(0, 4).map((skill, index) => {
                        const isMatch = searchQuery && skill.toLowerCase().includes(searchQuery.toLowerCase());
                        const isSelected = selectedExpertise.some(sel => 
                          skill.toLowerCase().includes(sel.toLowerCase())
                        );
                        return (
                          <span 
                            key={index} 
                            className={`expertise-tag ${isMatch || isSelected ? 'expertise-match' : ''}`}
                          >
                            {highlightText(skill, searchQuery)}
                          </span>
                        );
                      })}
                      {mentor.expertise.length > 4 && (
                        <span className="expertise-tag more-tag">
                          +{mentor.expertise.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability Badge */}
                {mentor.availableForOfflineMeet && (
                  <span className="meet-badge">
                    ✅ Available for offline meet
                  </span>
                )}
              </div>

              {/* ========== ACTION BUTTONS ========== */}
              <div className="mentor-actions">
                <button 
                  onClick={() => handleGetDirections(mentor)}
                  className="action-btn directions-btn"
                  title="Get directions on Google Maps"
                >
                  <Navigation size={18} />
                  Directions
                </button>

                <button 
                  onClick={() => handleStartChat(mentor)}
                  className="action-btn message-btn"
                  title="Send a message"
                >
                  <MessageCircle size={18} />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyMentors;