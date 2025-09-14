// src/components/WhyChooseUs.jsx
import React from 'react';
import './WhyChooseUs.css';

const features = [
  {
    icon: '🏆',
    title: 'Achievers, Not Generic Experts',
    description: 'Our mentors are students, professionals, and creators who have been there, done that. They guide you with real, lived experience.'
  },
  {
    icon: '⚡',
    title: 'Instant, Direct Chat',
    description: 'No browsing random blogs or videos. You get advice tailored to your situation—fast and clear .'
  },
  {
    icon: '💡',
    title: 'AI + Human Wisdom',
    description: 'We use AI to match you smartly, but your guidance always comes from real people who cracked the same problems'
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us-section">
      <div className="container">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;