// src/components/HowItWorks.jsx
import React from 'react';
import './HowItWorks.css'; // This line has been corrected

const steps = [
  {
    icon: '❓',
    title: 'Ask Your Question',
    description: 'Submit your specific question about academics, careers, or personal growth. Our system ensures it reaches the most qualified mentors.'
  },
  {
    icon: '🤝',
    title: 'Get Matched Instantly',
    description: 'Our AI connects you with verified achievers who have successfully navigated the exact challenge you\'re facing.'
  },
  {
    icon: '💡',
    title: 'Receive Tailored Advice',
    description: 'Get detailed, actionable guidance specific to your situation—not generic information you could find anywhere else.'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <h2>How अत्यAnT Works</h2>
          <p>Get personalized guidance in three simple steps</p>
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