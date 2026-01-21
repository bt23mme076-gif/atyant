// src/components/HowItWorks.jsx
import React, { useEffect, useRef } from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const flowRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = flowRef.current?.querySelectorAll('.animate-item');
    elements?.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.15}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="flow-section" ref={flowRef}>
      <div className="flow-wrapper">
        
        {/* Header */}
        <div className="flow-header animate-item">
          <span className="flow-badge">✨ The Magic Behind</span>
          <h2>How <span className="gradient-text">Atyant</span> Works</h2>
          <p>From your question to personalized guidance — powered by AI + real experience</p>
        </div>

        {/* Main Flow */}
        <div className="flow-visual">
          
          {/* Step 1: User Asks */}
          <div className="flow-node node-start animate-item">
            <div className="node-number">01</div>
            <div className="node-icon">
              <span>🎯</span>
              <div className="icon-ring"></div>
            </div>
            <div className="node-content">
              <h3>You Ask</h3>
              <p>One clear question with your context, goals & constraints</p>
            </div>
          </div>

          <div className="flow-line animate-item">
            <div className="line-flow"></div>
          </div>

          {/* Step 2: AI Processing */}
          <div className="flow-node node-ai animate-item">
            <div className="node-number">02</div>
            <div className="node-icon">
              <span>🧠</span>
              <div className="icon-ring"></div>
            </div>
            <div className="node-content">
              <h3>Atyant Engine (AI Processes)</h3>
              <p>Question cleaned, meaning extracted, context understood</p>
            </div>
            <div className="ai-dots">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div className="flow-line animate-item">
            <div className="line-flow"></div>
          </div>

          {/* Step 3: Smart Split - Two Paths */}
          <div className="flow-split animate-item">
            <div className="split-header">
              <div className="split-icon">⚡</div>
              <span>Smart Matching</span>
            </div>
            
            <div className="split-paths">
              {/* Path A: Instant */}
              <div className="path-box path-instant">
                <div className="path-glow"></div>
                <div className="path-icon">💨</div>
                <h4>Instant Answer</h4>
                <p>Similar question already solved?</p>
                <ul>
                  <li>Vector similarity search</li>
                  <li>High-quality match found</li>
                  <li>Delivered in seconds</li>
                </ul>
                <div className="path-tag">⚡ &lt; 5 sec</div>
              </div>

              <div className="path-or">
                <div className="or-line"></div>
                <span>OR</span>
                <div className="or-line"></div>
              </div>

              {/* Path B: Mentor */}
              <div className="path-box path-mentor">
                <div className="path-glow"></div>
                <div className="path-icon">🎓</div>
                <h4>Live Mentor</h4>
                <p>New problem? We find the perfect senior</p>
                <ul>
                  <li>Multi-factor scoring</li>
                  <li>Domain + achievements match</li>
                  <li>Top mentor notified</li>
                </ul>
                <div className="path-tag">🎯 Best Match</div>
              </div>
            </div>
          </div>

          <div className="flow-line animate-item">
            <div className="line-flow"></div>
          </div>

          {/* Step 4: Answer Processing */}
          <div className="flow-node node-process animate-item">
            <div className="node-number">04</div>
            <div className="node-icon">
              <span>✨</span>
              <div className="icon-ring"></div>
            </div>
            <div className="node-content">
              <h3>AI Structures</h3>
              <p>Raw experience → Steps, timeline, mistakes, do's & don'ts, and more</p>
              <div className="process-tags">
                <span className="tag-animate">📋 Steps</span>
                <span className="tag-animate">⏱️ Timeline</span>
                <span className="tag-animate">❌ Mistakes</span>
                <span className="tag-animate">✅ Tips</span>
                <span className="tag-animate">and more</span>
              </div>
            </div>
          </div>

          <div className="flow-line animate-item">
            <div className="line-flow"></div>
          </div>

          {/* Step 5: Final Delivery */}
          <div className="flow-node node-end animate-item">
            <div className="node-number">05</div>
            <div className="node-icon icon-success">
              <span>🏆</span>
              <div className="icon-ring success-ring"></div>
            </div>
            <div className="node-content">
              <h3>Your Atyant Answer Card</h3>
              <p>Personalized, actionable, real — not generic advice</p>
            </div>
            <div className="success-particles">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>

        </div>

        {/* Bottom Benefits */}
        <div className="flow-benefits">
          <div className="benefit-item animate-item">
            <div className="benefit-icon">🔄</div>
            <div className="benefit-text">
              <strong>Self-Learning</strong>
              <p>Every answer helps future students</p>
            </div>
          </div>
          <div className="benefit-item animate-item">
            <div className="benefit-icon">📈</div>
            <div className="benefit-text">
              <strong>Scalable</strong>
              <p>Mentors solve once, impact thousands</p>
            </div>
          </div>
          <div className="benefit-item animate-item">
            <div className="benefit-icon">🎯</div>
            <div className="benefit-text">
              <strong>Personalized</strong>
              <p>Context-aware, not copy-paste advice</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;