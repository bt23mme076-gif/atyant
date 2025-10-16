// src/pages/MentorListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './MentorListPage.css';

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchMentors = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Use the same endpoint as MentorGallery to get consistent data structure
      const url = query
        ? `${API_URL}/api/search/mentors?q=${encodeURIComponent(query)}`
        : `${API_URL}/api/users/mentors`; // Changed from /api/mentors to /api/users/mentors
      
      console.log('Fetching from URL:', url); // Debug log

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Data could not be fetched!');
      }
      const data = await response.json();
      
      // Debug logging
      console.log('API Response:', data);
      if (data && data.length > 0) {
        console.log('First mentor structure:', data[0]);
        console.log('First mentor bio field:', data[0].bio);
        console.log('All mentor fields:', Object.keys(data[0]));
      }
      
      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load Mentors. Please try again later.');
      console.error('Failed to fetch Mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors(searchTerm.trim());
  };

  const startChatWithMentor = (mentor) => {
    navigate('/chat', {
      state: { selectedContact: mentor }
    });
  };

  return (
    <div className="mentor-list-container">
      <h1>Meet Our Mentors</h1>
      <p>Search for a Mentor by name or skill to start a conversation.</p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g., 'Java', 'Placements', 'Career Growth'..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

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
            // Debug logging for each mentor
            console.log('Processing mentor:', mentor);
            console.log('Mentor bio:', mentor?.bio);
            
            if (!mentor) {
              return null;
            }

            const {
              _id,
              username,
              name, // Add name field which might be different from username
              profilePicture,
              title,
              company,
              rating,
              reviewsCount,
              tags,
              specialties, // Add specialties field from MentorGallery
              badges,
              hasScheduling,
              bio
            } = mentor;

            return (
              <div className="mentor-card" key={_id || username}>
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
                      />
                    ) : (
                      <div className="mentor-image-placeholder" />
                    )}
                    <span className="mentor-status" />
                  </div>

                  <h3 className="mentor-name">
                    <Link to={`/profile/${username}`}>
                      {name || username}
                    </Link>
                  </h3>

                  {/* Bio section - same logic as MentorGallery */}
                  <p className="mentor-bio">
                    {mentor.bio && typeof mentor.bio === 'string' && mentor.bio.trim() !== ''
                      ? (mentor.bio.length > 100
                         ? `${mentor.bio.substring(0, 100)}...`
                         : mentor.bio)
                      : "No bio available"
                    }
                  </p>

                  {(title || company) && (
                    <p className="mentor-title">
                      {title ? title : 'Mentor'}
                      {company ? ` • ${company}` : ''}
                    </p>
                  )}

                  {/* Display specialties if available (from MentorGallery structure) */}
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
                      onClick={() => startChatWithMentor(mentor)}
                      className="chat-button"
                    >
                      Start Chat
                    </button>
                    {hasScheduling && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(`/profile/${username}#schedule`)}
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
