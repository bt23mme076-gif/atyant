// src/components/WhyChooseUs.jsx
import React, { useEffect, useRef } from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = sectionRef.current?.querySelectorAll('.why-animate');
    elements?.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.15}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // 🔥 Scroll to Hero & Focus Search
  const handleAskQuestion = () => {
    const heroSection = document.getElementById('hero-section');
    const searchInput = document.getElementById('hero-search-input');
    
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
      
      // Focus input after scroll completes
      setTimeout(() => {
        if (searchInput) {
          searchInput.focus();
          searchInput.classList.add('highlight-input');
          
          // Remove highlight after 2 seconds
          setTimeout(() => {
            searchInput.classList.remove('highlight-input');
          }, 2000);
        }
      }, 800);
    }
  };

  const reasons = [
    {
      icon: "🏆",
      title: "Real Experience → Reusable Guidance",
      description: "Atyant doesn't give opinions. We convert real senior journeys into structured AnswerCards that guide thousands of similar students.",
      highlight: "AnswerCards",
      color: "gold"
    },
    {
      icon: "⚡",
      title: "Instant Answers, Not Endless Chats",
      description: "If a relevant AnswerCard already exists, you get it instantly. No waiting. No repeated questions. No noise.",
      highlight: "instantly",
      color: "blue"
    },
    {
      icon: "🧠",
      title: "AI Routing, Human Truth",
      description: "Our AI decides who should answer — not what to answer. Guidance always comes from people who've actually solved the same problem.",
      highlight: "who should answer",
      color: "purple"
    }
  ];

  return (
    <section className="why-section" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="why-bg-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <div className="why-container">
        
        {/* Header */}
        <div className="why-header why-animate">
          <span className="why-badge">💡 The Difference</span>
          <h2>Why Choose <span className="gradient-text">अत्यAnT</span>?</h2>
          <p>Not just another platform. A smarter way to get real guidance.</p>
        </div>

        {/* Cards Grid */}
        <div className="why-cards">
          {reasons.map((reason, index) => (
            <div className={`why-card why-animate card-${reason.color}`} key={index}>
              <div className="card-glow"></div>
              <div className="card-number">0{index + 1}</div>
              
              <div className="card-icon">
                <span>{reason.icon}</span>
                <div className="icon-pulse"></div>
              </div>
              
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
              
              <div className="card-highlight">
                <span>✦ {reason.highlight}</span>
              </div>

              <div className="card-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="why-cta why-animate">
          <p>Ready to get guidance that actually works?</p>
          <button className="cta-button" onClick={handleAskQuestion}>
            <span>Ask Your First Question</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;