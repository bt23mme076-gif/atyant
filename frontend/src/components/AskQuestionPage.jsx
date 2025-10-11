// src/pages/AskQuestionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AskQuestionPage.css';
import './MentorListPage.css'; // Reuse mentor card styles

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
      console.error('Failed to find Problem Solver:', error);
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
      <p>Describe your problem, and we'll suggest Problem Solver who have solved similar issues.</p>

      <form className="ask-question-form" onSubmit={handleFindMentors}>
        <textarea
          placeholder="e.g., 'I am confused about choosing between GATE and a private job after my B.E...'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows="6"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Finding Problem Solver..' : 'Find a Problem Solver'}
        </button>
      </form>

      {hasSearched && (
        <div className="results-section">
          <h2>Suggested Problem Solver</h2>
          {loading ? (
            <div className="status-message">Loading...</div>
          ) : (
            <div className="mentor-grid">
              {suggestedMentors.length > 0 ? (
                suggestedMentors.map((mentor) => (
                  <div className="mentor-card" key={mentor._id}>
                    <img src={mentor.profilePicture || `https://api.pravatar.cc/150?u=${mentor._id}`} alt={mentor.username} className="mentor-image" />
                    <h3 className="mentor-name">{mentor.username}</h3>
                    <p className="mentor-interest">Problem Solver</p>
                    <button onClick={() => startChatWithMentor(mentor)}>Chat Now</button>
                  </div>
                ))
              ) : (
                <p className="no-mentors-found">No Problem Solver found with this expertise. Try rephrasing your question.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AskQuestionPage;