import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';
import { API_URL } from '../services/api.js';
import './AtyantLandingPage.css';
import TestimonialsMarquee from './ui/marquee';
import CollegeNetworkMap from './CollegeNetworkMap';

/* ─── DATA ─── */

const TESTIMONIALS_ROW_1 = [
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    name: 'Rohit Sharma',
    handle: 'VNIT Nagpur · Mech → SDE',
    text: 'I typed my exact confusion — mech student, no coding background — and got a verified path from someone who made the exact same switch. Saved me 3 months of wrong prep.',
  },
  {
    image: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=200&auto=format&fit=crop&q=80',
    name: 'Priya Joshi',
    handle: 'MANIT Bhopal · Secured IIM Internship',
    text: 'The AnswerCard from a MANIT senior who got an IIM internship was exactly what I needed. Specific CAT prep timeline, which sections to focus on — no generic advice.',
  },
  {
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    name: 'Arjun Mehra',
    handle: 'NIT Raipur · Placed at Razorpay',
    text: 'I was applying blindly everywhere. Atyant matched me with a senior from my college who cracked Razorpay off-campus. His exact resume and timeline worked for me too.',
  },
  {
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80',
    name: 'Sneha Kulkarni',
    handle: 'COEP Pune · Research Intern at IISc',
    text: 'Got a research internship at IISc after reading the AnswerCard from a COEP senior who did it before me. The cold email template alone was worth it.',
  },
  {
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    name: 'Karan Verma',
    handle: 'NIT Calicut · GATE AIR 38',
    text: 'Cleared GATE with AIR 38. The verified path from a senior who cleared it from the same branch gave me a week-by-week plan that actually worked.',
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80',
    name: 'Ananya Singh',
    handle: 'VIT Vellore · SDE at Microsoft',
    text: 'Every other platform gave me a generic roadmap. Atyant gave me a path from someone who cracked Microsoft from VIT. The specificity is what made the difference.',
  },
  {
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&auto=format&fit=crop&q=80',
    name: 'Vikram Patil',
    handle: 'BITS Pilani · Placed at Goldman Sachs',
    text: 'I booked a 30-minute session with a Goldman senior from BITS. Worth every rupee. He told me exactly what the quant round tests — nothing online prepares you for that.',
  },
  {
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80',
    name: 'Divya Nair',
    handle: 'NIT Trichy · MS Admit from MIT',
    text: 'Was completely lost about my MS SOP. The AnswerCard from an NIT Trichy senior who got into MIT showed me exactly what the application looked like. Life-changing.',
  },
  {
    image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&auto=format&fit=crop&q=80',
    name: 'Rahul Tiwari',
    handle: 'MANIT Bhopal · Product Manager at Flipkart',
    text: 'Switched from core engineering to product management. Found a verified path from a MANIT senior who made the exact same move. No other platform had that level of context match.',
  },
  {
    image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=80',
    name: 'Meera Krishnan',
    handle: 'PSG Tech · Data Scientist at Fractal',
    text: 'The mentor I was matched with had the same CGPA from a similar college and had broken into data science. Her exact 6-month prep plan is what I followed. Cleared interviews in 5 months.',
  },
];

