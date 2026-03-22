// src/components/Home.jsx - REVAMPED WITH PREMIUM DARK DESIGN
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Brain,
  Target,
  Lightbulb,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import SEO from './SEO';
import LoadingSpinner from './LoadingSpinner';
import ReviewsSlider from './ReviewsSlider';
import FeedbackForm from './FeedbackForm';
import { API_URL } from '../services/api.js';
import './Home.css';

const Home = () => {
  const [problem, setProblem] = useState('');
  const [counters, setCounters] = useState({ students: 0, mentors: 0, colleges: 0 });
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
    'How can I get an IIM internship?',
    'How can I get an IIT internship?',
    'How did seniors from my branch crack Google or Amazon?',
    'What projects help get internship shortlists?',
    'Why am I getting rejected in placements?'
  ];

  const fallbackQuestions = [
    "Placement roadmap from 1st–4th year",
    "Resume tips for top companies",
    "How to crack Google from my branch?",
    "How to crack Amazon placements?",
    "How to get shortlisted for internships?"
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
          animateCounter(0, 184, 2000, 'students');
          animateCounter(0, 40, 1800, 'mentors');
          animateCounter(0, 11, 1500, 'colleges');
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
      const profileRes = await fetch(`${API_URL}/api/profile/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (!profileRes.ok) {
        alert('Failed to verify profile. Please try again.');
        return;
      }
      
      const profileData = await profileRes.json();
      const hasUsername = !!profileData.username;
      const hasBio = !!profileData.bio;
      const hasEducation = profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0;
      const isProfileComplete = hasUsername && hasBio && hasEducation;

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  const steps = [
    { number: '01', icon: Target, title: 'You Ask', description: 'One question with your college, branch, and goal' },
    { number: '02', icon: Brain, title: 'AI Processes', description: 'Context extracted, meaning understood' },
    { number: '03', icon: Zap, title: 'Smart Match', description: 'Vector search finds exact past solutions OR routes to best mentor' },
    { number: '04', icon: Lightbulb, title: 'AI Structures', description: 'Raw experience → Steps, timeline, mistakes, tips' },
    { number: '05', icon: CheckCircle, title: 'Your AnswerCard', description: 'Personalized, actionable, not generic' }
  ];

  const features = [
    { icon: BookOpen, title: 'Real Experience → Reusable Guidance', description: 'Senior journeys converted into structured AnswerCards. Not opinions. Proven paths.' },
    { icon: Zap, title: 'Instant Answers, Zero Waiting', description: 'If an AnswerCard exists, you get it in under 5 seconds. No chats. No delays.' },
    { icon: Brain, title: 'AI Routing. Human Truth.', description: 'Our AI decides who should answer — not what to answer. Always from real humans.' }
  ];

  return (
    <>
      <SEO 
        title="Atyant - Get Answers From Seniors Who Already Cracked It"
        description="AI-powered mentorship platform matching Indian college students with seniors who've solved their exact problems. Get step-by-step guidance from IIT, NIT, BITS students."
        keywords="college mentorship, senior guidance, IIT mentors, NIT mentors, career guidance, internship help, placement preparation, student mentorship India"
        url="https://www.atyant.in/"
      />
      
      <div className="premium-home">
        {/* HERO SECTION */}
        <section className="premium-hero">
          <div className="premium-hero-bg-glow" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="premium-hero-content"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="premium-badge"
            >
              <Sparkles size={16} />
              AI-Powered Guidance for College Students
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="premium-hero-title"
            >
              Get Answers From Seniors<br />
              Who Already <span className="premium-gradient-text">Cracked It.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="premium-hero-subtitle"
            >
              Atyant matches your exact problem with seniors who've solved it — and shows you step-by-step how they did it.
            </motion.p>

            {/* Typewriter Rotating Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="premium-rotating-questions"
              onClick={handleQuestionClick}
            >
              <span className="premium-rotating-label">💬 Students ask</span>
              <div className="premium-question-rotator">
                <span className="premium-rotating-text">
                  {displayText}
                  <span className={`premium-cursor ${isTyping ? 'typing' : ''}`}>|</span>
                </span>
              </div>
            </motion.div>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="premium-ask-form"
            >
              <div className="premium-ask-box" ref={suggestionsRef}>
                <div className="premium-input-wrapper">
                  <input
                    type="text"
                    className="premium-ask-input"
                    placeholder="Ask your exact problem (AI finds the right seniors for you)"
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    onFocus={() => !problem && user && setShowSuggestions(true)}
                    maxLength={500}
                    required
                  />
                  
                  {user && !problem && (
                    <button
                      type="button"
                      className="premium-ai-hint-button"
                      onClick={() => setShowSuggestions(true)}
                      title="Click for AI suggestions"
                    >
                      <Sparkles size={18} />
                    </button>
                  )}
                </div>
                
                <button type="submit" className="premium-ask-button" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Get My Answer'}
                  <ArrowRight size={18} />
                </button>

                {/* AI Suggestions Dropdown */}
                {showSuggestions && !problem && user && (
                  <div className="premium-ai-suggestions-dropdown">
                    <div className="premium-ai-suggestions-title">
                      {loadingSuggestions ? '🔄 Loading...' : '🤖 AI-suggested questions:'}
                    </div>
                    {loadingSuggestions ? (
                      <div className="premium-ai-suggestion-loader">
                        <div className="spinner"></div>
                      </div>
                    ) : (
                      suggestedQuestions.slice(0, 5).map((sq, idx) => (
                        <div
                          key={idx}
                          className="premium-ai-suggestion-item"
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
            </motion.form>

            {/* Trust Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="premium-trust-strip"
            >
              <p className="premium-trust-label">Trusted by students from</p>
              <div className="premium-trust-badges">
                {['IIT', 'NIT', 'BITS', 'MANIT', 'VNIT', 'DTU'].map((college) => (
                  <span key={college} className="premium-trust-badge">{college}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Confirmation Modal */}
        {showConfirmPrompt && (
          <div className="premium-confirm-overlay" onClick={() => setShowConfirmPrompt(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-confirm-card"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="premium-confirm-label">Ready to get your answer?</p>
              <h3 className="premium-confirm-title">Let's find the perfect mentor for you</h3>
              <p className="premium-confirm-body">
                We'll match your question with experienced mentors and guide you through a personalized answer flow.
              </p>
              <div className="premium-confirm-actions">
                <button
                  type="button"
                  className="premium-confirm-edit"
                  onClick={() => setShowConfirmPrompt(false)}
                >
                  Edit question
                </button>
                <button
                  type="button"
                  className="premium-confirm-send"
                  onClick={() => {
                    setShowConfirmPrompt(false);
                    sendQuestion();
                  }}
                >
                  Continue to submit
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* STATS BAR */}
        <section className="premium-stats-bar" ref={statsRef}>
          <div className="premium-stats-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-stat-item"
            >
              <div className="premium-stat-number">{counters.students}+</div>
              <div className="premium-stat-label">Students Helped</div>
            </motion.div>
            <div className="premium-stat-divider" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="premium-stat-item"
            >
              <div className="premium-stat-number">{counters.mentors}+</div>
              <div className="premium-stat-label">Verified Mentors</div>
            </motion.div>
            <div className="premium-stat-divider" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="premium-stat-item"
            >
              <div className="premium-stat-number">{counters.colleges}+</div>
              <div className="premium-stat-label">Colleges Reached</div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="premium-section">
          <div className="premium-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-section-header"
            >
              <span className="premium-section-label">THE PROCESS</span>
              <h2 className="premium-section-title">From Question to Clarity — In Seconds</h2>
            </motion.div>

            <div className="premium-steps-grid">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="premium-step-card"
                  >
                    <div className="premium-step-header">
                      <div className="premium-step-icon">
                        <Icon size={20} />
                      </div>
                      <span className="premium-step-number">STEP {step.number}</span>
                    </div>
                    <h3 className="premium-step-title">{step.title}</h3>
                    <p className="premium-step-description">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHY ATYANT */}
        <section id="why-choose-us" className="premium-section premium-section-alt">
          <div className="premium-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-section-header"
            >
              <span className="premium-section-label">WHY ATYANT</span>
              <h2 className="premium-section-title">Not Just Another Platform</h2>
            </motion.div>

            <div className="premium-features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="premium-feature-card"
                  >
                    <div className="premium-feature-icon">
                      <Icon size={28} />
                    </div>
                    <h3 className="premium-feature-title">{feature.title}</h3>
                    <p className="premium-feature-description">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="premium-section">
          <div className="premium-container">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-section-title premium-text-center"
            >
              What Students Are Saying
            </motion.h2>
          </div>
          <ReviewsSlider />
        </section>

        {/* FEEDBACK FORM */}
        <section id="FeedbackForm" className="premium-section premium-section-alt">
          <FeedbackForm />
        </section>

        {/* CTA SECTION */}
        <section className="premium-cta-section">
          <div className="premium-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-cta-card"
            >
              <h2 className="premium-cta-title">Ready to Stop Guessing?</h2>
              <p className="premium-cta-subtitle">Join 184+ students who are already getting clarity.</p>
              <button
                onClick={() => navigate('/ask')}
                className="premium-cta-button"
              >
                Ask Your First Question
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
