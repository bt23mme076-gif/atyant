// src/components/HeroSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

export default function HeroSection() {
  const [problem, setProblem] = useState('');
  const [counters, setCounters] = useState({
    students: 0,
    mentors: 0,
    support: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);
  const navigate = useNavigate();

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
          setHasAnimated(true);
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

  const problems = [
    'Resume not getting shortlisted',
    'Off-campus vs on-campus confusion',
    'What projects actually matter',
    'How to get referrals',
    'Is CGPA important?',
  ];

  const handleSelect = (p) => setProblem(p);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    // Navigate to ask page with the problem as query parameter
    navigate(`/ask?q=${encodeURIComponent(problem)}`);
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
        <span className="subtitle-highlight">
           
          </span>
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

        <p className="hero-helper-text">
          You’ll be matched with a senior who already cracked your target company.
        </p>

        <form className="ask-box-container" onSubmit={handleSubmit}>
          <div className="ask-box">
            <input
              type="text"
              className="ask-input"
              placeholder="Describe your placement / internship problem in one line…"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
            />
            <button type="submit" className="ask-button">
              Get my answer
            </button>
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
