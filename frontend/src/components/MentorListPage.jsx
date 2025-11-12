// src/pages/MentorListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import MentorRating from './MentorRating';
import './MentorListPage.css';

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ State Management - CORRECTED
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filters, setFilters] = useState({
    mentorBackground: 'All',
    availability: 'All',
    price: 'All',
    sort: 'Recommended'
  });

  // ✅ Category Buttons (Main User Intention)
  const categories = [
    ' All',
    ' Roadmap & Guidance',
    ' Internships',
    ' Placements',
    ' Higher Studies',
    ' Startups / Entrepreneurship',
    'Top Rated Mentors',
    'Active Now'
  ];

  // ✅ Dropdown Filter Options (Clear & Simple for Students)
  const filterOptions = {
    // 🎯 What kind of help are you looking for?
   

    // 👨‍🏫 What kind of mentor do you prefer?
    mentorBackground: [
      'All',
      'Senior from My College',
      'Alumni from My College',
      'Industry Professional',
      'Founder / Entrepreneur',
      'Exam / Subject Expert'
    ],

    // 🕓 When do you want to connect?
    availability: [
      'All',
      'Available Now',
      'This Week',
      'By Appointment'
    ],

    // 💰 Pricing or Reward Preference
    price: [
      'All',
      'Free',
      '₹0–200',
      '₹200–500',
      '₹500–1000',
      '₹1000+',
      'Use Atyant Credits'
    ],

    // ⚡ Sort Mentors By
    sort: [
      'Recommended',
      'Most Helpful',
      'Most Active',
      'Lowest Price',
      'Most Experienced',
      'Highest Rated',
      'Newest Mentors'
    ]
  };

  // ✅ FIXED fetchMentors - Remove all console.logs
  const fetchMentors = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (filters.mentorBackground !== 'All') params.append('mentorBackground', filters.mentorBackground);
      if (filters.availability !== 'All') params.append('availability', filters.availability);
      if (filters.price !== 'All') params.append('price', filters.price);
      params.append('sort', filters.sort);

      const url = params.toString()
        ? `${API_URL}/api/search/mentors?${params.toString()}`
        : `${API_URL}/api/users/mentors`;
      
      // ❌ REMOVE: console.log('Fetching from URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Data could not be fetched!');
      }
      const data = await response.json();
      
      // ❌ REMOVE all these console.logs:
      // console.log('API Response:', data);
      // if (data && data.length > 0) {
      //   console.log('First mentor structure:', data[0]);
      //   console.log('First mentor bio field:', data[0].bio);
      //   console.log('All mentor fields:', Object.keys(data[0]));
      // }
      
      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load Mentors. Please try again later.');
      // Only log error message in development
      if (import.meta.env.DEV) {
        console.error('Failed to fetch Mentors:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Re-fetch when filters change
  useEffect(() => {
    fetchMentors(searchTerm);
  }, [selectedCategory, filters]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors(searchTerm.trim());
  };

  // ✅ Filter change handler
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // ✅ FIXED Clear all filters - Using CORRECT keys
  const clearAllFilters = () => {
    setSelectedCategory('All');
    setFilters({
      mentorBackground: 'All',
      availability: 'All',
      price: 'All',
      sort: 'Recommended'
    });
  };

  // ✅ EXISTING functions - No changes
  const startChatWithMentor = (e, mentor) => {
    e.stopPropagation();
    navigate('/chat', {
      state: { selectedContact: mentor }
    });
  };

  const handleScheduleClick = (e, username) => {
    e.stopPropagation();
    navigate(`/profile/${username}#schedule`);
  };

  const handleCardClick = (username) => {
    const audio = new Audio('/click-sound.mp3');
    audio.play().catch(() => {});
    navigate(`/profile/${username}`);
  };

  return (
    <div className="mentor-list-container">
      {/* ✅ NEW: Enhanced Hero Section with Filters */}
      <div className="mentor-hero-section">
        <h1>Find a Mentor</h1>
        <p className="hero-subtitle">
          They’ve done what you’re trying to do — now they’re here to help you do it faster.
        </p>

        {/* ✅ Search Bar with Category Buttons */}
        <div className="search-bar-with-categories">
          <form className="search-bar-enhanced" onSubmit={handleSearch}>
            <div className="search-input-container">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="search-icon"
                width="20"
                height="20"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search mentor, company, role, city"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="search-submit-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>

          {/* ✅ Category Buttons */}
          <div className="category-buttons-container">
            <div className="category-buttons">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ Dropdown Filters - FIXED */}
        <div className="filters-row">
          <div className="filter-dropdowns">
            {/* Sort By */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="filter-dropdown"
            >
              <option value="Recommended">Sort by: Recommended</option>
              {filterOptions.sort.filter(s => s !== 'Recommended').map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {/* 👨‍🏫 Mentor Background */}
            <select
              value={filters.mentorBackground}
              onChange={(e) => handleFilterChange('mentorBackground', e.target.value)}
              className="filter-dropdown"
            >
              <option value="All">Mentor Background</option>
              {filterOptions.mentorBackground.filter(m => m !== 'All').map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {/* 🕓 Availability */}
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="filter-dropdown"
            >
              <option value="All">Availability</option>
              {filterOptions.availability.filter(a => a !== 'All').map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {/* 💰 Price */}
            <select
              value={filters.price}
              onChange={(e) => handleFilterChange('price', e.target.value)}
              className="filter-dropdown"
            >
              <option value="All">Price</option>
              {filterOptions.price.filter(p => p !== 'All').map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear all filters
          </button>
        </div>
      </div>

      {/* ✅ REST ALL SAME - Keep existing loading, error, and cards */}
      {loading && <div className="status-message">Loading Mentors...</div>}
      {error && <div className="status-message error">{error}</div>}

      {!loading && !error && (
        <div className="mentor-grid">
          {mentors.length === 0 && (
            <div className="no-mentors-found">
              No Mentors found. Try a different search.
            </div>
          )}

          {mentors.map((mentor) => {
            // ❌ REMOVE these:
            // console.log('Processing mentor:', mentor);
            // console.log('Mentor bio:', mentor?.bio);
            
            if (!mentor) {
              return null;
            }

            const {
              _id,
              username,
              name,
              profilePicture,
              title,
              company,
              rating,
              reviewsCount,
              tags,
              specialties,
              badges,
              hasScheduling,
              bio
            } = mentor;

            return (
              <div 
                className="mentor-card clickable-card" 
                key={_id || username}
                onClick={() => handleCardClick(username)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(username);
                  }
                }}
              >
                <div className="mentor-card-content">
                  <div className="mentor-image-container">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={name || username}
                        className="mentor-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/default-profile-image.jpg';
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="mentor-image-placeholder" />
                    )}
                    <span className="mentor-status" />
                  </div>

                  <h3 className="mentor-name">
                    {name || username}
                  </h3>

                  <p className="mentor-bio">
                    {mentor.bio && typeof mentor.bio === 'string' && mentor.bio.trim() !== ''
                      ? (mentor.bio.length > 100
                         ? `${mentor.bio.substring(0, 100)}...`
                         : mentor.bio)
                      : "No bio available"
                    }
                  </p>

                  <div className="mentor-card-rating">
                    <MentorRating mentorId={_id} showDetails={false} />
                  </div>

                  {(title || company) && (
                    <p className="mentor-title">
                      {title ? title : 'Mentor'}
                      {company ? ` • ${company}` : ''}
                    </p>
                  )}

                  {Array.isArray(specialties) && specialties.length > 0 && (
                    <div className="mentor-specialties">
                      {specialties.slice(0, 3).map((specialty, i) => (
                        <span key={i} className="specialty-tag">{specialty}</span>
                      ))}
                    </div>
                  )}

                  {(typeof rating === 'number' || typeof reviewsCount === 'number') && (
                    <div className="mentor-stats">
                      {typeof rating === 'number' && (
                        <div className="stat">
                          <div className="stat-value">⭐ {rating.toFixed(1)}</div>
                          <div className="stat-label">Rating</div>
                        </div>
                      )}
                      {typeof reviewsCount === 'number' && (
                        <div className="stat">
                          <div className="stat-value">{reviewsCount}</div>
                          <div className="stat-label">Reviews</div>
                        </div>
                      )}
                    </div>
                  )}

                  {Array.isArray(badges) && badges.length > 0 && (
                    <div className="mentor-badges">
                      {badges.slice(0, 4).map((b, idx) => (
                        <span className="mentor-badge" key={idx}>{b}</span>
                      ))}
                    </div>
                  )}

                  {Array.isArray(tags) && tags.length > 0 && (
                    <div className="mentor-tags">
                      {tags.slice(0, 3).map((t, idx) => (
                        <span className="mentor-tag" key={idx}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="mentor-actions">
                    <button
                      onClick={(e) => startChatWithMentor(e, mentor)}
                      className="chat-button"
                    >
                      Start Chat
                    </button>
                    {hasScheduling && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={(e) => handleScheduleClick(e, username)}
                      >
                        Schedule Call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentorListPage;
