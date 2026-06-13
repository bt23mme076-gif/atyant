// src/pages/AskQuestionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AskQuestionPage.css';
import './MentorListPage.css';
import { API_URL } from '../services/api.js';

const AskQuestionPage = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [engineResult, setEngineResult] = useState(null);
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
    // ✅ FIX: e may be a synthetic event (onClick) or undefined — guard both
    if (e && e.preventDefault) e.preventDefault();
    if (!question.trim()) return;

    localStorage.setItem('draftQuestion', question);
    navigate('/ask');
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

      {/* ✅ FIX: Removed onSubmit — using button onClick to avoid HTML form tag */}
      <div className="ask-question-form">
        <div className="textarea-wrapper">
          <textarea
            placeholder="Type your question here or select from AI suggestions below..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            maxLength={500}
            // ✅ FIX: CSS owns padding-bottom — no inline style override
            // ✅ FIX: enterKeyHint shows a styled "Send" key on mobile keyboards
            enterKeyHint="send"
            // ✅ FIX: inputMode="text" ensures correct keyboard on Android (not numeric)
            inputMode="text"
            // ✅ FIX: autoComplete off prevents iOS suggestion bar from pushing layout
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck="true"
          />
          <span className="char-counter">{question.length}/500</span>
        </div>

        {/* ✅ FIX: Replaced all inline styles with CSS classes */}
        {isFocused && !question && (
          <div className="suggestions-dropdown">
            <div className="suggestions-label">
              {loadingSuggestions
                ? '🔄 Generating personalized questions...'
                : '🤖 AI Suggestions based on available mentors:'}
            </div>

            {loadingSuggestions ? (
              <div className="suggestions-spinner">
                {/* ✅ FIX: Uses `spin` keyframe now defined in CSS */}
                <div
                  className="spinner"
                  style={{
                    width: 20,
                    height: 20,
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              </div>
            ) : (
              suggestedQuestions.map((sq, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  // ✅ FIX: onMouseDown fires before onBlur, preserving click registration
                  onMouseDown={() => handleSuggestionClick(sq)}
                  // ✅ FIX: onTouchEnd handles tap on mobile (onMouseDown doesn't fire reliably)
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(sq);
                  }}
                >
                  {sq}
                </div>
              ))
            )}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleFindMentors}
        >
          {loading ? 'Submitting to Atyant Engine...' : 'Get Your Answer 🚀'}
        </button>
      </div>
    </div>
  );
};

export default AskQuestionPage;