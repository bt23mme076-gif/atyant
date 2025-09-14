// src/components/HowItWorks.jsx
import React from 'react';
import './HowItWorks.css'; // This line has been corrected

const steps = [
  {
    icon: '❓',
    title: 'Ask Your Question',
    description: 'Got a doubt about academics, career, or personal growth? Just type it out. No confusing forms, no long wait.'
  },
  {
    icon: '🤝',
    title: 'Get Matched Instantly',
    description: 'Our AI finds the best mentor—someone who has already solved the exact challenge you are facing'
  },
  {
    icon: '💬',
    title: 'Chat Directly with Mentors',
    description: 'No one-way advice. You can talk to mentors in real time, ask follow-up questions, and get practical solutions that actually work.'
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