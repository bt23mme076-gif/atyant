// src/components/HeroSection.jsx
import React, { useState, useEffect, useRef } from 'react';
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
          animateCounter(0, 50, 1800, 'mentors');
          animateCounter(0, 24, 1500, 'support');
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="hero-section">
      <div className="hero-content">

        {/* ⭐ Cleaner headline ⭐ */}
        <h1 className="hero-title">
          Talk to Someone <span className="highlight">Who Has Already Solved</span> Your Problem
        </h1>

        <p className="hero-subtitle">
          Practical, real-life solutions from people who've faced the same challenge before you.
        </p>

        {/* ⭐ NEW streamlined CTA box ⭐ */}
        <div className="ask-box" style={{
          width: '60%',
          margin: '25px auto',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            placeholder="What's the problem you're facing right now?"
            style={{
              flex: 1,
              padding: '15px',
              fontSize: '17px',
              borderRadius: '10px',
              border: 'none',
              outline: 'none'
            }}
          />

          <Link
            to="/ask"
            style={{
              padding: '15px 20px',
              borderRadius: '10px',
              background: '#4b82ff',
              color: 'white',
              fontSize: '17px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontWeight: 600
            }}
          >
            Find Mentor →
          </Link>
        </div>

        {/* ⭐ Rotating categories ⭐ */}
        <div className="hero-rotator">
          Your gateway to answers in{' '}
          <TypeAnimation
            sequence={[
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

        {/* ⭐ Removed duplicate CTA BUTTON — avoids confusion ⭐ */}

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
};

export default HeroSection;
