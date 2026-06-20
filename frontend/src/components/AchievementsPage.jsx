// src/components/AchievementsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';
import './AchievementsPage.css';

function useFadeUp() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeSection({ children, delay = 0, className = '' }) {
  const [ref, visible] = useFadeUp();
  return (
    <div ref={ref} className={`fade-section ${visible ? 'fade-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
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

function Pill({ icon, label, delay = 0 }) {
  const [ref, visible] = useFadeUp();
  return (
    <span ref={ref} className={`ach-pill ${visible ? 'fade-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <span className="ach-pill-icon">{icon}</span>{label}
    </span>
  );
}

function TimelineItem({ icon, title, subtitle, date, delay = 0 }) {
  const [ref, visible] = useFadeUp();
  return (
    <div ref={ref} className={`ach-timeline-item ${visible ? 'fade-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="ach-timeline-node"><span className="ach-timeline-dot" /></div>
      <div className="ach-timeline-content">
        <span className="ach-timeline-date">{date}</span>
        <div className="ach-timeline-icon">{icon}</div>
        <h3 className="ach-timeline-title">{title}</h3>
        {subtitle && <p className="ach-timeline-sub">{subtitle}</p>}
      </div>
    </div>
  );
}

function BentoCard({ icon, title, desc, stat, statLabel, span = 1, delay = 0 }) {
  const [ref, visible] = useFadeUp();
  return (
    <div ref={ref} className={`ach-bento-card ${visible ? 'fade-visible' : ''} ${span === 2 ? 'ach-bento-span2' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
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

/* Gallery card — image on top, caption strip below, no overlap */
function GalleryImg({ src, alt, title, description, aspect, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`ach-gallery-item ach-gallery-${aspect}`} onClick={() => onClick(src, alt)}>
      <div className="ach-gallery-img-wrap">
        <img src={src} alt={alt} className={`ach-gallery-img ${loaded ? 'loaded' : ''}`} onLoad={() => setLoaded(true)} />
      </div>
      <div className="ach-gallery-caption">
        <p className="ach-gallery-caption-title">{title}</p>
        <p className="ach-gallery-caption-desc">{description}</p>
      </div>
    </div>
  );
}

const GALLERY_ITEMS = [
  { src: '/img-founders.png',      alt: 'Founding Team',                    title: 'Founding Team',                             description: 'Building Atyant with a shared vision to democratize career clarity.',            aspect: 'portrait' },
  { src: '/img-discussion.png',    alt: 'Product Discussions',              title: 'Product Discussions',                       description: 'Collaborative sessions focused on solving real student problems.',                aspect: 'wide'   },
  { src: '/hult-prize-stage.png',  alt: 'Hult Prize IIT Bombay',            title: 'Hult Prize IIT Bombay Nationals 2026',      description: "Selected among India's Top 20 startup teams at IIT Bombay.",                    aspect: 'wide'     },
  { src: '/img-vnit-ecell.png',    alt: 'Presenting at VNIT E-Cell',        title: 'Presenting at VNIT E-Cell',                 description: "Sharing Atyant's vision with aspiring founders and innovators.",                  aspect: 'square'   },
  { src: '/img-team.png',          alt: 'The Atyant Team',                  title: 'The Atyant Team',                           description: 'A growing community working towards accessible career guidance.',                 aspect: 'wide'     },
  { src: '/img-manit.png',         alt: 'MANIT Bhopal Meet',                title: 'MANIT Bhopal Meet',                         description: 'Connecting with students and understanding their career journeys.',               aspect: 'square'   },
  { src: '/img-ghrce.png',         alt: 'GHRCE Nagpur Meet',                title: 'GHRCE Nagpur Meet',                         description: 'Engaging with future engineers and ambitious learners.',                         aspect: 'wide'   },
  { src: '/img-pce.png',           alt: 'PCE Campus Visit',                 title: 'PCE Campus Visit',                          description: "Expanding Atyant's presence across engineering campuses.",                       aspect: 'square'   },
  { src: '/img-iim-mumbai.png',    alt: 'Internship at IIM Mumbai',         title: 'Internship at IIM Mumbai',                  description: 'Creating opportunities for students through meaningful experiences.',              aspect: 'square'   },
  { src: '/img-success.png',       alt: 'IIM & IIT Success Stories',        title: 'IIM Ahmedabad & IIT Mandi Success Stories', description: 'Celebrating students achieving exceptional outcomes through guidance.',           aspect: 'wide'     },
  { src: '/img-vnit-director.png', alt: 'Interaction with VNIT Leadership', title: 'Interaction with VNIT Leadership',          description: 'Discussing innovation and student-focused initiatives.',                         aspect: 'square'   },
  { src: '/img-bny.png',           alt: 'Insights from VP @ Bank of NY',    title: 'Insights from VP @ Bank of New York',       description: 'Learning from industry leaders and experienced professionals.',                  aspect: 'square'   },
];

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('atyant_theme') ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => { localStorage.setItem('atyant_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const go = (href) => {
    if (!href) return;
    if (href.startsWith('http')) window.open(href, '_blank', 'noopener,noreferrer');
    else navigate(href);
    setMenuOpen(false);
  };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <>
      <SEO title="Achievements — Atyant" description="Top 20 Hult Prize IIT Bombay, Pitch Wars Champion, Funded at VNIT Nagpur 2026." canonical="https://atyant.in/achievements" />
      <div className={`atyant-landing ach-page${theme === 'dark' ? ' dark' : ''}`}>

        {/* ANNOUNCEMENT BAR */}
        <div className="al-announce">
          <span className="al-announce-tag">New</span>
          <span>Atyant — Hult Prize Top 20, IIT Bombay Nationals 2026</span>
          <span style={{ color: 'var(--accent)', fontWeight: 800, cursor: 'pointer' }} onClick={() => scrollTo('featured')}>See the story →</span>
        </div>

        {/* HEADER */}
        <header className="al-header">
          <button className="al-brand" onClick={() => go('/home')}>
            <span className="al-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5l1.9 5.3a3 3 0 001.8 1.8l5.3 1.9-5.3 1.9a3 3 0 00-1.8 1.8L12 20.5l-1.9-5.3a3 3 0 00-1.8-1.8L3 11.5l5.3-1.9a3 3 0 001.8-1.8z" fill="currentColor" />
                <path d="M18.5 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor" opacity="0.85" />
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
            <button className="al-theme-toggle" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className="al-primary-btn" style={{ minHeight: 38, padding: '0 18px', fontSize: '0.86rem' }} onClick={() => go('https://atyant.in/')}>Try the Engine →</button>
          </div>
          <div className="al-mobile-actions">
            <button className="al-theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className="al-menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(p => !p)}><span /><span /><span /></button>
          </div>
        </header>

        {/* HERO */}
        <section className="ach-hero">
          <FadeSection>
            <div className="ach-hero-kicker"><span className="ach-hero-kicker-dot" />Milestones · 2026</div>
            <h1 className="ach-hero-h1">Recognized Across <span className="al-h1-accent">India's Leading</span> Startup Ecosystem.</h1>
            <p className="ach-hero-sub">Milestones that reflect our mission to democratize career clarity for engineering students.</p>
          </FadeSection>
          <div className="ach-pills">
            <Pill icon="🏆" label="Hult Prize IIT Bombay Top 20" delay={100} />
            <Pill icon="🥇" label="Pitch Wars Champion"           delay={180} />
            <Pill icon="💰" label="Funded at VNIT Nagpur"         delay={260} />
            <Pill icon="🚀" label="Growing Community"             delay={340} />
          </div>
        </section>

        {/* FEATURED */}
        <section id="featured" className="ach-featured">
          <FadeSection><div className="ach-featured-eyebrow">Featured Story</div></FadeSection>
          <FadeSection delay={80}>
            <div className="ach-featured-image-wrap">
              <img src="/img-team.png" alt="Team Atyant at VNIT campus event 2026" className="ach-featured-image" />
              <div className="ach-featured-caption">
                <span className="ach-featured-caption-year">2026</span>
                <div className="ach-featured-caption-body">
                  <h2 className="ach-featured-title">Top 20 — Hult Prize IIT Bombay</h2>
                  <p className="ach-featured-desc">Selected among India's most promising startups at Hult Prize IIT Bombay Nationals 2026.</p>
                </div>
              </div>
            </div>
          </FadeSection>
        </section>

        {/* RECOGNITIONS */}
        <section id="recognitions" className="ach-section">
          <FadeSection>
            <div className="ach-section-eyebrow">Recognitions</div>
            <h2 className="ach-section-h2">Built with purpose. <span className="al-h1-accent">Recognized for it.</span></h2>
          </FadeSection>
          <div className="ach-bento-grid">
            <BentoCard icon="🥇" title="Pitch Wars Champion" desc="Won the Pitch Wars competition outright — beating seasoned startup teams with a clear, mission-driven pitch." span={2} delay={0} />
            <BentoCard icon="💰" title="Funded at VNIT Nagpur" desc="Secured early-stage funding at the VNIT Nagpur entrepreneurship showcase in 2026." stat="2026" statLabel="Cohort" delay={80} />
            <BentoCard icon="🚀" title="Growing Community" desc="Over 50,000 organic site visits with zero paid acquisition — built on student word-of-mouth." stat="50K+" statLabel="Organic visits" delay={160} />
            <BentoCard icon="🎓" title="Mentoring Students Across India" desc="Engineering students from 30+ colleges — VNIT, MANIT, NIT Raipur, NIT Calicut — using Atyant for career clarity." stat="30+" statLabel="Colleges" span={2} delay={240} />
          </div>
        </section>

        {/* JOURNEY — two-column */}
        <section id="journey" className="ach-section ach-journey-section">
          <FadeSection>
            <div className="ach-section-eyebrow">The Journey</div>
            <h2 className="ach-section-h2">Every milestone, <span className="al-h1-accent">earned.</span></h2>
          </FadeSection>

          <div className="ach-journey-inner">
            {/* Left: timeline */}
            <div className="ach-timeline">
              <div className="ach-timeline-line" />
              <TimelineItem icon="🏆" title="Top 20 Hult Prize IIT Bombay"  subtitle="Selected among the most competitive early-stage impact startups in India at Hult Prize Nationals, IIT Bombay." date="April 2026"    delay={0}   />
              <TimelineItem icon="🥇" title="Pitch Wars Champion"            subtitle="Won outright at Pitch Wars — Atyant's clarity-first mission stood out among seasoned startup teams."             date="March 2026"    delay={100} />
              <TimelineItem icon="💰" title="Funded at VNIT Nagpur"          subtitle="Received early-stage funding at the VNIT Nagpur entrepreneurship showcase, validating the business model."        date="February 2026" delay={200} />
              <TimelineItem icon="🚀" title="50,000+ Organic Site Visits"    subtitle="Crossed 50K organic visits with zero paid acquisition — driven purely by student word-of-mouth."                 date="May 2026"      delay={300} />
            </div>

            {/* Right: stat panel fills void */}
            <FadeSection delay={150}>
              <div className="ach-journey-panel">
                {/* Inspirational quote */}
                <div className="ach-journey-quote">
                  <span className="ach-journey-quote-mark">"</span>
                  <p className="ach-journey-quote-text">Talent is everywhere. Career clarity is not. We're here to change that — one student at a time.</p>
                  <span className="ach-journey-quote-attr">— Atyant Founding Team</span>
                </div>

                {/* Key stats */}
                <div className="ach-journey-stats">
                  <div className="ach-journey-stat-card">
                    <span className="ach-journey-stat-num">Top 20</span>
                    <span className="ach-journey-stat-label">Hult Prize Nationals</span>
                  </div>
                  <div className="ach-journey-stat-card">
                    <span className="ach-journey-stat-num">50K+</span>
                    <span className="ach-journey-stat-label">Organic Visits</span>
                  </div>
                  <div className="ach-journey-stat-card">
                    <span className="ach-journey-stat-num">30+</span>
                    <span className="ach-journey-stat-label">Colleges</span>
                  </div>
                  <div className="ach-journey-stat-card">
                    <span className="ach-journey-stat-num">₹0</span>
                    <span className="ach-journey-stat-label">Paid Acquisition</span>
                  </div>
                </div>

                {/* Badge */}
                <div className="ach-journey-badge">
                  <span className="ach-journey-badge-icon">🏆</span>
                  <div className="ach-journey-badge-text">
                    <span className="ach-journey-badge-title">Hult Prize IIT Bombay 2026</span>
                    <span className="ach-journey-badge-sub">India's Premier Startup Competition</span>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* GALLERY */}
        <section id="moments" className="ach-section">
          <FadeSection>
            <div className="ach-section-eyebrow">Moments Along the Journey</div>
            <h2 className="ach-section-h2">The real thing, <span className="al-h1-accent">behind the slides.</span></h2>
            <p className="ach-section-sub">Stages, classrooms, campuses — the places where Atyant's story took shape.</p>
          </FadeSection>
          <FadeSection delay={80}>
            <div className="ach-gallery">
              {GALLERY_ITEMS.map((item) => (
                <GalleryImg key={item.src} {...item} onClick={(src, alt) => setLightbox({ src, alt })} />
              ))}
            </div>
          </FadeSection>
        </section>

        {/* CTA */}
        <section className="ach-cta-section">
          <FadeSection>
            <div className="ach-cta-inner">
              <div className="ach-section-eyebrow">What's next</div>
              <h2 className="ach-cta-h2">Building something <span className="al-h1-accent">serious.</span></h2>
              <p className="ach-cta-sub">The mission is to give every engineering student in India the same career clarity that students at premier institutes take for granted.</p>
              <div className="ach-cta-actions">
                <button className="al-primary-btn" onClick={() => go('https://atyant.in/')}>Try the Engine →</button>
                <button className="al-secondary-btn" onClick={() => go('/home')}>Back to Home</button>
              </div>
            </div>
          </FadeSection>
        </section>

        {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
      </div>
    </>
  );
}
