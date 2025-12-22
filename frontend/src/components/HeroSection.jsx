// src/components/HeroSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './HeroSection.css';

export default function HeroSection() {
  const [problem, setProblem] = useState('');
  const [counters, setCounters] = useState({
    students: 0,
    mentors: 0,
    support: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const statsRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Counter animation
  const animateCounter = (start, end, duration, key) => {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
    }, 16);
  };

  // Trigger animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animateCounter(0, 1000, 2000, 'students');
          animateCounter(0, 80, 1800, 'mentors');
          animateCounter(0, 24, 1500, 'support');
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // ✅ Fetch AI-generated question suggestions
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
            "How to build a resume for placements?",
            "Interview preparation roadmap?",
            "DSA practice strategy for beginners",
            "Web Development career path",
            "Data Science learning steps",
            "React vs Angular - what to learn?",
            "Side project ideas for portfolio",
            "Mock interview practice resources",
            "GATE vs private job guidance",
            "Startup idea validation tips"
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch AI suggestions:', error);
        // Fallback questions
        setSuggestedQuestions([
          "How to build a resume for placements?",
          "Interview preparation roadmap?",
          "DSA practice strategy for beginners",
          "Web Development career path",
          "Data Science learning steps",
          "React vs Angular - what to learn?",
          "Side project ideas for portfolio",
          "Mock interview practice resources",
          "GATE vs private job guidance",
          "Startup idea validation tips"
        ]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchAISuggestions();
  }, [user]);

  const problems = [
    'Resume not getting shortlisted',
    'Off-campus vs on-campus confusion',
    'What projects actually matter',
    'How to get referrals',
    'Is CGPA important?',
  ];

            <div className="hero-helper" style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="ask-input"
                  placeholder="Describe your placement / internship problem in one line…"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  required
                  style={{ paddingBottom: isFocused && !problem && user ? '200px' : '12px' }}
                />
            </div>
  const handleSelect = (p) => setProblem(p);

  const handleSuggestionClick = (suggestion) => {
    setProblem(suggestion);
    setIsFocused(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    // Check if user is logged in
    if (!user?.token) {
      // Store the question in localStorage and redirect to login
      localStorage.setItem('pendingQuestion', problem);
      navigate('/login');
      return;
    }

    // Submit question directly to Atyant Engine
    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/engine/submit-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ questionText: problem })
      });
      const data = await response.json();
      
      if (data.success) {
        // Navigate directly to engine view
        navigate(`/engine/${data.questionId}`);
      } else {
        console.error('Engine error:', data.error);
        alert('Failed to submit question. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit question:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Get unstuck in{' '}
          <span className="highlight">placements and internships</span>
        </h1>

        <p className="hero-subtitle">
          Talk to seniors from your branch / background who{" "}
          cracked the same company you’re targeting.
          <span className="subtitle-highlight"></span>
        </p>

        <div className="problem-categories">
          {problems.map((p) => (
            <button
              key={p}
              type="button"
              className={`problem-pill ${problem === p ? 'active' : ''}`}
              onClick={() => handleSelect(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', margin: '32px 0 0 0', display: 'flex', justifyContent: 'center' }}>
          <div className="ask-box" style={{ width: '100%', maxWidth: 600, background: 'rgba(255,255,255,0.10)', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.18)', padding: 0, position: 'relative' }}>
            <input
              type="text"
              className="ask-input"
              placeholder="Describe your placement / internship problem in one line..."
              value={problem}
              onChange={e => setProblem(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              maxLength={500}
              required
              style={{
                minHeight: 48,
                border: 'none',
                outline: 'none',
                fontSize: '1.08rem',
                padding: '0 20px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.96)',
                color: '#22223b',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              className="ask-button"
              disabled={submitting}
              style={{
                padding: '12px 32px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(90deg,#4f8cff 40%,#39e7fa 98%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.08rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(57,231,250,0.18)',
                transition: 'transform 0.18s, box-shadow 0.2s, background 0.2s',
              }}
            >
              {submitting ? 'Submitting...' : 'Get my answer'}
            </button>
            {/* AI-POWERED SUGGESTIONS DROPDOWN */}
            {isFocused && !problem && user && (
              <div 
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.98)',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 10
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px', fontWeight: 600 }}>
                  {loadingSuggestions ? '🔄 Loading AI suggestions...' : '🤖 AI-suggested questions for you:'}
                </div>
                {loadingSuggestions ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      margin: '0 auto',
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid #6366f1',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : (
                  suggestedQuestions.slice(0, 5).map((sq, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => handleSuggestionClick(sq)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#f9f9f9',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: '#333',
                        border: '1px solid #e5e5e5',
                        transition: 'all 0.2s ease'
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
        </form>

        {/* ⭐ Stats Section ⭐ */}
        <div className="stats-container" ref={statsRef}>
          <div className="stat-item">
            <span className="stat-number">
              {counters.students.toLocaleString()}+
            </span>
            <span className="stat-label">Students Helped</span>
          </div>

          <div className="stat-item">
            <span className="stat-number">
              {counters.mentors}+
            </span>
            <span className="stat-label">Verified Mentors</span>
          </div>

          <div className="stat-item">
            <span className="stat-number">
              {counters.support}/7
            </span>
            <span className="stat-label">Support</span>
          </div>
        </div>

      </div>
    </section>
  );
}
