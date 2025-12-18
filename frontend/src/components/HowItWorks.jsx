// src/components/HowItWorks.jsx
import React from 'react';
import './HowItWorks.css'; // This line has been corrected

const steps = [
  {
    icon: '❓',
    title: 'Tell us your problem',
    description: 'Resume shortlist? Internship strategy? Roadmap confused? Just tell us what you\'re stuck on.'
  },
  {
    icon: '🤝',
    title: 'We connect you with a senior who solved it recently',
    description: 'Not a random mentor. Someone who cracked your exact problem.'
  },
  {
    icon: '💬',
    title: 'Get the actual steps they used',
    description: 'What they did. What failed. What worked. No theory.'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <h2>How अत्यAnT Works</h2>
          <p>Get answers from real achievers in just 3 simple steps</p>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div className="step-card" key={index}>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;