const PRODUCTS = [
  {
    icon: '✦',
    tag: 'live',
    title: 'Career Clarity Engine',
    desc: 'Type your exact career confusion in plain words. Atyant matches it to a verified AnswerCard — a structured path from a senior with the same college, branch, and target outcome. Not a chatbot answer. A lived, documented journey.',
    href: 'https://atyant.in/',
    featured: true,
  },
  {
    icon: '🔗',
    tag: 'live',
    title: 'Verified Senior Sessions',
    desc: 'When an AnswerCard is not enough, book a 1:1 session with the exact senior whose path matches yours. Priced from ₹49 — because the right 30 minutes is worth more than months of guessing.',
    href: 'https://atyant.in/',
  },
  {
    icon: '📚',
    tag: 'live',
    title: 'Verified Paths Library',
    desc: 'Structured, execution-ready paths for placements, research internships, GATE, higher studies, and startups — built from real student journeys, not expert opinion.',
    href: '/career-guides',
  },
  {
    icon: '📄',
    tag: 'live',
    title: 'Resume Store',
    desc: 'ATS-optimised resume templates built from formats that actually cleared shortlists at Tier-1 companies. Vetted by placement cell alumni and hiring managers.',
    href: '/resume-store',
  },
  {
    icon: '🎓',
    tag: 'soon',
    title: 'AtyantJEE — JEE Guidance',
    desc: 'Live video and chat between JEE rank holders and current NIT and top-college students. Peer-to-peer college selection advice from people who made the choice recently.',
    href: null,
  },
  {
    icon: '🏢',
    tag: 'beta',
    title: 'Campus Partnerships',
    desc: 'A scalable career clarity layer for placement cells and TPOs — giving colleges a structured, verified alternative to generic counselling at institutional scale.',
    href: null,
  },
];

const ACHIEVEMENTS = [
  {
    icon: '🏆',
    date: 'April 2026',
    title: 'Hult Prize Top 20 — IIT Bombay',
    desc: 'Selected among the Top 20 startups nationally at Hult Prize Nationals, IIT Bombay 2026 — one of the most competitive early-stage impact startup competitions in India.',
  },
  {
    icon: '📈',
    date: 'May 2026',
    title: '50,000+ Organic Site Visits',
    desc: 'Built entirely without paid acquisition. Growth driven by student word-of-mouth across VNIT, MANIT, NIT Raipur, NIT Calicut, and 30+ other engineering colleges.',
  },
  {
    icon: '👥',
    date: 'June 2026',
    title: '2,000+ Students Onboarded',
    desc: 'Engineering students from Tier-2 and Tier-3 colleges using Atyant for placements, research internships, GATE preparation, and higher studies decisions.',
  },
  {
    icon: '🤝',
    date: 'Ongoing',
    title: '500+ Verified Seniors',
    desc: 'Professionals and alumni from Google, Goldman Sachs, IIM, IIT research labs, TATA, Infosys, and 100+ organisations — manually vetted, outcome-verified before onboarding.',
  },
  {
    icon: '🏫',
    date: 'Q2 2026',
    title: 'B2B College Pipeline Active',
    desc: 'Institutional outreach underway to 50+ Tier-2 engineering college TPOs. First MoUs expected Q3 2026. Zero campus acquisition cost after the first partnership.',
  },
  {
    icon: '📣',
    date: '2026',
    title: '1 Million+ Attention Across Platforms',
    desc: 'Over 1 million combined impressions across LinkedIn, Instagram, YouTube, and community channels — built entirely organically. No paid reach. Just a problem students relate to.',
  },
];

const EVENTS = [
  {
    month: 'JUL',
    day: '18',
    title: 'Webinar: How to Crack an IIM Internship from a Tier-2 NIT',
    desc: 'Live session with Atyant seniors who cracked consulting and finance internships from non-IIT backgrounds. Real paths, not generic prep advice.',
    type: 'Webinar',
    typeStyle: { background: 'rgba(117,103,201,0.1)', color: '#5A4CB0', border: '1px solid #CFC6EE' },
    href: '/webinar',
  },
  {
    month: 'AUG',
    day: '05',
    title: 'Workshop: Resume Clinic — ATS Optimisation for 2026 Placements',
    desc: 'Bring your resume. Leave with a reviewed version. Alumni from placement cells at top companies will walk through what actually clears shortlists.',
    type: 'Workshop',
    typeStyle: { background: 'rgba(26,158,106,0.1)', color: '#1a9e6a', border: '1px solid rgba(26,158,106,0.3)' },
    href: '/webinar',
  },
  {
    month: 'AUG',
    day: '22',
    title: 'Live Q&A: Verified Seniors — Ask Anything',
    desc: 'Open session with 5 Atyant seniors across software, core engineering, research, product, and finance roles. No topic too specific.',
    type: 'Live Q&A',
    typeStyle: { background: 'rgba(199,122,0,0.08)', color: '#c77a00', border: '1px solid rgba(199,122,0,0.25)' },
    href: '/webinar',
  },
  {
    month: 'SEP',
    day: '10',
    title: 'B2B: Campus Partnership Briefing for Placement Cells',
    desc: "For TPOs and career services heads at Tier-2 engineering colleges. Overview of Atyant's institutional clarity layer and integration model.",
    type: 'B2B',
    typeStyle: { background: 'rgba(220,38,38,0.07)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' },
    href: null,
  },
];

