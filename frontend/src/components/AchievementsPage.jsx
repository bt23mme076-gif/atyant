// src/components/AchievementsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';
import './AchievementsPage.css';

/* ── HOOK: fade-up on scroll ── */
function useFadeUp() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── SECTION WRAPPER ── */
function FadeSection({ children, delay = 0, className = '' }) {
  const [ref, visible] = useFadeUp();
  return (
    <div
      ref={ref}
      className={`fade-section ${visible ? 'fade-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── LIGHTBOX ── */
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="ach-lightbox" onClick={onClose}>
      <div className="ach-lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} className="ach-lightbox-img" />
        <button className="ach-lightbox-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

/* ── PILL BADGE ── */
function Pill({ icon, label, delay = 0 }) {
  const [ref, visible] = useFadeUp();
  return (
    <span
      ref={ref}
      className={`ach-pill ${visible ? 'fade-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="ach-pill-icon">{icon}</span>
      {label}
    </span>
  );
}

/* ── TIMELINE DOT ── */
function TimelineItem({ icon, title, subtitle, date, delay = 0 }) {
  const [ref, visible] = useFadeUp();
  return (
    <div
      ref={ref}
      className={`ach-timeline-item ${visible ? 'fade-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="ach-timeline-node">
        <span className="ach-timeline-dot" />
      </div>
      <div className="ach-timeline-content">
        <span className="ach-timeline-date">{date}</span>
        <div className="ach-timeline-icon">{icon}</div>
        <h3 className="ach-timeline-title">{title}</h3>
        {subtitle && <p className="ach-timeline-sub">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── BENTO CARD ── */
function BentoCard({ icon, title, desc, stat, statLabel, span = 1, tall = false, delay = 0 }) {
  const [ref, visible] = useFadeUp();
  return (
    <div
      ref={ref}
      className={`ach-bento-card ${visible ? 'fade-visible' : ''} ${span === 2 ? 'ach-bento-span2' : ''} ${tall ? 'ach-bento-tall' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="ach-bento-icon">{icon}</div>
      <h3 className="ach-bento-title">{title}</h3>
      <p className="ach-bento-desc">{desc}</p>
      {stat && (
        <div className="ach-bento-stat">
          <span className="ach-bento-stat-num">{stat}</span>
          <span className="ach-bento-stat-label">{statLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ── GALLERY IMAGE ── */
function GalleryImg({ src, alt, aspect, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`ach-gallery-item ach-gallery-${aspect}`}
      onClick={() => onClick(src, alt)}
    >
      <img
        src={src}
        alt={alt}
        className={`ach-gallery-img ${loaded ? 'loaded' : ''}`}
        onLoad={() => setLoaded(true)}
      />
      <div className="ach-gallery-overlay">
        <span className="ach-gallery-expand">⊕</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function AchievementsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('atyant_theme')
      || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => { localStorage.setItem('atyant_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const go = (href) => {
    if (!href) return;
    if (href.startsWith('http')) window.open(href, '_blank', 'noopener,noreferrer');
    else navigate(href);
    setMenuOpen(false);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const openLightbox = (src, alt) => setLightbox({ src, alt });

  return (
    <>
      <SEO
        title="Achievements — Atyant"
        description="Recognized across India's leading startup ecosystem. Top 20 Hult Prize IIT Bombay, Pitch Wars Champion, Funded at VNIT Nagpur 2026."
        canonical="https://atyant.in/achievements"
      />
      <div className={`atyant-landing ach-page${theme === 'dark' ? ' dark' : ''}`}>

        {/* ── ANNOUNCEMENT BAR ── */}
        <div className="al-announce">
          <span className="al-announce-tag">New</span>
          <span>Atyant — Hult Prize Top 20, IIT Bombay Nationals 2026</span>
          <span
            style={{ color: 'var(--accent)', fontWeight: 800, cursor: 'pointer' }}
            onClick={() => scrollTo('featured')}
          >
            See the story →
          </span>
        </div>

        {/* ── HEADER (same as landing page) ── */}
        <header className="al-header">
          <button className="al-brand" onClick={() => go('/home')}>
            <span className="al-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2.5l1.9 5.3a3 3 0 001.8 1.8l5.3 1.9-5.3 1.9a3 3 0 00-1.8 1.8L12 20.5l-1.9-5.3a3 3 0 00-1.8-1.8L3 11.5l5.3-1.9a3 3 0 001.8-1.8z"
                  fill="currentColor"
                />
                <path
                  d="M18.5 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"
                  fill="currentColor"
                  opacity="0.85"
                />
              </svg>
            </span>
            अत्यanT
          </button>

          <nav className={`al-nav${menuOpen ? ' open' : ''}`}>
            <button className="al-nav-btn" onClick={() => go('/home')}>Home</button>
            <button className="al-nav-btn" onClick={() => scrollTo('featured')}>Story</button>
            <button className="al-nav-btn" onClick={() => scrollTo('recognitions')}>Recognitions</button>
            <button className="al-nav-btn" onClick={() => scrollTo('journey')}>Journey</button>
            <button className="al-nav-btn" onClick={() => scrollTo('moments')}>Moments</button>
          </nav>

          <div className="al-header-actions">
            <button
              className="al-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className="al-primary-btn"
              style={{ minHeight: 38, padding: '0 18px', fontSize: '0.86rem' }}
              onClick={() => go('https://atyant.in/')}
            >
              Try the Engine →
            </button>
          </div>

          <div className="al-mobile-actions">
            <button className="al-theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className="al-menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(p => !p)}
            >
              <span /><span /><span />
            </button>
          </div>
        </header>

        {/* ══════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════ */}
        <section className="ach-hero">
          <FadeSection>
            <div className="ach-hero-kicker">
              <span className="ach-hero-kicker-dot" />
              Milestones · 2026
            </div>
            <h1 className="ach-hero-h1">
              Recognized Across<br />
              <span className="al-h1-accent">India's Leading</span><br />
              Startup Ecosystem.
            </h1>
            <p className="ach-hero-sub">
              Milestones that reflect our mission to democratize career
              clarity for engineering students.
            </p>
          </FadeSection>

          <div className="ach-pills">
            <Pill icon="🏆" label="Hult Prize IIT Bombay Top 20" delay={100} />
            <Pill icon="🥇" label="Pitch Wars Champion" delay={180} />
            <Pill icon="💰" label="Funded at VNIT Nagpur" delay={260} />
            <Pill icon="🚀" label="Growing Community" delay={340} />
          </div>
        </section>

        {/* ══════════════════════════════════
            SECTION 2 — FEATURED STORY
        ══════════════════════════════════ */}
        <section id="featured" className="ach-featured">
          <FadeSection>
            <div className="ach-featured-eyebrow">Featured Story</div>
          </FadeSection>

          <FadeSection delay={100}>
            <div className="ach-featured-image-wrap">
              <img
                src="/hult-prize-stage.png"
                alt="Atyant founder on stage at Hult Prize IIT Bombay 2026"
                className="ach-featured-image"
              />
              <div className="ach-featured-caption">
                <span className="ach-featured-caption-year">2026</span>
                <div className="ach-featured-caption-body">
                  <h2 className="ach-featured-title">
                    Top 20 — Hult Prize<br />IIT Bombay
                  </h2>
                  <p className="ach-featured-desc">
                    Selected among India's most promising startups at
                    Hult Prize IIT Bombay Nationals 2026.
                  </p>
                </div>
              </div>
            </div>
          </FadeSection>
        </section>

        {/* ══════════════════════════════════
            SECTION 3 — BENTO RECOGNITIONS
        ══════════════════════════════════ */}
        <section id="recognitions" className="ach-section">
          <FadeSection>
            <div className="ach-section-eyebrow">Recognitions</div>
            <h2 className="ach-section-h2">
              Built with purpose.<br />
              <span className="al-h1-accent">Recognized for it.</span>
            </h2>
          </FadeSection>

          <div className="ach-bento-grid">
            <BentoCard
              icon="🥇"
              title="Pitch Wars Champion"
              desc="Won the Pitch Wars competition outright — beating seasoned startup teams with a clear, mission-driven pitch for Atyant."
              span={2}
              delay={0}
            />
            <BentoCard
              icon="💰"
              title="Funded at VNIT Nagpur"
              desc="Secured early-stage funding at the VNIT Nagpur entrepreneurship showcase in 2026."
              stat="2026"
              statLabel="Cohort"
              tall
              delay={80}
            />
            <BentoCard
              icon="🚀"
              title="Growing Community"
              desc="Over 50,000 organic site visits with zero paid acquisition — built entirely on student word-of-mouth."
              stat="50K+"
              statLabel="Organic visits"
              tall
              delay={160}
            />
            <BentoCard
              icon="🎓"
              title="Mentoring Students Across India"
              desc="Engineering students from 30+ colleges — VNIT, MANIT, NIT Raipur, NIT Calicut — using Atyant for career clarity."
              stat="30+"
              statLabel="Colleges"
              span={2}
              delay={240}
            />
          </div>
        </section>

        {/* ══════════════════════════════════
            SECTION 4 — JOURNEY TIMELINE
        ══════════════════════════════════ */}
        <section id="journey" className="ach-section ach-journey-section">
          <FadeSection>
            <div className="ach-section-eyebrow">The Journey</div>
            <h2 className="ach-section-h2">
              Every milestone,<br />
              <span className="al-h1-accent">earned.</span>
            </h2>
          </FadeSection>

          <div className="ach-timeline">
            <div className="ach-timeline-line" />

            <TimelineItem
              icon="🏆"
              title="Top 20 Hult Prize IIT Bombay"
              subtitle="Selected among the most competitive early-stage impact startups in India at Hult Prize Nationals, IIT Bombay."
              date="April 2026"
              delay={0}
            />
            <TimelineItem
              icon="🥇"
              title="Pitch Wars Champion"
              subtitle="Won outright at Pitch Wars — a competitive showcase where Atyant's clarity-first mission stood out."
              date="March 2026"
              delay={120}
            />
            <TimelineItem
              icon="💰"
              title="Funded at VNIT Nagpur"
              subtitle="Received early-stage funding at the VNIT Nagpur entrepreneurship showcase, validating the business model."
              date="February 2026"
              delay={240}
            />
            <TimelineItem
              icon="🚀"
              title="50,000+ Organic Site Visits"
              subtitle="Crossed 50,000 organic visits with zero paid acquisition — driven purely by student word-of-mouth across engineering colleges."
              date="May 2026"
              delay={360}
            />
          </div>
        </section>

        {/* ══════════════════════════════════
            SECTION 5 — PHOTO GALLERY
        ══════════════════════════════════ */}
        <section id="moments" className="ach-section">
          <FadeSection>
            <div className="ach-section-eyebrow">Moments Along the Journey</div>
            <h2 className="ach-section-h2">
              The real thing,<br />
              <span className="al-h1-accent">behind the slides.</span>
            </h2>
            <p className="ach-section-sub">
              Stages, classrooms, campuses — the places where Atyant's story
              took shape.
            </p>
          </FadeSection>

          <FadeSection delay={100}>
            <div className="ach-gallery">
              <GalleryImg
                src="/team.png"
                alt="On stage at Hult Prize IIT Bombay 2026"
                aspect="wide"
                onClick={openLightbox}
              />
              <GalleryImg
                src="/founders.png"
                alt="Atyant founders at the event"
                aspect="portrait"
                onClick={openLightbox}
              />
              <GalleryImg
                src="/pitch-presentation.png"
                alt="Atyant pitch presentation — How Atyant Works"
                aspect="square"
                onClick={openLightbox}
              />
              <GalleryImg
                src="/market-opportunity.png"
                alt="Market opportunity slide at VNIT Nagpur pitch"
                aspect="square"
                onClick={openLightbox}
              />
              <GalleryImg
                src="/team-event.png"
                alt="Team Atyant at a campus event"
                aspect="wide"
                onClick={openLightbox}
              />
            </div>
          </FadeSection>
        </section>

        {/* ══════════════════════════════════
            CTA
        ══════════════════════════════════ */}
        <section className="ach-cta-section">
          <FadeSection>
            <div className="ach-cta-inner">
              <div className="ach-section-eyebrow">What's next</div>
              <h2 className="ach-cta-h2">
                Building something<br />
                <span className="al-h1-accent">serious.</span>
              </h2>
              <p className="ach-cta-sub">
                The mission is to give every engineering student in India
                the same career clarity that students at premier institutes
                take for granted.
              </p>
              <div className="ach-cta-actions">
                <button className="al-primary-btn" onClick={() => go('https://atyant.in/')}>
                  Try the Engine →
                </button>
                <button className="al-secondary-btn" onClick={() => go('/home')}>
                  Back to Home
                </button>
              </div>
            </div>
          </FadeSection>
        </section>

        {/* ── LIGHTBOX ── */}
        {lightbox && (
          <Lightbox
            src={lightbox.src}
            alt={lightbox.alt}
            onClose={() => setLightbox(null)}
          />
        )}

      </div>
    </>
  );
}
