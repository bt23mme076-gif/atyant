import React, { useEffect, useRef, useState } from 'react';
import './WhyChooseUs.css';

const cards = [
  {
    id: 'card-purple',
    colorClass: 'card-purple',
    icon: '📊',
    number: '01',
    title: 'Verified Human Datasets',
    desc: 'Trained on actual experiences from top tech companies and successful candidates.',
    highlight: 'High-Fidelity Context',
  },
  {
    id: 'card-blue',
    colorClass: 'card-blue',
    icon: '⚡',
    number: '02',
    title: 'Semantic Execution Engine',
    desc: 'Extracts exact blockers and provides instantly actionable frameworks in seconds.',
    highlight: 'Zero Hallucinations',
  },
  {
    id: 'card-cyan',
    colorClass: 'card-cyan',
    icon: '🎯',
    number: '03',
    title: 'Dynamic Pattern Recognition',
    desc: 'Identifies non-obvious career patterns mapping perfectly to your current profile.',
    highlight: 'Predictive Mapping',
  },
];

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const dynamicWords = ['Trajectory', 'Placement', 'Outcomes'];

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
          <span className="why-badge">SYSTEM ARCHITECTURE</span>
          <h2>
            The Intelligence Layer for Your <br />
            <span className="gradient-text">Career <span className="dynamic-word" key={wordIndex}>{dynamicWords[wordIndex]}</span></span>
          </h2>
          <p>Next-generation processing to solve complex career blocks instantly.</p>
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

      </div>
    </section>
  );
};

export default WhyChooseUs;