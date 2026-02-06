// src/components/HeroSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './HeroSection.css';
import LoadingSpinner from './LoadingSpinner';

const HeroSection = () => {
  const [problem, setProblem] = useState('');
  const [counters, setCounters] = useState({ students: 0, mentors: 0, support: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const statsRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const rotatingQuestions = [
   'Why am I not getting interview calls?',
   'How did seniors from my branch crack this role?',
   'What should I build in 2–3 months to get shortlisted?',
   'Why am I getting rejected after interviews?',
   'What exactly do recruiters notice in resumes like mine?',
  ];

  const fallbackQuestions = [
    "How to build a resume for placements?",
    "Interview preparation roadmap?",
    "DSA practice strategy for beginners",
    "Web Development career path",
    "Data Science learning steps",
  ];

  // Typewriter effect
  useEffect(() => {
    const currentText = rotatingQuestions[currentQuestion];
    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex <= currentText.length) {
        setDisplayText(currentText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        setTimeout(() => {
          setCurrentQuestion((prev) => (prev + 1) % rotatingQuestions.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentQuestion]);

  // Counter animation
  const animateCounter = (start, end, duration, key) => {
    const increment = (end - start) / (duration / 16);
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
          setHasAnimated(true);
          animateCounter(0, 500, 2000, 'students');
          animateCounter(0, 100, 1800, 'mentors');
          animateCounter(0, 24, 1500, 'support');
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Fetch AI suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user?.token) {
        setLoadingSuggestions(false);
        return;
      }
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/ask/generate-suggestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        setSuggestedQuestions(data.ok && Array.isArray(data.suggestions) ? data.suggestions : fallbackQuestions);
      } catch {
        setSuggestedQuestions(fallbackQuestions);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [user]);

  const sendQuestion = async () => {
    setSubmitting(true);
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Check profile completion before redirecting
      const profileRes = await fetch(`${API_URL}/api/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!profileRes.ok) {
        alert('Failed to verify profile. Please try again.');
        return;
      }
      
      const profileData = await profileRes.json();
      console.log('📋 Profile Data:', profileData);

      const hasUsername = !!profileData.username;
      const hasBio = !!profileData.bio;
      const hasEducation = profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0;
      const isProfileComplete = hasUsername && hasBio && hasEducation;

      console.log('✅ Profile Complete:', isProfileComplete);

      if (!isProfileComplete) {
        const missingFields = [];
        if (!hasUsername) missingFields.push('Username');
        if (!hasBio) missingFields.push('Bio');
        if (!hasEducation) missingFields.push('Education');
        alert(`Please complete your profile first. Missing: ${missingFields.join(', ')}`);
        localStorage.setItem('pendingQuestion', problem);
        navigate('/profile');
        return;
      }

      // Store question and redirect to enhanced ask page
      localStorage.setItem('draftQuestion', problem);
      navigate('/ask');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problem.trim()) return;
    if (!user?.token) {
      localStorage.setItem('pendingQuestion', problem);
      navigate('/login');
      return;
    }
    setShowConfirmPrompt(true);
  };

  const handleQuestionClick = () => {
    setProblem(rotatingQuestions[currentQuestion]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <section className="hero-section" id="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Ask once. Get guidance{' '}
          <span className="highlight">from seniors who already cracked it.</span>
        </h1>

        <p className="hero-subtitle">
          Atyant is an AI-powered personal guidance engine that matches your problem 
          with seniors who've already solved it and shows you exactly how they did it.
        </p>

        {/* Typewriter Rotating Questions */}
        <div className="rotating-questions" onClick={handleQuestionClick}>
          <span className="rotating-label">💬 Students ask</span>
          <div className="question-rotator">
            <span className="rotating-text">
              {displayText}
              <span className={`cursor ${isTyping ? 'typing' : ''}`}>|</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ask-form">
          <div className="ask-box" ref={suggestionsRef}>
            <div className="input-wrapper">
              <input
                type="text"
                className="ask-input"
                placeholder="Ask your exact problem (AI finds the right seniors for you)"
                value={problem}
                onChange={e => setProblem(e.target.value)}
                onFocus={() => !problem && user && setShowSuggestions(true)}
                maxLength={500}
                required
              />
              
              {/* AI Hint - Inside input */}
              {user && !problem && (
                <div 
                  className="ai-hint-button"
                  onClick={() => setShowSuggestions(true)}
                  title="Click for AI suggestions"
                >
                  <span className="ai-hint-icon">✨</span>
                </div>
              )}
            </div>
            
            <button type="submit" className="ask-button" disabled={submitting}>
              {submitting ? '...' : 'Get my answer'}
            </button>

            {/* AI Suggestions Dropdown */}
            {showSuggestions && !problem && user && (
              <div className="ai-suggestions-dropdown">
                <div className="ai-suggestions-title">
                  {loadingSuggestions ? '🔄 Loading...' : '🤖 AI-suggested questions:'}
                </div>
                {loadingSuggestions ? (
                  <div className="ai-suggestion-loader">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  suggestedQuestions.slice(0, 5).map((sq, idx) => (
                    <div
                      key={idx}
                      className="ai-suggestion-item"
                      onClick={() => {
                        setProblem(sq);
                        setShowSuggestions(false);
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

        {/* Confirmation Modal - Outside form */}
        {showConfirmPrompt && (
          <div className="hero-confirm-overlay" role="dialog" aria-modal="true" onClick={() => setShowConfirmPrompt(false)}>
            <div className="hero-confirm-card" onClick={(e) => e.stopPropagation()}>
              <p className="hero-confirm-label">Ready to get your answer?</p>
              <h3>Let's find the perfect mentor for you</h3>
              <p className="hero-confirm-body">We'll match your question with experienced mentors and guide you through a personalized answer flow.</p>
              <div className="hero-confirm-actions">
                <button type="button" className="hero-confirm-edit" onClick={() => setShowConfirmPrompt(false)}>
                  Edit question
                </button>
                <button
                  type="button"
                  className="hero-confirm-send"
                  onClick={() => {
                    setShowConfirmPrompt(false);
                    sendQuestion();
                  }}
                >
                  Continue to submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="stats-container" ref={statsRef}>
          <div className="stat-item">
            <span className="stat-number">{counters.students.toLocaleString()}+</span>
            <span className="stat-label">Students Helped</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{counters.mentors}+</span>
            <span className="stat-label">Verified Mentors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{counters.support}/7</span>
            <span className="stat-label">Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
