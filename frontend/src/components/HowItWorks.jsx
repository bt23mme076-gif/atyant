import React, { useEffect, useRef, useState } from 'react';

const steps = [
  {
    id: '01',
    icon: '🎯',
    title: 'You Ask',
    desc: 'One clear question with your context, goals & constraints',
    color: '#7c3aed',
  },
  {
    id: '02',
    icon: '🧠',
    title: 'Atyant Engine Processes',
    desc: 'Question cleaned, meaning extracted, context understood',
    color: '#6d28d9',
  },
  {
    id: '04',
    icon: '✨',
    title: 'AI Structures the Answer',
    desc: "Raw experience → Steps, timeline, mistakes, do's & don'ts",
    color: '#5b21b6',
    tags: ['📋 Steps', '⏱️ Timeline', '❌ Mistakes', '✅ Tips'],
  },
  {
    id: '05',
    icon: '🏆',
    title: 'Your Atyant Answer Card',
    desc: 'Personalized, actionable, real — not generic advice',
    color: '#4c1d95',
  },
];

const benefits = [
  { icon: '🔄', title: 'Self-Learning', desc: 'Every answer helps future students' },
  { icon: '📈', title: 'Scalable', desc: 'Mentors solve once, impact thousands' },
  { icon: '🎯', title: 'Personalized', desc: 'Context-aware, not copy-paste advice' },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((v) => !v);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('hiw-visible');
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    sectionRef.current?.querySelectorAll('.hiw-animate').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={styles.section}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>

        {/* ── Header (always visible) ── */}
        <div className="hiw-animate" style={styles.header}>
          <span style={styles.badge}>✨ The Magic Behind</span>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>
              How <span style={styles.gradientText}>Atyant</span> Works
            </h2>
            <button
              onClick={toggleOpen}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Collapse details' : 'Expand details'}
              style={styles.toggleBtn}
            >
              {isOpen ? 'Show less' : 'Show more'}
            </button>
          </div>
          <p style={styles.subtitle}>
            From your question to personalized guidance —{' '}
            powered by <strong>AI + real experience</strong>
          </p>
        </div>

        {/* ── Expandable Content ── */}
        <div
          style={{
            ...styles.expandable,
            maxHeight: isOpen ? '3000px' : '0px',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        >

          {/* Smart Split Card */}
          <div className="hiw-animate" style={styles.splitCard}>
            <div style={styles.splitCardInner}>
              <div style={styles.splitLabel}>
                <span style={styles.splitLabelIcon}>⚡</span> Smart Matching
              </div>
              <div style={styles.splitPaths}>
                {/* Instant */}
                <div style={{ ...styles.pathBox, background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' }}>
                  <div style={styles.pathIcon}>💨</div>
                  <h4 style={styles.pathTitle}>Instant Answer</h4>
                  <p style={styles.pathDesc}>Similar question already solved?</p>
                  <ul style={styles.pathList}>
                    <li>Vector similarity search</li>
                    <li>High-quality match found</li>
                    <li>Delivered in seconds</li>
                  </ul>
                  <span style={{ ...styles.pathTag, background: '#7c3aed', color: '#fff' }}>⚡ &lt; 5 sec</span>
                </div>

                <div style={styles.orDivider}>
                  <div style={styles.orLine} />
                  <span style={styles.orText}>OR</span>
                  <div style={styles.orLine} />
                </div>

                {/* Mentor */}
                <div style={{ ...styles.pathBox, background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)' }}>
                  <div style={styles.pathIcon}>🎓</div>
                  <h4 style={styles.pathTitle}>Live Mentor</h4>
                  <p style={styles.pathDesc}>New problem? We find the perfect senior</p>
                  <ul style={styles.pathList}>
                    <li>Multi-factor scoring</li>
                    <li>Domain + achievements match</li>
                    <li>Top mentor notified</li>
                  </ul>
                  <span style={{ ...styles.pathTag, background: '#4c1d95', color: '#fff' }}>🎯 Best Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={styles.stepsRow}>
            {steps.map((step, i) => (
              <div key={step.id} className="hiw-animate" style={styles.stepCard}>
                <div style={{ ...styles.stepNumber, background: step.color }}>{step.id}</div>
                <div style={styles.stepIconWrap}>
                  <span style={styles.stepEmoji}>{step.icon}</span>
                </div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
                {step.tags && (
                  <div style={styles.tagsWrap}>
                    {step.tags.map((tag) => (
                      <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                  </div>
                )}
                {i < steps.length - 1 && (
                  <div style={styles.stepArrow}>↓</div>
                )}
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div style={styles.benefitsRow}>
            {benefits.map((b) => (
              <div key={b.title} className="hiw-animate" style={styles.benefitCard}>
                <div style={styles.benefitIcon}>{b.icon}</div>
                <strong style={styles.benefitTitle}>{b.title}</strong>
                <p style={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Social proof ticker */}
          <div className="hiw-animate" style={styles.ticker}>
            🎉 <strong>Ravi got IIT research intern!</strong> &nbsp;·&nbsp;
            🚀 <strong>Priya cracked Microsoft internship!</strong> &nbsp;·&nbsp;
            🏆 <strong>Arjun landed his first startup role!</strong>
          </div>

        </div>
        {/* end expandable */}

      </div>

      <style>{`
        .hiw-animate {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .hiw-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </section>
  );
};

const styles = {
  section: {
    position: 'relative',
    padding: '100px 24px',
    background: 'linear-gradient(160deg, #faf5ff 0%, #ede9fe 40%, #f5f3ff 100%)',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  blob1: {
    position: 'absolute', top: '-120px', right: '-120px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-100px', left: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1,
  },
  header: {
    textAlign: 'center', marginBottom: '24px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 18px',
    borderRadius: '999px',
    background: 'rgba(124,58,237,0.1)',
    color: '#7c3aed',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '16px',
    border: '1px solid rgba(124,58,237,0.2)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
    fontWeight: 800,
    color: '#1e1b4b',
    margin: 0,
    lineHeight: 1.2,
  },
  gradientText: {
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  toggleBtn: {
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.25)',
    color: '#7c3aed',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#6b7280',
    lineHeight: 1.7,
    margin: 0,
  },
  expandable: {
    overflow: 'hidden',
    transition: 'max-height 0.6s ease, opacity 0.4s ease',
  },
  splitCard: {
    marginTop: '36px',
    marginBottom: '48px',
    borderRadius: '20px',
    background: '#fff',
    boxShadow: '0 8px 40px rgba(109,40,217,0.1)',
    border: '1px solid rgba(124,58,237,0.1)',
    overflow: 'hidden',
  },
  splitCardInner: { padding: '32px' },
  splitLabel: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#7c3aed',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  splitLabelIcon: { fontSize: '1.2rem' },
  splitPaths: {
    display: 'flex',
    gap: '16px',
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  pathBox: {
    flex: 1,
    minWidth: '200px',
    borderRadius: '14px',
    padding: '24px',
    border: '1px solid rgba(124,58,237,0.15)',
  },
  pathIcon: { fontSize: '2rem', marginBottom: '10px' },
  pathTitle: { margin: '0 0 6px', fontWeight: 700, color: '#1e1b4b', fontSize: '1rem' },
  pathDesc: { fontSize: '0.85rem', color: '#6b7280', margin: '0 0 12px' },
  pathList: { fontSize: '0.82rem', color: '#4b5563', paddingLeft: '18px', margin: '0 0 16px', lineHeight: 1.8 },
  pathTag: {
    display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
    fontSize: '0.78rem', fontWeight: 600,
  },
  orDivider: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '8px', padding: '0 4px',
  },
  orLine: { width: '1px', height: '40px', background: 'rgba(124,58,237,0.2)' },
  orText: { fontWeight: 700, color: '#7c3aed', fontSize: '0.85rem' },
  stepsRow: {
    display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '48px',
  },
  stepCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px 32px',
    marginBottom: '4px',
    boxShadow: '0 4px 24px rgba(109,40,217,0.07)',
    border: '1px solid rgba(124,58,237,0.08)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  stepNumber: {
    position: 'absolute', top: '24px', right: '24px',
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '0.75rem',
  },
  stepIconWrap: {
    width: '52px', height: '52px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '14px',
  },
  stepEmoji: { fontSize: '1.6rem' },
  stepTitle: { margin: '0 0 6px', fontWeight: 700, color: '#1e1b4b', fontSize: '1.05rem' },
  stepDesc: { margin: 0, color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 },
  tagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' },
  tag: {
    padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem',
    background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontWeight: 600,
    border: '1px solid rgba(124,58,237,0.15)',
  },
  stepArrow: {
    alignSelf: 'center', fontSize: '1.4rem', color: '#a78bfa',
    marginTop: '16px', animation: 'bounce 1.5s infinite',
  },
  benefitsRow: {
    display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px',
  },
  benefitCard: {
    flex: 1, minWidth: '180px',
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(109,40,217,0.07)',
    border: '1px solid rgba(124,58,237,0.08)',
  },
  benefitIcon: { fontSize: '2rem', marginBottom: '10px' },
  benefitTitle: { display: 'block', color: '#1e1b4b', marginBottom: '6px', fontSize: '0.95rem' },
  benefitDesc: { margin: 0, color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.6 },
  ticker: {
    textAlign: 'center',
    padding: '14px 24px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(167,139,250,0.08))',
    border: '1px solid rgba(124,58,237,0.15)',
    fontSize: '0.85rem',
    color: '#4b5563',
    lineHeight: 1.8,
  },
};

export default HowItWorks;