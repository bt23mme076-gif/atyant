import React, { useEffect, useRef, useState } from 'react';

const steps = [
  {
    id: '01',
    icon: '⚡',
    title: 'Input Your Context',
    desc: 'Describe your blocker, goal, and current state. The more context you provide, the deeper the analysis.',
    color: '#3B82F6', // Neon Blue
  },
  {
    id: '02',
    icon: '🧠',
    title: 'Semantic Processing',
    desc: 'The engine parses your query, extracts key entities, and understands the underlying constraints.',
    color: '#6366F1', // Indigo
  },
  {
    id: '03',
    icon: '🔍',
    title: 'Database & Pathway Search',
    desc: "Vector similarity search scours thousands of verified career data points and exact solution matches.",
    color: '#7C3AED', // Electric Purple
    tags: ['📊 Vector Matching', '✅ Verified Data', '⏱️ Millisecond Search'],
  },
  {
    id: '04',
    icon: '🎯',
    title: 'Synthesized Solution',
    desc: 'You receive an exact, actionable roadmap generated from real-world success pathways.',
    color: '#A855F7', // Magenta Purple
  },
];

const benefits = [
  { icon: '🔄', title: 'Self-Improving', desc: 'Every solved query enhances the global knowledge graph.' },
  { icon: '🚀', title: 'High Velocity', desc: 'Get accurate career pathways in seconds, not weeks.' },
  { icon: '🎯', title: 'Hyper-Personalized', desc: 'Context-aware modeling, avoiding generic copy-paste advice.' },
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
      {/* Background glow effects */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.gridPattern} />

      <div style={styles.container}>

        {/* ── Header ── */}
        <div className="hiw-animate" style={styles.header}>
          <span style={styles.badge}>ENGINE ARCHITECTURE</span>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>
              How The <span style={styles.gradientText}>Atyant Engine</span> Works
            </h2>
          </div>
          <p style={styles.subtitle}>
            From unstructured query to high-fidelity career roadmap —{' '}
            powered by semantic matching and verified human data.
          </p>
          <button
              onClick={toggleOpen}
              aria-expanded={isOpen}
              style={styles.toggleBtn}
            >
              {isOpen ? 'Collapse Architecture' : 'View Architecture'}
          </button>
        </div>

        {/* ── Expandable Content ── */}
        <div
          style={{
            ...styles.expandable,
            maxHeight: isOpen ? '2000px' : '0px',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        >

          {/* Steps Array */}
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
                {/* Visual Connector */}
                {i < steps.length - 1 && (
                  <div style={styles.stepConnector} />
                )}
              </div>
            ))}
          </div>

          {/* Post Architecture Benefits */}
          <div style={styles.benefitsRow}>
            {benefits.map((b) => (
              <div key={b.title} className="hiw-animate" style={styles.benefitCard}>
                <div style={styles.benefitIcon}>{b.icon}</div>
                <strong style={styles.benefitTitle}>{b.title}</strong>
                <p style={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>

        </div>
        {/* end expandable */}

      </div>

      <style>{`
         /* Shared Reset/Anim */
        .hiw-animate {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hiw-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
};

const styles = {
  section: {
    position: 'relative',
    padding: '120px 24px',
    background: '#FFFFFF',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  blob1: {
    position: 'absolute', top: '-150px', right: '-150px',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(60px)',
  },
  blob2: {
    position: 'absolute', bottom: '-150px', left: '-150px',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(60px)',
  },
  container: {
    maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1,
  },
  header: {
    textAlign: 'center', marginBottom: '40px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3B82F6',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    marginBottom: '20px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#475569',
    lineHeight: 1.6,
    margin: '0 auto 24px',
    maxWidth: '600px',
  },
  toggleBtn: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    color: '#0F172A',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  expandable: {
    overflow: 'hidden',
    transition: 'max-height 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
  },
  stepsRow: {
    display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px', marginTop: '24px',
  },
  stepCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #E2E8F0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  stepNumber: {
    position: 'absolute', top: '24px', right: '24px',
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '0.75rem',
  },
  stepIconWrap: {
    width: '48px', height: '48px', borderRadius: '12px',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px',
  },
  stepEmoji: { fontSize: '1.4rem' },
  stepTitle: { margin: '0 0 8px', fontWeight: 700, color: '#0F172A', fontSize: '1.2rem', fontFamily: "'Outfit', sans-serif" },
  stepDesc: { margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 },
  tagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' },
  tag: {
    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem',
    background: 'rgba(124, 58, 237, 0.05)', color: '#7C3AED', fontWeight: 600,
    border: '1px solid rgba(124, 58, 237, 0.2)',
  },
  stepConnector: {
    position: 'absolute',
    bottom: '-16px',
    left: '56px',
    width: '2px',
    height: '16px',
    background: '#E2E8F0',
  },
  benefitsRow: {
    display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px',
  },
  benefitCard: {
    flex: 1, minWidth: '220px',
    background: '#F8FAFC',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    textAlign: 'left',
  },
  benefitIcon: { fontSize: '1.8rem', marginBottom: '16px' },
  benefitTitle: { display: 'block', color: '#0F172A', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 },
  benefitDesc: { margin: 0, color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 },
};

export default HowItWorks;