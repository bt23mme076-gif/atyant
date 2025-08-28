// src/components/WhyChooseUs.jsx
import React from 'react';
import './WhyChooseUs.css';

const features = [
  {
    icon: '🏆',
    title: 'Expert Team',
    description: 'Our team consists of highly skilled professionals dedicated to excellence.'
  },
  {
    icon: '💡',
    title: 'Innovative Solutions',
    description: 'We leverage the latest technologies to provide cutting-edge solutions.'
  },
  {
    icon: '🤝',
    title: 'Client-Centric Approach',
    description: 'Your success is our priority. We work closely with you to achieve your goals.'
  }
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