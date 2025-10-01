// src/components/HeroSection.jsx
import React from 'react';
import SearchBar from './SearchBar'; // Import the new component
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Your Journey from <span className="highlight">Confused to Confident</span> Starts Here
        </h1>
        <p className="hero-subtitle">
          Connect with verified achievers who have successfully navigated the exact challenges you're facing today.
        </p>
 {/* 2. Add the SearchBar component here */}
        <SearchBar />
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

        

        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">1,000+</span>
            <span className="stat-label">Students Helped</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Verified Mentors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;