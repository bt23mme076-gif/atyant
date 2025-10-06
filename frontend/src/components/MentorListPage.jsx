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
      const url = query
        ? `${API_URL}/api/search/mentors?q=${encodeURIComponent(query)}`
        : `${API_URL}/api/mentors`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Data could not be fetched!');
      }
      const data = await response.json();
      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load mentors. Please try again later.');
      console.error('Failed to fetch mentors:', err);
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
      <p>Search for a mentor by name or skill to start a conversation.</p>

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
              No mentors found. Try a different search.
            </div>
          )}

          {mentors.map((mentor) => {
            const {
              _id,
              username,
              profilePicture,
              title,           // optional: job title
              company,         // optional: org
              rating,          // optional: number
              reviewsCount,    // optional: number
              tags,            // optional: array of strings
              badges,          // optional: array of strings/short labels
              hasScheduling    // optional: boolean
            } = mentor || {};

            return (
              <div className="mentor-card" key={_id}>
                <div className="mentor-card-content">
                  <div className="mentor-image-container">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={username}
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
                    <Link to={`/profile/${username}`}>{username}</Link>
                  </h3>

                  {title || company ? (
                    <p className="mentor-title">
                      {title ? title : 'Expert Mentor'}
                      {company ? ` • ${company}` : ''}
                    </p>
                  ) : (
                    <p className="mentor-interest">Expert Mentor</p>
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
