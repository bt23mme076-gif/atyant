// src/components/HeroSection.jsx (Simplified Code)
import React from 'react';
// Humne 'Typed' ko yahan se hata diya hai
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Your Journey from Confused to Confident Starts Here</h1>
        <h2 className="hero-subtitle">
          Connect with verified achievers who have successfully navigated the exact challenges you're facing today
        </h2>
        
        <div className="button-group">
          {/* We'll use React Router's Link component for navigation */}
          <a href="/Signup" className="btn-mentor">Become a Mentor</a>
          <a href="/chat" className="btn-ask">Ask Your Question Now</a>
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">1,000+</div>
            <div className="stat-label">Students Helped</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Verified Mentors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;