const APPROACH_STEPS = [
  {
    icon: '💬',
    bg: 'rgba(117,103,201,0.1)',
    title: 'Ask your exact confusion',
    desc: 'Type what is actually blocking you — in plain words. "VNIT mechanical student, want a software internship at a product company, no prior coding projects."',
  },
  {
    icon: '🗂️',
    bg: 'rgba(26,158,106,0.1)',
    title: 'Match to a verified AnswerCard',
    desc: 'Atyant retrieves a structured, documented path from a senior who navigated the same college, branch, and target — not a generic template, a lived journey.',
  },
  {
    icon: '📖',
    bg: 'rgba(199,122,0,0.08)',
    title: 'Read the path, start executing',
    desc: 'The AnswerCard gives you a concrete sequence: what to build, what to apply to, what to say, and in what order. You leave with a plan, not motivation.',
  },
  {
    icon: '📞',
    bg: 'rgba(117,103,201,0.08)',
    title: 'Book the right senior if needed',
    desc: 'If context beyond the AnswerCard is needed, book a 1:1 session with that exact senior. That session creates a richer AnswerCard for every future student like you.',
  },
];

const TEAM = [
  {
    initials: 'NR',
    name: 'Nitin Rai',
    role: 'Founder & CEO',
    college: 'VNIT Nagpur',
    desc: 'Experienced the career clarity gap firsthand as a Tier-2 student — built Atyant to fix it. Shipped 20+ real products. Hult Prize Top 20, IIT Bombay 2026.',
  },
  {
    initials: 'AP',
    name: 'Aryan Patidar',
    role: 'Co-Founder',
    college: 'VNIT Nagpur',
    desc: 'Leads business development, campus partnerships, and senior acquisition. Built the 500+ verified senior network from zero. Runs the institutional outreach engine.',
  },
];

const FAQS = [
  {
    q: 'What exactly is a career clarity engine?',
    a: "Most platforms give students information. Atyant gives them execution clarity — the specific, context-matched path a student needs to move forward. You type your real confusion, we match it to a verified AnswerCard from a senior who solved the same problem from a similar background, and you get a concrete sequence to follow. That's a clarity engine, not a chatbot or a mentor marketplace.",
  },
  {
    q: 'What is an AnswerCard?',
    a: 'An AnswerCard is a structured, documented execution path built from a real student journey. It captures what the senior actually did — what they applied to, in what order, what worked, what failed — and makes it retrievable for any future student with the same context. Every session on Atyant creates a richer AnswerCard for the next student.',
  },
  {
    q: 'How is this different from ChatGPT or a mentor marketplace?',
    a: 'ChatGPT gives generically correct answers that are not grounded in lived experience. A mentor marketplace lets you browse and cold-message strangers. Atyant starts from your exact problem, retrieves the most contextually similar verified journey, and lets you escalate to the right person only if needed. The matching is the product — not the directory.',
  },
  {
    q: 'Who are the verified seniors?',
    a: 'Every senior on Atyant is a verified alumnus or professional with documented outcomes — placements at top firms, research publications, MS admits, IIM internships, or startup exits. We manually review each profile before onboarding. No anonymous profiles, no unverified claims.',
  },
  {
    q: 'How can my college partner with Atyant?',
    a: "We offer a scalable career clarity layer for placement cells and TPOs — giving colleges structured, verified paths for every student instead of one-size-fits-all counselling. Reach out at nitin@atyant.in.",
  },
];

