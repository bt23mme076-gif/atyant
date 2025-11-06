// src/pages/AskQuestionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AskQuestionPage.css';
import './MentorListPage.css'; // Reuse mentor card styles
import MentorRating from './MentorRating';

const AskQuestionPage = () => {
  const [question, setQuestion] = useState('');
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFindMentors = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/ask/suggest-mentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setSuggestedMentors(data);
    } catch (error) {
      console.error('Failed to find Mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to mentor profile
  const handleMentorCardClick = (username) => {
    // Play click sound (optional)
    const audio = new Audio('/click-sound.mp3');
    audio.play().catch(() => {});
    
    // Navigate to profile
    navigate(`/profile/${username}`);
  };

  // ✅ Prevent card click when clicking chat button
  const startChatWithMentor = (e, mentor) => {
    e.stopPropagation(); // Prevent card click
    navigate('/chat', { state: { selectedContact: mentor } });
  };

  return (
    <div className="ask-question-container">
      <h1>Ask Your Question</h1>
      <p>Describe your problem, and we'll suggest Mentors who have solved similar issues.</p>
      <form className="ask-question-form" onSubmit={handleFindMentors}>
        <div className="textarea-wrapper">
          <textarea
            placeholder="e.g., 'I am confused about choosing between GATE and a private job after my Engineering degree...'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
          />
          <span className="char-counter">{question.length}/500</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Finding Perfect Mentors...' : 'Find My Mentor 🚀'}
        </button>
      </form>

      <div className="results-section">
        <h2>Recommended Mentors</h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : suggestedMentors.length > 0 ? (
          <div className="mentor-cards-grid">
            {suggestedMentors.map((mentor) => (
              <div 
                className="mentor-card clickable-card" 
                key={mentor._id}
                onClick={() => handleMentorCardClick(mentor.username)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleMentorCardClick(mentor.username);
                  }
                }}
                title={`Click to view ${mentor.username}'s profile`}
                style={{ cursor: 'pointer' }}
              >
                {/* ✅ View Profile Indicator */}
                <div className="click-indicator">
                  <span>👁️ View Profile</span>
                </div>
                
                {/* Avatar */}
                <img 
                  src={mentor.profilePicture || `https://api.pravatar.cc/150?u=${mentor._id}`} 
                  alt={mentor.username} 
                  className="mentor-image" 
                />
                
                {/* Name */}
                <h3 className="mentor-name">{mentor.username}</h3>
                
                {/* Role */}
                <p className="mentor-interest">Mentor</p>
                
                {/* ✅ BIO - Moved inside JSX */}
                <p className="mentor-bio">
                  {mentor.bio && typeof mentor.bio === 'string' && mentor.bio.trim() !== ''
                    ? (mentor.bio.length > 100
                       ? `${mentor.bio.substring(0, 100)}...`
                       : mentor.bio)
                    : "No bio available"
                  }
                </p>
                
                {/* Rating */}
                <div className="mentor-card-rating">
                  <MentorRating mentorId={mentor._id} showDetails={false} />
                </div>
                
                {/* Chat Button */}
                <button 
                  className="chat-now-btn" 
                  onClick={(e) => startChatWithMentor(e, mentor)}
                >
                  Chat Now 💬
                </button>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No mentors found</h3>
            <p>Try asking a different question or be more specific</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AskQuestionPage;