import React, { useEffect, useRef, useState } from 'react';
import './WhyChooseUs.css';

const cards = [
  {
    id: 'card-gold',
    colorClass: 'card-gold',
    icon: '🏆',
    number: '01',
    title: 'Real Mentor,  Experience',
    desc: "Connect with IITs, NITs & top company seniors — who’ve actually done it",
    highlight: '500+ Verified Mentors',
  },
  {
    id: 'card-blue',
    colorClass: 'card-blue',
    icon: '⚡',
    number: '02',
    title: 'AI-Powered Answer Engine',
    desc: 'Get instant, personalized answers — no generic advice',
    highlight: 'Human + AI Intelligence',
  },
  {
    id: 'card-purple',
    colorClass: 'card-purple',
    icon: '🎯',
    number: '03',
    title: ' Built for results',
    desc: 'Everything focused on one goal: helping you crack internships & placements',
    highlight: '3x Higher Success Rate',
  },
];

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const dynamicWords = ['Placement', 'Internship'];

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % dynamicWords.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.15 }
    );

    const animateEls = sectionRef.current?.querySelectorAll('.why-animate');
    animateEls?.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.12}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="why-section" ref={sectionRef}>

      {/* Animated Background */}
      <div className="why-bg-elements">
        <div className="bg-circle circle-1" />
        <div className="bg-circle circle-2" />
        <div className="bg-circle circle-3" />
      </div>

      <div className="why-container">

        {/* Header */}
        <div className="why-header why-animate">
          <span className="why-badge">✦ Why Atyant</span>
          <h2>
            The Smarter Way to <br />
            <span className="gradient-text">Land Your Dream <span className="dynamic-word" key={wordIndex} data-word={dynamicWords[wordIndex]} aria-live="polite">{dynamicWords[wordIndex]}</span></span>
          </h2>
          <p>Thousands of students trust Atyant to guide their next big career move.</p>
        </div>

        {/* Cards Grid */}
        <div className="why-cards">
          {cards.map((card) => (
            <div key={card.id} className={`why-card ${card.colorClass} why-animate`}>

              <div className="card-glow" />
              <span className="card-number">{card.number}</span>

              <div className="card-icon">
                <span>{card.icon}</span>
                <div className="icon-pulse" />
              </div>

              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <span className="card-highlight">{card.highlight}</span>

              <div className="card-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="why-cta why-animate">
          <p>Join 2,000+ students already getting smarter guidance.</p>
          <button
            className="cta-button"
            onClick={() => (window.location.href = 'https://chat.whatsapp.com/F3qcw7JZRIK5vbPgvUfaOA?mode=gi_t')}
          >
            <span>Join Atyant Community For Free </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;