/* ─── ANIMATED COUNTER ── */
function AnimatedCounter({ end, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let cur = 0;
        const steps = 55;
        const inc = end / steps;
        const id = setInterval(() => {
          cur += inc;
          if (cur >= end) { setCount(end); clearInterval(id); }
          else setCount(Math.floor(cur));
        }, 1600 / steps);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Tag({ type }) {
  const map = { live: 'al-tag-live', beta: 'al-tag-beta', soon: 'al-tag-soon', new: 'al-tag-new' };
  const labels = { live: 'Live', beta: 'Beta', soon: 'Coming soon', new: 'New' };
  return <span className={`al-product-tag ${map[type] || 'al-tag-beta'}`}>{labels[type] || type}</span>;
}

/* ─── MAIN ── */
export default function AtyantLandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState(null);
  const [heroQuery, setHeroQuery] = useState('');

  const HERO_CHIPS = [
    'Become Mentor',
    'Build Skills',
    'Get Roadmap',
    'Switch Field',
    'Find My Match',
  ];

  const handleHeroSubmit = (q) => {
    const query = (q || heroQuery).trim();
    if (!query) return;
    const dest = `https://atyant.in/?q=${encodeURIComponent(query)}`;
    window.location.href = dest;
  };
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('atyant_theme')
      || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => { localStorage.setItem('atyant_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };
  const go = (href) => {
    if (!href) return;
    if (href.startsWith('http')) { window.open(href, '_blank', 'noopener,noreferrer'); }
    else { navigate(href); }
    setMenuOpen(false);
  };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch (_) { }
    setSubscribed(true);
    showToast('Subscribed. Updates coming your way.');
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Atyant',
    url: 'https://atyant.in/',
    logo: 'https://atyant.in/favicon.png',
    description: "India's career clarity engine — building structured, verified career paths for Tier-2 and Tier-3 engineering students.",
    foundingDate: '2024',
    founder: [
      { '@type': 'Person', name: 'Nitin Rai', jobTitle: 'Founder & CEO' },
      { '@type': 'Person', name: 'Aryan Patidar', jobTitle: 'Co-Founder' },
    ],
    sameAs: [
      'https://www.instagram.com/atyant.in',
      'https://www.linkedin.com/company/atyant-in/',
      'https://twitter.com/atyant_in',
    ],
    areaServed: { '@type': 'Country', name: 'India' },
  };

  return (
    <>
      <SEO
        title="Atyant — India's Career Clarity Engine for Engineering Students"
        description="Atyant matches your exact career confusion to a verified path from a senior who already lived it — same college, same branch, same target. Not a chatbot. Not a marketplace. A clarity engine."
        canonical="https://atyant.in/"
        keywords="Atyant, career clarity engine India, engineering student career guidance, Tier-2 NIT placement, verified senior sessions, AnswerCards, career confusion engineering, VNIT MANIT NIT career"
        ogImage="https://atyant.in/assets/og-banner.png"
        schema={orgSchema}
      />
      <div className={`atyant-landing${theme === 'dark' ? ' dark' : ''}`}>

        {/* ── ANNOUNCEMENT BAR ── */}
        <div className="al-announce">
          <span className="al-announce-tag">New</span>
          <span>Atyant — Hult Prize Top 20, IIT Bombay Nationals 2026</span>
          <span style={{ color: 'var(--accent)', fontWeight: 800, cursor: 'pointer' }} onClick={() => go('/achievements')}>
            Read more →
          </span>
        </div>

        {/* ── HEADER ── */}
        <header className="al-header">
          <button className="al-brand" onClick={() => navigate('/')}>
            <span className="al-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5l1.9 5.3a3 3 0 001.8 1.8l5.3 1.9-5.3 1.9a3 3 0 00-1.8 1.8L12 20.5l-1.9-5.3a3 3 0 00-1.8-1.8L3 11.5l5.3-1.9a3 3 0 001.8-1.8z" fill="currentColor"/>
                <path d="M18.5 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor" opacity="0.85"/>
              </svg>
            </span>
            अत्यanT
          </button>

          <nav className={`al-nav${menuOpen ? ' open' : ''}`}>
            <button className="al-nav-btn" onClick={() => scrollTo('products')}>Products</button>
            <button className="al-nav-btn" onClick={() => scrollTo('approach')}>How it works</button>
            <button className="al-nav-btn" onClick={() => go('/internships')}>Internships</button>
            <button className="al-nav-btn" onClick={() => scrollTo('achievements')}>Milestones</button>
            <button className="al-nav-btn" onClick={() => go('/events')}>Events</button>
            <button className="al-nav-btn" onClick={() => scrollTo('team')}>Company</button>
            <button className="al-nav-btn" onClick={() => go('/achievements')} style={{ color: 'var(--accent)', fontWeight: 900 }}>🏆 Achievements</button>
          </nav>

          <div className="al-header-actions">
            <button
              className="al-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="al-primary-btn" style={{ minHeight: 38, padding: '0 18px', fontSize: '0.86rem' }} onClick={() => go('https://atyant.in/atyantEngine')}>
              Try the Engine →
            </button>
          </div>

          <div className="al-mobile-actions">
            <button
              className="al-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="al-menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(p => !p)}>
              <span /><span /><span />
            </button>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="al-hero">
          <div className="al-hero-kicker">
            <span className="al-hero-kicker-dot" />
            India's career clarity engine for engineering students
          </div>

          <h1>
            Talent is everywhere.<br />
            <span className="al-h1-accent">Career clarity is not.</span>
          </h1>

          <p className="al-hero-sub">
            Get matched to a verified senior from your college, branch, and target — who's already lived your exact confusion.
          </p>

          {/* ── Hero Chatbox ── */}
          <div className="al-hero-chatbox">
            <div className="al-hero-input-wrap">
              <span className="al-hero-input-icon">🔍</span>
              <input
                className="al-hero-input"
                type="text"
                placeholder="Ask anything… e.g. metallurgy student, Amazon internship chahiye"
                value={heroQuery}
                onChange={e => setHeroQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleHeroSubmit()}
                autoComplete="off"
              />
              <button
                className="al-hero-input-btn"
                onClick={() => handleHeroSubmit()}
                aria-label="Ask"
              >
                →
              </button>
            </div>
            <div className="al-hero-chips">
              {HERO_CHIPS.map(chip => (
                <button
                  key={chip}
                  className="al-hero-chip"
                  onClick={() => handleHeroSubmit(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
            <p className="al-hero-chatbox-sub">
              100+ students found their path across India ·{' '}
              <button className="al-hero-see-how" onClick={() => scrollTo('approach')}>
                See how it works
              </button>
            </p>
          </div>

          <div className="al-hero-metrics">
            {[
              { end: 50000, suffix: '+', label: 'Organic visits' },
              { end: 2000, suffix: '+', label: 'Students clarified' },
              { end: 500, suffix: '+', label: 'Verified seniors' },
              { end: 30, suffix: '+', label: 'Colleges represented' },
            ].map(m => (
              <div key={m.label} className="al-metric">
                <div className="al-metric-num"><AnimatedCounter end={m.end} suffix={m.suffix} /></div>
                <div className="al-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COLLEGE NETWORK MAP ── */}
        <CollegeNetworkMap />

        {/* ── AI ENGINE DEMO ── */}
        <section className="al-engine-section">
          <div className="al-wrap">
            <div className="al-engine-window">
              <div className="al-engine-bar">
                <span className="al-engine-dot" />
                <span className="al-engine-dot" />
                <span className="al-engine-dot" />
                <span className="al-engine-bar-title">Atyant Clarity Engine</span>
                <span className="al-engine-live"><span className="al-engine-live-dot" />live</span>
              </div>
              <div className="al-engine-body">
                <div className="al-engine-prompt">
                  <span className="al-engine-tag-you">You</span>
                  <p>VNIT mechanical, final year — I want a software internship at a product company but I have no coding projects yet. What do I actually do?</p>
                </div>

                <div className="al-engine-thinking">
                  <span className="al-engine-spark">✦</span>
                  <span className="al-engine-dots"><span /><span /><span /></span>
                  matching to a verified path
                </div>

                <div className="al-engine-answer">
                  <div className="al-engine-answer-head">
                    <span className="al-engine-answer-badge">✦ AnswerCard matched</span>
                    <span className="al-engine-answer-meta">98% context match</span>
                  </div>
                  <h4>Mechanical → SDE: the 6-month path Rohit took (VNIT '23)</h4>
                  <ul>
                    <li>Built 3 portfolio projects — DSA + one full-stack app — in 90 days</li>
                    <li>Cleared OAs and landed interviews at 2 product startups</li>
                    <li>Exact resume format, application timeline, and what to skip</li>
                  </ul>
                  <div className="al-engine-answer-foot">
                    <span className="al-engine-chip">Verified senior</span>
                    <span className="al-engine-chip">Same branch</span>
                    <span className="al-engine-chip">Lived journey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="al-section" id="products">
          <div className="al-wrap">
            <div className="al-section-head">
              <p className="al-eyebrow">Products</p>
              <h2>What we're building</h2>
              <p>One company, multiple surfaces — all converging on the same problem. Career clarity should not be gated by which college you attend or which senior you happen to know.</p>
            </div>

            <div className="al-products-grid">
              {PRODUCTS.map(p => (
                <div
                  key={p.title}
                  className={`al-product-card${p.featured ? ' featured' : ''}`}
                  onClick={() => go(p.href)}
                  style={{ cursor: p.href ? 'pointer' : 'default' }}
                >
                  <div className="al-product-icon">{p.icon}</div>
                  <div className="al-product-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ margin: 0 }}>{p.title}</h3>
                      <Tag type={p.tag} />
                    </div>
                    <p>{p.desc}</p>
                  </div>
                  {p.href && <span className="al-product-arrow">→</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ROW ── */}
        <div className="al-wrap" style={{ paddingBottom: 120 }}>
          <div className="al-stats-row">
            {[
              { end: 800, suffix: '+', label: 'Verified journeys in the system' },
              { end: 49, suffix: '₹', label: 'Starting price for a senior session' },
              { end: 30, suffix: '+', label: 'Engineering colleges represented' },
              { end: 2000, suffix: '+', label: 'Students who have found clarity' },
            ].map(s => (
              <div key={s.label} className="al-stats-row-cell">
                <div className="al-stat-num"><AnimatedCounter end={s.end} suffix={s.suffix} /></div>
                <div className="al-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="al-section" id="approach" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="al-wrap">
            <div className="al-approach-grid">
              {/* Visual — 4-step flow */}
              <div className="al-approach-visual">
                {APPROACH_STEPS.map(s => (
                  <div key={s.title} className="al-approach-step">
                    <div className="al-approach-step-icon" style={{ background: s.bg }}>{s.icon}</div>
                    <div>
                      <h4>{s.title}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Copy */}
              <div className="al-approach-copy">
                <p className="al-eyebrow">The engine</p>
                <h2>Not a chatbot. Not a marketplace. A clarity engine.</h2>
                <p>
                  Generic AI gives generically correct answers. Mentor marketplaces give you a list of strangers to cold-message. Atyant does something different: it starts from your exact confusion, retrieves the most contextually similar verified journey, and lets you escalate to the right senior only when the AnswerCard is not enough.
                </p>
                <div className="al-approach-points">
                  {[
                    'Context-first matching — college, branch, year, goal, constraints',
                    'AnswerCards: structured paths from verified, lived student journeys',
                    'Paid human escalation only when clarity needs depth, not as the default',
                    'Every session builds a richer AnswerCard for the next student like you',
                  ].map(pt => (
                    <div key={pt} className="al-approach-point">
                      <span className="al-point-dot" />
                      <p>{pt}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                  <button className="al-primary-btn" onClick={() => go('https://atyant.in/atyantEngine')}>Try the Atyant Engine →</button>
                  <button className="al-outline-btn" onClick={() => go('https://atyant.in/atyantEngine')}>Find a verified senior</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MILESTONES ── */}
        <section className="al-section" id="achievements" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="al-wrap">
            <div className="al-section-head">
              <p className="al-eyebrow">Milestones</p>
              <h2>Built in college. Validated by students.</h2>
              <p>No paid acquisition. No outside funding at formation. Every number below came from students who found clarity and told someone about it.</p>
            </div>
            <div className="al-achievements-grid">
              {ACHIEVEMENTS.map(a => (
                <div key={a.title} className="al-achievement-card">
                  <span className="al-achievement-icon">{a.icon}</span>
                  <span className="al-achievement-date">{a.date}</span>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button
                className="al-secondary-btn"
                onClick={() => go('/achievements')}
                style={{ minHeight: 48, padding: '0 28px', fontSize: '0.94rem' }}
              >
                🏆 Company Achievements →
              </button>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="al-section" id="testimonials" style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
          <div className="al-wrap">
            <div className="al-section-head center">
              <p className="al-eyebrow">Testimonials</p>
              <h2>What students say after using Atyant</h2>
              <p>Real students. Real backgrounds. Real outcomes — not marketing copy.</p>
            </div>
          </div>
          <div style={{ marginTop: '40px' }}>
            <TestimonialsMarquee
              row1={TESTIMONIALS_ROW_1}
              row2={TESTIMONIALS_ROW_2}
            />
          </div>
        </section>

        {/* ── EVENTS ── */}
        <section className="al-section" id="events" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="al-wrap">
            <div className="al-section-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
              <div>
                <p className="al-eyebrow">Events</p>
                <h2 style={{ marginBottom: 0 }}>Upcoming sessions</h2>
              </div>
              <button className="al-primary-btn" style={{ minHeight: 42, padding: '0 18px', fontSize: '0.88rem' }} onClick={() => navigate('/webinar')}>
                Register →
              </button>
            </div>

            <div className="al-events-list">
              {EVENTS.map((ev, i) => (
                <div key={i} className="al-event-card" onClick={() => ev.href && go(ev.href)} style={{ cursor: ev.href ? 'pointer' : 'default' }}>
                  <div className="al-event-date-block">
                    <div className="al-event-month">{ev.month}</div>
                    <div className="al-event-day">{ev.day}</div>
                  </div>
                  <div>
                    <h3>{ev.title}</h3>
                    <p>{ev.desc}</p>
                  </div>
                  <span className="al-event-type" style={ev.typeStyle}>{ev.type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="al-section" id="team" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="al-wrap">
            <div className="al-section-head center">
              <p className="al-eyebrow">Company</p>
              <h2>Built by people who lived the problem</h2>
              <p>We are not EdTech founders who identified a market. We were the students Atyant is built for — Tier-2 college, no strong senior network, no clear execution path. We built the platform we needed.</p>
            </div>
            <div className="al-team-grid">
              {TEAM.map(t => (
                <div key={t.name} className="al-team-card">
                  <div className="al-team-avatar">{t.initials}</div>
                  <h3>{t.name}</h3>
                  <span className="al-team-role">{t.role}</span>
                  <p style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', color: 'var(--textMuted)', marginBottom: 10 }}>{t.college}</p>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="al-section" id="faq" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="al-wrap">
            <div className="al-section-head">
              <p className="al-eyebrow">FAQ</p>
              <h2>What people ask before they try it</h2>
            </div>
            <div className="al-faq-list">
              {FAQS.map((f, i) => (
                <div key={i} className="al-faq-item">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <p>{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="al-cta-section">
          <p className="al-eyebrow" style={{ justifyContent: 'center' }}>Get started</p>
          <h2>Make your future independent of your college brand.</h2>
          <p>
            The path exists. Someone with your background has already figured it out. Atyant finds them for you — and makes their journey your starting point.
          </p>
          <div className="al-cta-actions">
            <button className="al-primary-btn" onClick={() => go('https://atyant.in/atyantEngine')}>
              Try the Atyant Engine →
            </button>
          </div>

          <div style={{ marginTop: 64, maxWidth: 500, margin: '64px auto 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--textSub)', fontWeight: 600, marginBottom: 16, fontFamily: 'var(--font-serif)' }}>
              Get verified paths, career clarity research, and Atyant updates — weekly. No spam.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@college.edu"
                  required
                  style={{
                    flex: 1, minHeight: 48, padding: '0 16px', border: '1px solid var(--border)',
                    borderRadius: 10, background: 'var(--card)', color: 'var(--text)',
                    fontSize: '0.94rem', outline: 'none', fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="submit" className="al-primary-btn" style={{ minHeight: 48, whiteSpace: 'nowrap' }}>
                  Subscribe
                </button>
              </form>
            ) : (
              <p style={{ color: 'var(--green)', fontWeight: 800, fontFamily: 'var(--font-sans)' }}>You're in. Check your inbox.</p>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="al-footer">
          <div className="al-footer-top">
            <div className="al-footer-col">
              <button className="al-brand" style={{ cursor: 'default', pointerEvents: 'none', padding: 0, fontSize: '1.1rem' }}>
                <span className="al-brand-mark">A</span>
                Atyant
              </button>
              <p style={{ color: 'var(--textSub)', fontSize: '0.88rem', lineHeight: 1.72, maxWidth: 260, fontFamily: 'var(--font-serif)' }}>
                India's career clarity engine for engineering students. Ask your confusion. Get the right path.
              </p>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>VNIT Nagpur · Founded 2024</p>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>Hult Prize Top 20 · IIT Bombay 2026</p>
            </div>

            <div className="al-footer-col">
              <h4>Products</h4>
              <button className="al-footer-link" onClick={() => go('https://atyant.in/atyantEngine')}>Clarity Engine</button>
              <button className="al-footer-link" onClick={() => go('https://atyant.in/atyantEngine')}>Verified Senior Sessions</button>
              <button className="al-footer-link" onClick={() => navigate('/career-guides')}>Verified Paths</button>
              <button className="al-footer-link" onClick={() => navigate('/resume-store')}>Resume Store</button>
              <button className="al-footer-link" style={{ color: 'var(--textMuted)' }}>AtyantJEE (coming soon)</button>
            </div>

            <div className="al-footer-col">
              <h4>How it works</h4>
              <button className="al-footer-link" onClick={() => scrollTo('approach')}>The engine</button>
              <button className="al-footer-link" onClick={() => scrollTo('faq')}>FAQ</button>
              <button className="al-footer-link" onClick={() => scrollTo('products')}>All products</button>
            </div>

            <div className="al-footer-col">
              <h4>Company</h4>
              <button className="al-footer-link" onClick={() => scrollTo('team')}>Team</button>
              <button className="al-footer-link" onClick={() => scrollTo('achievements')}>Milestones</button>
              <button className="al-footer-link" onClick={() => navigate('/webinar')}>Events & Webinars</button>
            </div>
          </div>

          <div className="al-footer-bottom">
            <p>© {new Date().getFullYear()} Atyant. All rights reserved. Built in Nagpur, India.</p>
            <div className="al-footer-legal">
              <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
              <button onClick={() => navigate('/terms')}>Terms of Service</button>
            </div>
          </div>
        </footer>

        {toast && <div className="al-toast">{toast}</div>}
      </div>
    </>
  );
}

