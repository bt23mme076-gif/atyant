// src/pages/MentorListPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './MentorListPage.css';
import { API_URL } from '../services/api.js';

// ── Inline stars — zero API calls, uses rating already in mentor object ──
const InlineStars = React.memo(({ rating, reviewsCount }) => {
  if (typeof rating !== 'number') return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="mentor-rating">
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} className={i < full || (i === full && half) ? 'star filled' : 'star'}>
          {i < full ? '★' : i === full && half ? '★' : '☆'}
        </span>
      ))}
      <span className="rating-text">
        {rating.toFixed(1)}{typeof reviewsCount === 'number' ? ` (${reviewsCount})` : ''}
      </span>
    </div>
  );
});
InlineStars.displayName = 'InlineStars';

// ── Cache constants ──
const CACHE_TIME = 5 * 60 * 1000;
const CACHE_KEY = 'mentors_cache';

// ── Memoized Avatar ──
const MentorAvatar = React.memo(({ name, username, profilePicture }) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  ];
  const nameStr = name || username || 'M';
  const hash = nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % gradients.length;

  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={name || username}
        className="mentor-image"
        onError={e => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement.innerHTML = `
            <div class="mentor-image-placeholder">
              <div class="placeholder-avatar" style="background:${gradients[gradientIndex]}">
                <span>👤</span>
              </div>
            </div>`;
        }}
        loading="lazy"
      />
    );
  }
  return (
    <div className="mentor-image-placeholder">
      <div className="placeholder-avatar" style={{ background: gradients[gradientIndex] }}>
        <span>👤</span>
      </div>
    </div>
  );
});
MentorAvatar.displayName = 'MentorAvatar';

