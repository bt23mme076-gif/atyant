// src/components/AboutUs.jsx

import React from 'react';
import './AboutUs.css'; // Iski CSS file abhi banayenge
const aboutImage = 'https://res.cloudinary.com/dny6dtmox/image/upload/v1762945548/about-us-image_ppsptx.jpg';

const AboutUs = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-image">
          <img src={aboutImage} alt="Team discussing ideas" />
        </div>
        <div className="about-content">
          <h2>Who We Are</h2>
          <p>
            At Atyant, we’re building a space where students don’t have to struggle alone. We connect you with people who have already faced the same challenges and found solutions—so you can move forward faster. Our mission is simple: make knowledge sharing easy, practical, and accessible for every student
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
