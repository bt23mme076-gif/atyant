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
        ? `${API_URL}/api/search/mentors?q=${query}`
        : `${API_URL}/api/mentors`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Data could not be fetched!');
      }
      const data = await response.json();
      setMentors(data);
    } catch (err) {
      setError('Could not load mentors. Please try again later.');
      console.error('Failed to fetch mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors(); // Fetch all mentors initially
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors(searchTerm);
  };

  const startChatWithMentor = (mentor) => {
    navigate('/chat', {
      state: {
        selectedContact: mentor
      }
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
          {mentors.map((mentor) => (
            <div className="mentor-card" key={mentor._id}>
              {mentor.profilePicture ? (
                <img
                  src={mentor.profilePicture}
                  alt={mentor.username}
                  className="mentor-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-profile-image.jpg';
                  }}
                />
              ) : (
                <div className="mentor-image-placeholder"></div>
              )}
              <h3 className="mentor-name">
                <Link to={`/profile/${mentor.username}`}>{mentor.username}</Link>
              </h3>
              <p className="mentor-interest">Expert Mentor</p>
              <button
                onClick={() => startChatWithMentor(mentor)}
                className="chat-button"
              >
                Start Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorListPage;