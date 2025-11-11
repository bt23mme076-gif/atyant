// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Get user's college from education array
  const userCollege = user?.education?.[0]?.institution || '';

  const [filters, setFilters] = useState({
    category: 'All',
    mentorBackground: 'All',
    domain: 'All',
    experience: 'All',
    sort: 'Recommended'
  });

  const filterOptions = {
    category: ['All', 'Students', 'Professionals', 'Entrepreneurs', 'Job Seekers'],
    mentorBackground: [
      'All',
      'Senior from My College',
      'Alumni from My College',
      'Industry Professional',
      'Founder / Entrepreneur',
      'Exam / Subject Expert'
    ],
    domain: ['All', 'Software Development', 'Data Science', 'Product Management', 'Business', 'Career Counseling'],
    experience: ['All', '0-2 years', '2-5 years', '5-10 years', '10+ years'],
    sort: ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Experience: High to Low', 'Rating']
  };

  // ✅ Fetch suggestions with college matching
  useEffect(() => {
    if (!query.trim() && filters.mentorBackground === 'All') {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const params = new URLSearchParams();

        if (query.trim()) {
          params.append('q', query);
        }

        if (filters.category !== 'All') {
          params.append('category', filters.category);
        }

        // NOTE: No longer sending userCollege; backend uses req.user
        if (filters.mentorBackground !== 'All') {
          params.append('mentorBackground', filters.mentorBackground);
        }

        if (filters.domain !== 'All') {
          params.append('domain', filters.domain);
        }

        if (filters.experience !== 'All') {
          params.append('experience', filters.experience);
        }

        params.append('sort', filters.sort);

        // Ensure Authorization header is set!
        const response = await fetch(`${API_URL}/api/search/mentors?${params}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const data = await response.json();

        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filters, user?.token]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      mentorBackground: 'All',
      domain: 'All',
      experience: 'All',
      sort: 'Recommended'
    });
  };

  const startChatWithMentor = (mentor) => {
    navigate('/chat', { state: { selectedContact: mentor } });
  };

  const showNoResults = (query.trim() || filters.mentorBackground !== 'All') && suggestions.length === 0;

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search for Mentor, skills, or topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter Mentors</h3>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset All
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {filterOptions.category.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* ✅ Mentor Background with institution-based filtering */}
            <div className="filter-group">
              <label>Mentor Background</label>
              <select
                value={filters.mentorBackground}
                onChange={(e) => handleFilterChange('mentorBackground', e.target.value)}
                className="filter-select"
                disabled={
                  !userCollege && (
                    filters.mentorBackground === 'Senior from My College' ||
                    filters.mentorBackground === 'Alumni from My College'
                  )
                }
              >
                {filterOptions.mentorBackground.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              {/* UI: Show user's institution when filtering by college */}
              {(filters.mentorBackground === 'Senior from My College' ||
                filters.mentorBackground === 'Alumni from My College') && (
                <small className="filter-hint">
                  {userCollege ? (
                    <>🎓 Showing mentors from: <strong>{userCollege}</strong></>
                  ) : (
                    <span style={{ color: '#ef4444' }}>⚠️ Please add your institution in profile first</span>
                  )}
                </small>
              )}
            </div>

            <div className="filter-group">
              <label>Domain/Expertise</label>
              <select
                value={filters.domain}
                onChange={(e) => handleFilterChange('domain', e.target.value)}
                className="filter-select"
              >
                {filterOptions.domain.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="filter-select"
              >
                {filterOptions.experience.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                {filterOptions.sort.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="active-filters">
            {Object.entries(filters).map(([key, value]) =>
              value !== 'All' && value !== 'Recommended' && (
                <span key={key} className="filter-tag">
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key, key === 'sort' ? 'Recommended' : 'All')}
                    className="remove-filter"
                    aria-label={`Remove ${key} filter`}
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          <li className="suggestions-header">
            {filters.mentorBackground === 'Senior from My College' ||
              filters.mentorBackground === 'Alumni from My College'
              ? `Mentors from ${userCollege} (${suggestions.length} results):`
              : `Suggested Mentors (${suggestions.length} results):`
            }
          </li>
          {suggestions.map((mentor) => (
            <li
              key={mentor._id}
              onClick={() => startChatWithMentor(mentor)}
              className="suggestion-item"
            >
              <div className="suggestion-avatar">
                <img
                  src={mentor.profilePicture || `https://api.pravatar.cc/150?u=${mentor._id}`}
                  alt={mentor.username}
                />
              </div>
              <div className="suggestion-info">
                <span className="suggestion-name">{mentor.name || mentor.username}</span>
                {mentor.title && <span className="suggestion-title">{mentor.title}</span>}
                {/* ✅ Show mentor's institution */}
                {mentor.education?.[0]?.institution && (
                  <span className="suggestion-college">
                    🎓 {mentor.education[0].institution}
                  </span>
                )}
              </div>
              {mentor.price && (
                <span className="suggestion-price">₹{mentor.price}/session</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <div className="no-results-msg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p>
            {filters.mentorBackground === 'Senior from My College' ||
              filters.mentorBackground === 'Alumni from My College'
              ? `No mentors found from ${userCollege || 'your college'}.`
              : `No Mentors found for "${query}".`
            }
          </p>
          <span>Try adjusting your filters or search terms</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
