// src/components/AboutUs.jsx

import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-image">
          <img 
            src="https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto,w_600/about_team.jpg" 
            alt="Atyant Team"
            onError={(e) => {
              console.log("Image load failed, using fallback");
              e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80";
            }}
          />
        </div>
        
        <div className="about-content">
          <h2 className="about-title">Who We Are</h2>
          
          <p className="about-tagline">
            Not another mentorship platform. <span className="highlight">A personal guidance engine.</span>
          </p>
          
          <div className="about-points">
            <div className="about-point">
              <span className="point-icon">🎯</span>
              <div>
                <strong>The Problem We Solve</strong>
                <p>Students don't lack effort — they lack clear, situation-specific direction.</p>
              </div>
            </div>
            
            <div className="about-point">
              <span className="point-icon">🧠</span>
              <div>
                <strong>How We're Different</strong>
                <p>Our AI understands your background, college, branch, goals & constraints.</p>
              </div>
            </div>
            
            <div className="about-point">
              <span className="point-icon">🤝</span>
              <div>
                <strong>Real Paths, Real People</strong>
                <p>We connect you with seniors who solved the exact same challenge.</p>
              </div>
            </div>
            
            <div className="about-point">
              <span className="point-icon">⚡</span>
              <div>
                <strong>Our Promise</strong>
                <p>No theories. No motivational noise. Just clarity, confidence & speed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