// ── Active filter tag ──
const FilterTag = ({ label, onRemove }) => (
  <div className="active-filter-tag" onClick={onRemove}>
    {label}
    <span className="tag-remove">×</span>
  </div>
);

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filters, setFilters] = useState({
    mentorBackground: 'All',
    availability: 'All',
    price: 'All',
    sort: 'Recommended',
  });
  const pillsRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    'All',
    'SDE Internships',
    'Product Internships',
    'Off-Campus Placements',
    'PPO Strategy',
    'Resume & Interview Prep',
    'Referral Help',
    'Top Rated',
  ];

  const filterOptions = {
    mentorBackground: [
      'All',
      'Product Company (FAANG, Unicorn)',
      'Service Company (TCS, Wipro, etc.)',
      'Startup (funded)',
      'From Tier-3 College',
      'Has Multiple Internships',
      'Got PPO Successfully',
    ],
    availability: ['All', 'Available Now', 'This Week', 'Flexible Schedule'],
    price: ['All', 'Free', '₹0–200', '₹200–500', '₹500–1000', '₹1000+'],
    sort: [
      'Recommended',
      'Most Students Helped',
      'Highest Success Rate',
      'Most Active',
      'Lowest Price',
      'Newest Mentors',
    ],
  };

  // ── Cache helpers ──
  const getCachedData = () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) return data;
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
    return null;
  };

  const setCachedData = data => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error('Cache write error:', err);
    }
  };

  // ── Fetch mentors ──
  const fetchMentors = async () => {
    const cached = getCachedData();
    if (cached) {
      setAllMentors(cached);
      setMentors(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/search/mentors?limit=200`;
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(url, { headers, cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch mentors (${response.status})`);
      const result = await response.json();
      const data = result.mentors || (Array.isArray(result) ? result : []);
      setAllMentors(data);
      setMentors(data);
      setCachedData(data);
    } catch (err) {
      setError('Could not load Mentors. Please try again later.');
      if (import.meta.env.DEV) console.error('Failed to fetch Mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter logic ──
  const getFilteredMentors = useCallback(() => {
    let filtered = [...allMentors];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(mentor => {
        const text = [
          mentor.name,
          mentor.username,
          mentor.bio,
          mentor.title,
          mentor.company,
          ...(mentor.specialties || []),
          ...(mentor.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(search);
      });
    }

    if (selectedCategory !== 'All') {
      const categoryKeywords = {
        'SDE Internships': ['sde', 'software', 'developer', 'engineering', 'internship', 'coding', 'programming', 'java', 'python', 'dsa', 'algorithm'],
        'Product Internships': ['product', 'pm', 'manager', 'product management', 'roadmap', 'strategy', 'user', 'case study'],
        'Off-Campus Placements': ['off campus', 'off-campus', 'placement', 'job', 'hiring', 'career', 'opportunity'],
        'PPO Strategy': ['ppo', 'pre placement', 'pre-placement', 'full time', 'convert', 'offer', 'internship to job'],
        'Resume & Interview Prep': ['resume', 'cv', 'interview', 'preparation', 'mock', 'question', 'rounds', 'coding round', 'hr round'],
        'Referral Help': ['referral', 'refer', 'reference', 'connect', 'network', 'introduction'],
        'Top Rated': [],
      };
      if (selectedCategory === 'Top Rated') {
        filtered = filtered.filter(m => (m.rating || 0) >= 4.5);
      } else {
        const keywords = categoryKeywords[selectedCategory] || [];
        filtered = filtered.filter(mentor => {
          const text = [
            mentor.bio,
            mentor.title,
            mentor.company,
            ...(mentor.specialties || []),
            ...(mentor.tags || []),
          ]
            .join(' ')
            .toLowerCase();
          return keywords.some(kw => text.includes(kw));
        });
      }
    }

    if (filters.mentorBackground !== 'All') {
      const bgKeywords = {
        'Product Company (FAANG, Unicorn)': ['google', 'amazon', 'microsoft', 'apple', 'meta', 'facebook', 'netflix', 'faang', 'unicorn', 'flipkart', 'uber', 'swiggy', 'zomato'],
        'Service Company (TCS, Wipro, etc.)': ['tcs', 'wipro', 'infosys', 'cognizant', 'accenture', 'capgemini', 'tech mahindra', 'hcl'],
        'Startup (funded)': ['startup', 'early stage', 'seed', 'series', 'funded'],
        'From Tier-3 College': ['tier 3', 'tier-3', 'tier3', 'non-iit', 'unknown college', 'small college'],
        'Has Multiple Internships': ['internship', 'intern'],
        'Got PPO Successfully': ['ppo', 'pre placement', 'converted'],
      };
      const keywords = bgKeywords[filters.mentorBackground] || [];
      if (keywords.length > 0) {
        filtered = filtered.filter(mentor => {
          const text = [
            mentor.bio,
            mentor.title,
            mentor.company,
            ...(mentor.specialties || []),
            ...(mentor.tags || []),
          ]
            .join(' ')
            .toLowerCase();
          return keywords.some(kw => text.includes(kw));
        });
      }
    }

    switch (filters.sort) {
      case 'Most Students Helped':
        filtered.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        break;
      case 'Highest Success Rate':
      case 'Recommended':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Lowest Price':
        filtered.sort((a, b) => (a.sessionPrice || 0) - (b.sessionPrice || 0));
        break;
      case 'Newest Mentors':
        filtered.reverse();
        break;
      default:
        break;
    }

    return filtered;
  }, [allMentors, selectedCategory, filters, searchTerm]);

  useEffect(() => {
    if (allMentors.length > 0 && !loading) {
      setMentors(getFilteredMentors());
    }
  }, [getFilteredMentors, loading]);

  useEffect(() => {
    fetchMentors();
  }, []);

  // ── Handlers ──
  const handleSearch = e => {
    e.preventDefault();
    // reactive via useEffect
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setFilters({ mentorBackground: 'All', availability: 'All', price: 'All', sort: 'Recommended' });
    setSearchTerm('');
  };

  const removeFilter = type => {
    if (type === 'category') setSelectedCategory('All');
    else handleFilterChange(type, 'All');
  };

  const startChatWithMentor = (e, mentor) => {
    e.stopPropagation();
    navigate('/chat', { state: { selectedContact: mentor } });
  };

  const handleScheduleClick = (e, username) => {
    e.stopPropagation();
    navigate(`/profile/${username}#schedule`);
  };

  const handleCardClick = username => {
    const audio = new Audio('/click-sound.mp3');
    audio.play().catch(() => {});
    navigate(`/profile/${username}`);
  };

  // ── Build active filter tags ──
  const activeFilterTags = [];
  if (selectedCategory !== 'All')
    activeFilterTags.push({ label: selectedCategory, onRemove: () => removeFilter('category') });
  if (filters.mentorBackground !== 'All')
    activeFilterTags.push({ label: filters.mentorBackground, onRemove: () => removeFilter('mentorBackground') });
  if (filters.price !== 'All')
    activeFilterTags.push({ label: filters.price, onRemove: () => removeFilter('price') });
  if (filters.availability !== 'All')
    activeFilterTags.push({ label: filters.availability, onRemove: () => removeFilter('availability') });

  const hasActiveFilters = activeFilterTags.length > 0 || searchTerm.trim() !== '';

  return (
    <div className="mentor-list-container">
      {/* ── Hero ── */}
      <div className="mentor-hero-section">
        <h1>Find Your Placement Mentor</h1>
        <p className="hero-subtitle">
          Connect with mentors who cracked the exact internship or placement you're targeting.
          Filter by company, role, and experience.
        </p>

        {/* ── Search bar ── */}
        <form className="search-bar-enhanced" onSubmit={handleSearch}>
          <div className="search-input-container">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by company, role, mentor name, or location"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="search-submit-btn">Search</button>
        </form>

        {/* ── Unified filter strip ── */}
        <div className="filter-strip">
          {/* Scrollable category pills */}
          <div className="pills-scroll" ref={pillsRef}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'Top Rated' ? '★ ' : ''}{cat}
              </button>
            ))}
          </div>

          <div className="filter-strip-divider" />

          {/* Compact dropdowns */}
          <div className="filter-dropdowns-inline">
            <select
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
              className="filter-pill-select"
              title="Sort by"
            >
              <option value="Recommended">Recommended</option>
              {filterOptions.sort
                .filter(s => s !== 'Recommended')
                .map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>

            <select
              value={filters.mentorBackground}
              onChange={e => handleFilterChange('mentorBackground', e.target.value)}
              className="filter-pill-select"
              title="Company type"
            >
              <option value="All">Company Type</option>
              {filterOptions.mentorBackground
                .filter(m => m !== 'All')
                .map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>

            <select
              value={filters.availability}
              onChange={e => handleFilterChange('availability', e.target.value)}
              className="filter-pill-select"
              title="Availability"
            >
              <option value="All">Availability</option>
              {filterOptions.availability
                .filter(a => a !== 'All')
                .map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>

            <select
              value={filters.price}
              onChange={e => handleFilterChange('price', e.target.value)}
              className="filter-pill-select"
              title="Price"
            >
              <option value="All">Price</option>
              {filterOptions.price
                .filter(p => p !== 'All')
                .map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters-inline" onClick={clearAllFilters}>
              Clear
            </button>
          )}
        </div>

        {/* ── Active filter tags ── */}
        {activeFilterTags.length > 0 && (
          <div className="active-filter-tags-row">
            {activeFilterTags.map((tag, i) => (
              <FilterTag key={i} label={tag.label} onRemove={tag.onRemove} />
            ))}
          </div>
        )}

        {/* ── Results count ── */}
        {!loading && !error && (
          <p className="results-count">
            {mentors.length === 0
              ? 'No mentors match your filters'
              : `${mentors.length} mentor${mentors.length !== 1 ? 's' : ''} found`}
          </p>
        )}
      </div>

      {/* ── States ── */}
      {loading && <div className="status-message">Finding mentors who match your criteria...</div>}
      {error && <div className="status-message error">Couldn't load mentors right now. Please try again in a moment.</div>}

      {/* ── Mentor grid ── */}
      {!loading && !error && (
        <div className="mentor-grid">
          {mentors.length === 0 && (
            <div className="no-mentors-found">
              No mentors match your filters. Try adjusting company type, role focus, or check back
              soon — we're adding new placement mentors every week.
            </div>
          )}

          {mentors.map(mentor => {
            if (!mentor) return null;
            const {
              _id, username, name, profilePicture, title, company,
              rating, reviewsCount, tags, specialties, badges, hasScheduling,
            } = mentor;

            return (
              <div
                className="mentor-card clickable-card"
                key={_id || username}
                onClick={() => handleCardClick(username)}
                role="button"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleCardClick(username);
                }}
              >
                <div className="mentor-card-content">
                  <div className="mentor-image-container">
                    <MentorAvatar name={name} username={username} profilePicture={profilePicture} />
                    <span className="mentor-status" />
                  </div>

                  <h3 className="mentor-name">{name || username}</h3>

                  <p className="mentor-bio">
                    {mentor.bio && typeof mentor.bio === 'string' && mentor.bio.trim() !== ''
                      ? mentor.bio.length > 100
                        ? `${mentor.bio.substring(0, 100)}...`
                        : mentor.bio
                      : 'No bio available'}
                  </p>

                  <div className="mentor-card-rating">
                    <InlineStars rating={rating} reviewsCount={reviewsCount} />
                  </div>

                  {(title || company) && (
                    <p className="mentor-title">
                      {title || 'Mentor'}{company ? ` • ${company}` : ''}
                    </p>
                  )}

                  {Array.isArray(specialties) && specialties.length > 0 && (
                    <div className="mentor-specialties">
                      {specialties.slice(0, 3).map((s, i) => (
                        <span key={i} className="specialty-tag">{s}</span>
                      ))}
                    </div>
                  )}

                  {Array.isArray(badges) && badges.length > 0 && (
                    <div className="mentor-badges">
                      {badges.slice(0, 4).map((b, i) => (
                        <span className="mentor-badge" key={i}>{b}</span>
                      ))}
                    </div>
                  )}

                  {Array.isArray(tags) && tags.length > 0 && (
                    <div className="mentor-tags">
                      {tags.slice(0, 3).map((t, i) => (
                        <span className="mentor-tag" key={i}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="mentor-actions">
                    <button onClick={e => startChatWithMentor(e, mentor)} className="chat-button">
                      Ask About My Plan
                    </button>
                    {hasScheduling && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={e => handleScheduleClick(e, username)}
                      >
                        Book 1:1 Session
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