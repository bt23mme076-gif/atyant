// src/pages/AskQuestionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AskQuestionPage.css';
import './MentorListPage.css';

const AskQuestionPage = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [engineResult, setEngineResult] = useState(null); // ✅ NEW: Engine result
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Check for query parameter and set question text
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setQuestion(queryFromUrl);
    }
  }, [searchParams]);

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
      const response = await fetch(`${API_URL}/api/engine/submit-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ questionText: question })
      });
      const data = await response.json();
      
      if (data.success) {
        setEngineResult(data);
        // Navigate to engine view
        navigate(`/engine/${data.questionId}`);
      } else {
        console.error('Engine error:', data.error);
      }
    } catch (error) {
      console.error('Failed to submit question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Legacy function - kept for compatibility but not used
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
            style={{ paddingBottom: '50px' }}
          />
          <span className="char-counter">{question.length}/500</span>
        </div>

        {/* ✅ AI-POWERED SUGGESTIONS BELOW TEXTAREA */}
        {isFocused && !question && (
          <div 
            style={{
              marginTop: '8px',
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

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting to Atyant Engine...' : 'Get Your Answer 🚀'}
        </button>
      </form>

      {/* ✅ REMOVED: Mentor cards display - users no longer see mentors */}
      {/* Engine processes question and shows Answer Card instead */}
    </div>
  );
};

export default AskQuestionPage;