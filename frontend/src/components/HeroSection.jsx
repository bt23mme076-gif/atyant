// src/components/HeroSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const [counters, setCounters] = useState({
    students: 0,
    mentors: 0,
    support: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  // Animated Counter Function
  const animateCounter = (start, end, duration, key) => {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
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

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Start animations
          animateCounter(0, 1000, 2000, 'students');
          animateCounter(0, 50, 1800, 'mentors');
          animateCounter(0, 24, 1500, 'support');
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Your Journey from <span className="highlight"> Confused to Confident </span> Start Here
        </h1>
        <p className="hero-subtitle">
          No guesswork. Just experienced real answers from people who faced the same problem in the same situation.
        </p>

        <div className="hero-rotator">
          Your gateway to answers in{' '}
          <TypeAnimation
            sequence={[
              'Engineering Admissions', 1500,
              'Internships', 1500,
              'College Life', 1500,
              'Competitive Exams', 1500,
              'Career Growth', 1500,
              'Placements', 1500,
            ]}
            wrapper="span"
            speed={50}
            className="typed-text"
            repeat={Infinity}
          />
        </div>

        <div className="button-group">
          <Link to="/ask" className="hero-button primary">Ask Your Question</Link>
        </div>

        {/* Animated Stats Section */}
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
};

export default HeroSection;