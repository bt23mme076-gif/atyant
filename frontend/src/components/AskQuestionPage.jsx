// src/pages/AskQuestionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AskQuestionPage.css';
import './MentorListPage.css';
import MentorRating from './MentorRating';

const AskQuestionPage = () => {
  const [question, setQuestion] = useState('');
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Check for query parameter and auto-search
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setQuestion(queryFromUrl);
      // Auto-trigger search
      if (user?.token) {
        handleFindMentorsFromUrl(queryFromUrl);
      }
    }
  }, [searchParams, user]);

  const handleFindMentorsFromUrl = async (queryText) => {
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
        body: JSON.stringify({ question: queryText })
      });
      const data = await response.json();
      setSuggestedMentors(data);
    } catch (error) {
      console.error('Failed to find Mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch AI-generated questions on component mount
  useEffect(() => {
    const fetchAISuggestions = async () => {
      if (!user?.token) {
        setLoadingSuggestions(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/ask/generate-suggestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        const data = await response.json();
        
        if (data.ok && Array.isArray(data.suggestions)) {
          setSuggestedQuestions(data.suggestions);
        } else {
          // Fallback to static questions
          setSuggestedQuestions([
            "Placement ke liye resume kaise banayein?",
            "Interview preparation ka roadmap batao",
            "DSA mein strong kaise banu?",
            "Web Development career start karun?",
            "Data Science seekhne ke steps?",
            "React vs Angular — kya seekhun?",
            "Side project ideas for portfolio",
            "Mock interview kahan se practice karun?",
            "GATE ya private job — guidance chahiye",
            "Startup idea validate kaise karun?"
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch AI suggestions:', error);
        // Fallback questions
        setSuggestedQuestions([
          "Placement ke liye resume kaise banayein?",
          "Interview preparation ka roadmap batao",
          "DSA mein strong kaise banu?",
          "Web Development career start karun?",
          "Data Science seekhne ke steps?",
          "React vs Angular — kya seekhun?",
          "Side project ideas for portfolio",
          "Mock interview kahan se practice karun?",
          "GATE ya private job — guidance chahiye",
          "Startup idea validate kaise karun?"
        ]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchAISuggestions();
  }, [user]);

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

  const handleMentorCardClick = (username) => {
    const audio = new Audio('/click-sound.mp3');
    audio.play().catch(() => {});
    navigate(`/profile/${username}`);
  };

  const startChatWithMentor = (e, mentor) => {
    e.stopPropagation();
    navigate('/chat', { state: { selectedContact: mentor } });
  };

  const handleSuggestionClick = (suggestedQuestion) => {
    setQuestion(suggestedQuestion);
    setIsFocused(false);
  };

  return (
    <div className="ask-question-container">
      <h1>Ask Your Question</h1>
      <p>Describe your problem, and we'll suggest Mentors who have solved similar issues.</p>

      <form className="ask-question-form" onSubmit={handleFindMentors}>
        <div className="textarea-wrapper" style={{ position: 'relative' }}>
          <textarea
            placeholder="Type your question here or select from AI suggestions below..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            maxLength={500}
            style={{ paddingBottom: isFocused && !question ? '180px' : '50px' }}
          />
          <span className="char-counter">{question.length}/500</span>

          {/* ✅ AI-POWERED SUGGESTIONS INSIDE TEXTAREA */}
          {isFocused && !question && (
            <div 
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '12px',
                right: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '8px',
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4, fontWeight: 600 }}>
                {loadingSuggestions ? '🔄 Generating personalized questions...' : '🤖 AI Suggestions based on available mentors:'}
              </div>
              
              {loadingSuggestions ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
                  <div className="spinner" style={{ 
                    width: 20, 
                    height: 20, 
                    margin: '0 auto',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : (
                suggestedQuestions.map((sq, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => handleSuggestionClick(sq)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: '#f9f9f9',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#333',
                      border: '1px solid #e5e5e5',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#6366f1';
                      e.target.style.color = '#fff';
                      e.target.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f9f9f9';
                      e.target.style.color = '#333';
                      e.target.style.borderColor = '#e5e5e5';
                    }}
                  >
                    {sq}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Finding Perfect Mentors...' : 'Find My Mentor 🚀'}
        </button>
      </form>

      <div className="results-section">
        <h2>Recommended Mentors</h2>
        
        {loading ? (
          <div className="mentor-cards-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mentor-card skeleton-card">
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            ))}
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
                title={`Click to view ${mentor.username}'s profile`}
                style={{ cursor: 'pointer' }}
              >
                <div className="click-indicator">
                  <span>👁️ View Profile</span>
                </div>
                
                <img 
                  src={mentor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent((mentor.username || mentor.name || 'M').split(' ')[0])}&background=6366f1&color=fff&size=150&length=1`} 
                  alt={mentor.username} 
                  className="mentor-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    const firstName = (mentor.username || mentor.name || 'M').split(' ')[0];
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=150&length=1`;
                  }}
                />
                
                <h3 className="mentor-name">{mentor.username}</h3>
                <p className="mentor-interest">Mentor</p>
                
                <p className="mentor-bio">
                  {mentor.bio && typeof mentor.bio === 'string' && mentor.bio.trim() !== ''
                    ? (mentor.bio.length > 100
                       ? `${mentor.bio.substring(0, 100)}...`
                       : mentor.bio)
                    : "No bio available"
                  }
                </p>
                
                <div className="mentor-card-rating">
                  <MentorRating mentorId={mentor._id} showDetails={false} />
                </div>
                
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