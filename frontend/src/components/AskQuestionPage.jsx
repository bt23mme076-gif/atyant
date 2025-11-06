// src/pages/AskQuestionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AskQuestionPage.css';
import './MentorListPage.css'; // Reuse mentor card styles
import MentorRating from './MentorRating'; // ✅ ADD THIS IMPORT

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

  const startChatWithMentor = (mentor) => {
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
              <div className="mentor-card" key={mentor._id}>
                <img src={mentor.profilePicture || `https://api.pravatar.cc/150?u=${mentor._id}`} alt={mentor.username} className="mentor-image" />
                <h3 className="mentor-name">{mentor.username}</h3>
                <p className="mentor-interest">Mentor</p>
                
                {/* ✅ ADD RATING COMPONENT HERE */}
                <MentorRating mentorId={mentor._id} showDetails={false} />
                
                <button className="chat-now-btn" onClick={() => startChatWithMentor(mentor)}>Chat Now</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No mentors found</h3>
            <p>Try asking a different question or be more specific</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskQuestionPage;