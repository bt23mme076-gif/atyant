// src/components/AboutUs.jsx

import React from 'react';
import './AboutUs.css'; // Iski CSS file abhi banayenge
import aboutImage from '../assets/about-us-image.jpg'; // Hum is image ko abhi add karenge

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
            Atyant is a premier software development company dedicated to delivering top-notch, innovative solutions. Our team of expert developers, designers, and strategists work collaboratively to bring your vision to life, ensuring scalability and success for your business. We believe in building partnerships, not just projects.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
