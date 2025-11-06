// src/pages/MentorListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import MentorRating from './MentorRating'; // ✅ ADD THIS IMPORT
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
      
      const url = query
        ? `${API_URL}/api/search/mentors?q=${encodeURIComponent(query)}`
        : `${API_URL}/api/users/mentors`;
      
      console.log('Fetching from URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Data could not be fetched!');
      }
      const data = await response.json();
      
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
            console.log('Processing mentor:', mentor);
            console.log('Mentor bio:', mentor?.bio);
            
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

                  {/* ✅ ADD RATING HERE - Below bio */}
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
