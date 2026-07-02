import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './AtyantLandingPage.css';
import "./EventsPage.css";
import { API_URL } from '../services/api';

/* ── helpers ─────────────────────────────────────────────────────────────── */

function getTimeLeft(deadline) {
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  return {
    days:    String(Math.floor(diff / 86400000)).padStart(2, '0'),
    hours:   String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    mins:    String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
    secs:    String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    expired: diff === 0,
  };
}

/* ── micro-components ────────────────────────────────────────────────────── */

function CountdownTimer({ deadline }) {
  const [t, setT] = useState(() => getTimeLeft(deadline));
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  if (t.expired) return <span className="countdown-expired">Registration closed</span>;
  return (
    <div className="countdown">
      {[['days', t.days], ['hrs', t.hours], ['min', t.mins], ['sec', t.secs]].map(([lbl, val]) => (
        <div className="countdown__unit" key={lbl}>
          <span className="countdown__num">{val}</span>
          <span className="countdown__lbl">{lbl}</span>
        </div>
      ))}
    </div>
  );
}

function SpotsBar({ registered, total }) {
  const pct = Math.min(100, Math.round((registered / total) * 100));
  return (
    <div className="spots-bar">
      <div className="spots-bar__track">
        <div className="spots-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="spots-bar__meta">
        <span><strong>{registered}</strong> registered</span>
        <span className={pct >= 80 ? 'is-urgent' : ''}><strong>{total - registered}</strong> spots left</span>
      </div>
    </div>
  );
}

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#D97706', '#0EA5A5', '#DB2777', '#059669'];
const AVATAR_POOL   = ['RS', 'PM', 'AK', 'NV', 'SK'];

function JoiningAvatars({ count }) {
  return (
    <div className="joining">
      <div className="joining__stack">
        {AVATAR_POOL.map((ini, i) => (
          <span key={i} className="joining__av" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 5 - i }}>{ini}</span>
        ))}
      </div>
      <span className="joining__text"><strong>{count}</strong> already registered</span>
    </div>
  );
}

/* ── data ────────────────────────────────────────────────────────────────── */

const EVENTS = [
  {
    id: "genai-future",
    type: "Webinar",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=1400&auto=format&fit=crop",
    dateDay: "10", dateMonth: "Jul",
    title: "Generative AI: The Future is Now",
    summary: "Explore the power of GenAI and its real-world applications with industry practitioners.",
    dateRange: "10th July, 2026",
    mode: "Online",
    time: "6:00 PM – 7:30 PM IST",
    isFree: true,
    spotsTotal: 500, spotsRegistered: 312,
    registrationDeadline: "2026-07-08T23:59:00",
    overview: "A live session with industry practitioners on where generative AI is headed next, and what that means for early-career engineers.",
    details: {
      "Problem Statements": "Not applicable — this is a webinar, not a competition.",
      Eligibility: "Open to everyone — no registration fee, no prerequisites.",
      Timeline: "Single session, 6:00 PM – 7:30 PM IST on 10th July, 2026.",
      "Prizes & Rewards": "Certificate of attendance for all registered participants.",
      FAQs: "A recording is shared with all registered participants after the session.",
    },
  },
  {
    id: "ai-hackathon-2026",
    type: "Hackathon",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop",
    dateDay: "15", dateMonth: "Aug",
    title: "AI Hackathon 2026",
    summary: "Build AI solutions for real-world problems and win ₹50,000 in prizes.",
    dateRange: "15th – 16th August, 2026",
    mode: "Online",
    teamSize: "2 – 4 Members",
    registrationDeadline: "2026-08-12T23:59:00",
    prize: "₹50,000",
    isFree: false,
    featured: true,
    spotsTotal: 200, spotsRegistered: 147,
    shortDesc: "Join the brightest minds to solve real-world problems using AI and emerging technologies.",
    overview: "A 24-hour online hackathon where participants build innovative AI solutions across five problem domains.",
    details: {
      "Problem Statements": "Five themed problem statements spanning healthcare, fintech, sustainability, education and developer tooling — released at kickoff.",
      Eligibility: "Open to all college students (UG and PG) across India, in teams of 2–4 members.",
      Timeline: "Registrations close 12th August. Kickoff 15th August, 9:00 AM IST. Submissions close 16th August, 9:00 AM IST. Results announced 16th August, 6:00 PM IST.",
      "Prizes & Rewards": "₹50,000 total prize pool, internship interview fast-tracks with sponsors, and Atyant goodies for all finalists.",
      FAQs: "Use our Discord to find teammates. All code must be written during the hackathon window — pre-built projects are disqualified.",
    },
  },
  {
    id: "codesprint-5",
    type: "Competition",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1400&auto=format&fit=crop",
    dateDay: "05", dateMonth: "Sep",
    title: "CodeSprint 5.0",
    summary: "A timed coding competition to test your logic, speed, and problem-solving.",
    dateRange: "5th September, 2026",
    mode: "Online",
    teamSize: "1 – 3 Members",
    prize: "₹20,000",
    isFree: false,
    spotsTotal: 300, spotsRegistered: 189,
    registrationDeadline: "2026-09-03T23:59:00",
    overview: "A 3-hour competitive-programming sprint across three difficulty tiers, open to solo coders and small teams.",
    details: {
      "Problem Statements": "12 algorithmic problems at contest start, spanning easy, medium, and hard.",
      Eligibility: "Open to individuals or teams of up to 3.",
      Timeline: "Contest runs 3 hours from 5th September, 5:00 PM IST.",
      "Prizes & Rewards": "₹20,000 prize pool split across top 3 individuals/teams.",
      FAQs: "Any standard language is allowed — C++, Java, Python, JavaScript.",
    },
  },
  {
    id: "fullstack-workshop",
    type: "Workshop",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1400&auto=format&fit=crop",
    dateDay: "19", dateMonth: "Oct",
    title: "Full Stack Development Workshop",
    summary: "Hands-on full-day workshop — build and ship a complete web app from scratch.",
    dateRange: "19th October, 2026",
    mode: "Offline · Pune",
    teamSize: "Individual",
    isFree: true,
    spotsTotal: 80, spotsRegistered: 67,
    registrationDeadline: "2026-10-17T23:59:00",
    overview: "A full-day, hands-on workshop covering the essentials of building and shipping a modern full-stack web application.",
    details: {
      "Problem Statements": "Not applicable — this is a guided, hands-on workshop.",
      Eligibility: "Open to all college students with basic programming knowledge.",
      Timeline: "Single day, 10:00 AM – 5:00 PM, 19th October, 2026, Pune.",
      "Prizes & Rewards": "Certificate of completion and starter project templates for all attendees.",
      FAQs: "Bring your own laptop. Lunch and refreshments provided.",
    },
  },
];

const FEATURED_EVENT = EVENTS.find(e => e.featured) || EVENTS[0];

const CATEGORIES = [
  { key: "all",          label: "All Events",  icon: "▦" },
  { key: "webinars",     label: "Webinars",     icon: "🎙" },
  { key: "hackathons",   label: "Hackathons",   icon: null, iconSvg: true },
  { key: "competitions", label: "Competitions", icon: "🏆" },
  { key: "workshops",    label: "Workshops",    icon: "⚙" },
  { key: "community",    label: "Community",    icon: "👥" },
];

const STATS = [
  { iconKey: "users",  value: "500+", label: "Participants" },
  { iconKey: "trophy", value: "20+",  label: "Events Conducted" },
  { iconKey: "mic",    value: "15+",  label: "Industry Speakers" },
  { iconKey: "grad",   value: "10+",  label: "Colleges Involved" },
];

const STAT_ICONS = {
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  trophy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  ),
  mic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  grad: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
};

const TESTIMONIALS = [
  { initials: "RS", name: "Rohit Sharma",  college: "NIT Warangal",    color: "#7C3AED", outcome: "Won ₹20K at CodeSprint 4.0 and got shortlisted for 2 internships on the same day. Didn't expect the network effect to hit that fast." },
  { initials: "PM", name: "Priya Menon",   college: "VNIT Nagpur",     color: "#2563EB", outcome: "Got a PPO offer from a startup I met at the Full Stack Workshop. One conversation changed my entire placement season." },
  { initials: "AS", name: "Aarav Singh",   college: "MNNIT Allahabad", color: "#0EA5A5", outcome: "The GenAI webinar completely changed how I answered ML interview questions. Cleared 3 rounds the following week." },
  { initials: "SP", name: "Sneha Patil",   college: "COEP Pune",       color: "#D97706", outcome: "My team won the AI Hackathon 2025 — ₹15K + intern fast-track at a Series B startup. Best 24 hours of college." },
];

const FAQS = [
  { q: "Who can participate?",         a: "All college students across India — any branch, year, or college tier. Specific eligibility requirements, if any, are listed on the event page." },
  { q: "Is there a registration fee?", a: "Most events (webinars, workshops) are completely free. Hackathons and competitions with prize pools may have a nominal fee, always shown upfront." },
  { q: "Will I get a certificate?",    a: "Yes — every registered participant gets a digital certificate within 5–7 days after the event. Top performers also receive merit or winner certificates." },
  { q: "Can I join multiple events?",  a: "No cap — register for as many events as you like. Just check that their schedules don't clash before signing up for multiple on the same day." },
  { q: "How do I get event details?",  a: "A confirmation email with the meeting link and schedule is sent on registration. Reminders also go out 24 hours and 1 hour before the event." },
  { q: "Who do I contact for help?",   a: "Email events@atyant.in for any queries — we respond within 24 hours. For partnerships or sponsorships, write to partnerships@atyant.in." },
];

const ACCORDION_ORDER = ["Overview", "Problem Statements", "Eligibility", "Timeline", "Prizes & Rewards", "FAQs"];

const GALLERY = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
];

const SPONSORS = [
  {
    name: "Microsoft",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="22" height="22">
        <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
        <rect x="12" y="1" width="10" height="10" fill="#7fba00"/>
        <rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>
        <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
      </svg>
    ),
    nameStyle: { color: '#737373', fontWeight: 600 },
  },
  {
    name: "Google",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    nameStyle: { background: 'linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 },
  },
  {
    name: "NVIDIA",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26">
        <path d="M9.5 4.5v1.9C9.5 4.5 5.2 4.2 3 8.3c1.6-2.3 4.1-2.8 6.5-2.8V7.4L12 5.9 9.5 4.5z" fill="#76b900"/>
        <path d="M9.5 9.1v5.4c-1.5-.2-2.5-1.4-2.5-2.7 0-1.3 1-2.5 2.5-2.7zm0-1.1C7.2 8.2 5.5 9.8 5.5 11.8c0 2 1.7 3.6 4 3.8v1.1L12 18l2.5-1.3v-1.1c2.3-.2 4-1.8 4-3.8 0-2-1.7-3.6-4-3.8V7.4L12 5.9l-2.5 1.5v.6zm5 1.1c1.5.2 2.5 1.4 2.5 2.7 0 1.3-1 2.5-2.5 2.7V9.1z" fill="#76b900"/>
      </svg>
    ),
    nameStyle: { color: '#76b900', fontWeight: 800, letterSpacing: '0.05em', fontSize: 13 },
  },
  {
    name: "aws",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26">
        <path d="M6.76 10.36c0 .28.03.5.08.67.06.17.14.35.25.55.04.06.05.12.05.17 0 .08-.04.15-.14.23l-.45.3c-.06.04-.13.06-.19.06-.08 0-.15-.04-.23-.11a2.4 2.4 0 0 1-.27-.35 5.8 5.8 0 0 1-.23-.44c-.58.68-1.3 1.02-2.17 1.02-.62 0-1.11-.18-1.47-.53-.36-.35-.54-.82-.54-1.4 0-.62.22-1.12.67-1.5.45-.38 1.05-.57 1.82-.57.25 0 .51.02.79.06.28.04.57.1.87.18v-.55c0-.57-.12-.97-.35-1.2-.24-.24-.64-.35-1.22-.35-.26 0-.53.03-.8.1-.28.06-.55.14-.81.25-.12.05-.21.08-.26.09-.05.01-.09.02-.12.02-.1 0-.15-.07-.15-.22v-.35c0-.11.01-.2.05-.24.04-.05.1-.1.19-.14.26-.14.57-.25.93-.34.36-.1.74-.14 1.14-.14.87 0 1.51.2 1.92.59.4.39.61.99.61 1.78v2.35zm-3 1.12c.24 0 .49-.04.75-.13.26-.09.49-.25.69-.47.12-.14.2-.29.24-.47.05-.17.07-.38.07-.63v-.3c-.22-.05-.45-.1-.69-.13-.24-.03-.47-.05-.7-.05-.5 0-.87.1-1.11.3-.24.2-.36.48-.36.86 0 .35.09.61.27.79.18.17.43.26.77.26l.07-.03zm5.98.8c-.12 0-.2-.02-.25-.07-.05-.04-.1-.14-.14-.27l-1.56-5.13c-.04-.14-.06-.23-.06-.28 0-.11.06-.17.17-.17h.7c.13 0 .21.02.26.07.05.04.09.14.13.27l1.12 4.4 1.04-4.4c.03-.14.07-.23.12-.27.05-.05.14-.07.26-.07h.57c.13 0 .22.02.27.07.05.04.09.14.12.27l1.05 4.46 1.15-4.46c.04-.14.08-.23.13-.27.05-.05.13-.07.26-.07h.66c.12 0 .18.05.18.17 0 .03-.01.07-.02.11l-.04.17-1.6 5.13c-.04.14-.08.23-.13.27-.05.05-.14.07-.25.07h-.62c-.13 0-.22-.02-.27-.07-.05-.05-.09-.14-.12-.28l-1.04-4.3-1.03 4.29c-.03.14-.07.23-.12.28-.05.05-.14.07-.27.07h-.62zm8.77.17c-.38 0-.75-.04-1.12-.13-.37-.09-.66-.19-.85-.3-.12-.07-.2-.14-.23-.21a.53.53 0 0 1-.05-.2v-.37c0-.15.06-.22.17-.22.04 0 .08.01.12.02.04.01.1.04.17.07.23.1.48.18.75.23.28.05.55.08.83.08.44 0 .78-.08 1.02-.23.24-.15.36-.37.36-.65 0-.19-.06-.35-.18-.48-.12-.13-.35-.25-.68-.36l-.98-.3c-.49-.15-.86-.38-1.09-.68-.23-.3-.35-.63-.35-.99 0-.29.06-.54.19-.76.13-.22.3-.42.51-.57.21-.16.45-.27.73-.35.28-.08.57-.12.88-.12.15 0 .31.01.46.03.16.02.3.05.44.08.13.03.26.07.38.11.12.04.21.08.28.12.09.06.16.12.2.18.04.06.06.14.06.24v.34c0 .15-.06.23-.17.23-.06 0-.15-.03-.27-.08-.41-.19-.87-.28-1.38-.28-.4 0-.71.07-.93.2-.22.13-.33.33-.33.6 0 .19.07.36.2.49.13.13.38.26.73.37l.96.3c.48.15.83.37 1.05.65.22.28.32.6.32.96 0 .3-.06.57-.18.8-.12.24-.29.44-.51.61-.22.17-.47.3-.77.38-.31.1-.64.14-.99.14z" fill="#FF9900"/>
        <path d="M21.17 17.15c-2.56 1.9-6.28 2.9-9.48 2.9-4.49 0-8.53-1.66-11.59-4.42-.24-.22-.03-.51.26-.34 3.3 1.92 7.38 3.07 11.6 3.07 2.84 0 5.97-.59 8.85-1.81.43-.19.8.28.36.6z" fill="#FF9900"/>
        <path d="M22.2 15.97c-.33-.42-2.17-.2-3-.1-.25.03-.29-.19-.06-.35 1.47-1.03 3.88-.73 4.16-.39.28.35-.08 2.77-1.45 3.93-.21.18-.41.08-.32-.15.31-.77 1-.25.67-2.94z" fill="#FF9900"/>
      </svg>
    ),
    nameStyle: { color: '#232F3E', fontWeight: 700, fontSize: 15 },
  },
  {
    name: "ORACLE",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 4.5C7.3 4.5 3.5 8.1 3.5 12.5S7.3 20.5 12 20.5s8.5-3.6 8.5-8S16.7 4.5 12 4.5zm0 13.5c-3 0-5.5-2.4-5.5-5.5S9 7 12 7s5.5 2.4 5.5 5.5-2.5 5.5-5.5 5.5z" fill="#F80000"/>
      </svg>
    ),
    nameStyle: { color: '#F80000', fontWeight: 800, letterSpacing: '0.05em' },
  },
  {
    name: "GitHub",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12C22 6.48 17.52 2 12 2z" fill="#181717"/>
      </svg>
    ),
    nameStyle: { color: '#181717', fontWeight: 600 },
  },
  {
    name: "twilio",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2.5 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#F22F46"/>
      </svg>
    ),
    nameStyle: { color: '#F22F46', fontWeight: 700 },
  },
  {
    name: "MongoDB",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 2c-.5 3.5-1.5 4.8-2 6.2-.9 2.4-.5 4.8.5 6.8.6 1.2 1.5 2.2 1.5 2.2v3.3s.3.2.4 0v-3.3s.9-1 1.5-2.2c1-2 1.4-4.4.5-6.8-.5-1.4-1.5-2.7-2-6.2z" fill="#47A248"/>
      </svg>
    ),
    nameStyle: { color: '#47A248', fontWeight: 600 },
  },
];

/* ── RegisterModal ───────────────────────────────────────────────────────── */

const EMPTY_REG = { name: '', email: '', phone: '', college: '', yearOfStudy: '' };

function RegisterModal({ event, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_REG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId:    event.id,
          eventTitle: event.title,
          eventDate:  event.dateRange,
          eventMode:  event.mode,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      setDone(true);
      onSuccess(event.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label="Register for event">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {done ? (
          <div className="modal-success">
            <div className="modal-success__icon">✓</div>
            <h3>You're Registered!</h3>
            <p>Confirmation sent to <strong>{form.email}</strong>. Check your inbox (and spam) for event details.</p>
            <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3>Register for {event.title}</h3>
              <p>📅 {event.dateRange} &nbsp;·&nbsp; {event.mode}</p>
            </div>
            <form className="host-form" onSubmit={handleSubmit}>
              <div className="form-row form-row--2col">
                <div>
                  <label>Full Name <span className="req">*</span></label>
                  <input type="text" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div>
                  <label>Email <span className="req">*</span></label>
                  <input type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
              </div>
              <div className="form-row form-row--2col">
                <div>
                  <label>Phone <span className="req">*</span></label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
                <div>
                  <label>Year of Study</label>
                  <select value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                    <option value="">Select year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Alumni'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label>College / Institution <span className="req">*</span></label>
                <input type="text" placeholder="e.g. VNIT Nagpur" value={form.college} onChange={e => set('college', e.target.value)} required />
              </div>
              {error && <p className="form-api-error">{error}</p>}
              <div className="form-actions">
                <button type="button" className="btn btn--secondary" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Registering…' : 'Confirm Registration →'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── HostModal ────────────────────────────────────────────────────────────── */

const EMPTY_FORM = {
  eventType: '', eventName: '', date: '', mode: '', venue: '',
  attendees: '', prize: '', description: '',
  name: '', email: '', college: '', phone: '', notes: '',
};

function HostModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_URL}/api/events/host`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed.');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label="Host an Event">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {submitted ? (
          <div className="modal-success">
            <div className="modal-success__icon">✓</div>
            <h3>Application Received!</h3>
            <p>Our team will review your event proposal and get back within 48 hours at <strong>{form.email}</strong>.</p>
            <p className="modal-success__sub">We'll handle promotion, registrations, and logistics support.</p>
            <button className="btn btn--primary" style={{ marginTop: 24 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3>Host an Event on Atyant</h3>
              <p>Tell us about your event — we handle promotion, registrations, and logistics.</p>
              <div className="modal-steps">
                <span className={`modal-step-dot ${step >= 1 ? 'is-active' : ''}`}>1</span>
                <span className="modal-step-label" style={{ opacity: step === 1 ? 1 : 0.5 }}>Event Details</span>
                <span className="modal-step-line" />
                <span className={`modal-step-dot ${step >= 2 ? 'is-active' : ''}`}>2</span>
                <span className="modal-step-label" style={{ opacity: step === 2 ? 1 : 0.5 }}>Your Info</span>
              </div>
            </div>

            {step === 1 && (
              <form className="host-form" onSubmit={e => { e.preventDefault(); setStep(2); }}>
                <div className="form-row form-row--2col">
                  <div>
                    <label>Event Type <span className="req">*</span></label>
                    <select value={form.eventType} onChange={e => set('eventType', e.target.value)} required>
                      <option value="">Select type</option>
                      {['Hackathon', 'Webinar', 'Workshop', 'Competition', 'Community Event'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Mode <span className="req">*</span></label>
                    <select value={form.mode} onChange={e => set('mode', e.target.value)} required>
                      <option value="">Select</option>
                      {['Online', 'Offline', 'Hybrid'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <label>Event Name <span className="req">*</span></label>
                  <input type="text" placeholder="e.g. DevSprint 2026" value={form.eventName} onChange={e => set('eventName', e.target.value)} required />
                </div>
                <div className="form-row form-row--2col">
                  <div>
                    <label>Event Date <span className="req">*</span></label>
                    <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                  </div>
                  <div>
                    <label>Expected Attendees <span className="req">*</span></label>
                    <input type="number" min="1" placeholder="e.g. 200" value={form.attendees} onChange={e => set('attendees', e.target.value)} required />
                  </div>
                </div>
                {(form.mode === 'Offline' || form.mode === 'Hybrid') && (
                  <div className="form-row">
                    <label>Venue / City <span className="req">*</span></label>
                    <input type="text" placeholder="e.g. VNIT Nagpur, Seminar Hall" value={form.venue} onChange={e => set('venue', e.target.value)} required />
                  </div>
                )}
                <div className="form-row">
                  <label>Prize Pool <span className="form-optional">(optional)</span></label>
                  <input type="text" placeholder="e.g. ₹25,000" value={form.prize} onChange={e => set('prize', e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Event Description <span className="req">*</span></label>
                  <textarea rows={4} placeholder="What is your event about? What will participants gain?" value={form.description} onChange={e => set('description', e.target.value)} required />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn btn--primary">Next: Your Info →</button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="host-form" onSubmit={handleFinalSubmit}>
                <div className="form-row form-row--2col">
                  <div>
                    <label>Your Name <span className="req">*</span></label>
                    <input type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div>
                    <label>Email <span className="req">*</span></label>
                    <input type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>
                <div className="form-row form-row--2col">
                  <div>
                    <label>College / Organization <span className="req">*</span></label>
                    <input type="text" placeholder="e.g. VNIT Nagpur" value={form.college} onChange={e => set('college', e.target.value)} required />
                  </div>
                  <div>
                    <label>Phone <span className="req">*</span></label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <label>Anything else? <span className="form-optional">(optional)</span></label>
                  <textarea rows={3} placeholder="Sponsors, special requirements, existing partnerships..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>
                {apiError && <p className="form-api-error">{apiError}</p>}
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setStep(1)} disabled={loading}>← Back</button>
                  <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────────────────── */

export default function EventsPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('atyant_theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  useEffect(() => { localStorage.setItem('atyant_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  /* registrations — persisted to localStorage after API confirm */
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('atyant_registered') || '[]')); }
    catch { return new Set(); }
  });
  const markRegistered = (eventId) => {
    setRegisteredEvents(prev => {
      const next = new Set(prev);
      next.add(eventId);
      localStorage.setItem('atyant_registered', JSON.stringify([...next]));
      return next;
    });
  };

  const [showRegModal, setShowRegModal] = useState(false);
  const [regEvent, setRegEvent] = useState(null);
  const handleRegister = (eventObj, e) => {
    if (e) e.stopPropagation();
    if (registeredEvents.has(eventObj.id)) return; // already registered — no-op
    setRegEvent(eventObj);
    setShowRegModal(true);
  };

  const [showHostModal, setShowHostModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("ai-hackathon-2026");
  const [openSection, setOpenSection] = useState("Overview");
  const [openFaq, setOpenFaq] = useState(null);
  const [shareToast, setShareToast] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const trackRef = useRef(null);
  const heroRef  = useRef(null);

  /* sticky bar on mobile — appears when hero scrolls out of view */
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const filteredEvents = activeCategory === "all"
    ? EVENTS
    : EVENTS.filter(e => e.type.toLowerCase() === activeCategory.replace(/s$/, ""));

  /* auto-select first event in category when filter changes */
  useEffect(() => {
    if (filteredEvents.length && !filteredEvents.find(e => e.id === selectedId)) {
      setSelectedId(filteredEvents[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const selectedEvent = EVENTS.find(e => e.id === selectedId) || EVENTS[0];

  const go = (href) => {
    if (!href) return;
    href.startsWith('http') ? window.open(href, '_blank', 'noopener,noreferrer') : navigate(href);
    setMenuOpen(false);
  };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };
  const scrollCarousel = (dir) => { trackRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" }); };
  const toggleAccordion = (key) => setOpenSection(prev => prev === key ? null : key);
  const accordionContent = (key) => key === "Overview" ? selectedEvent.overview : selectedEvent.details?.[key];

  const handleShare = async () => {
    const data = { title: selectedEvent.title, text: `${selectedEvent.title} — ${selectedEvent.dateRange}`, url: window.location.href };
    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
    } catch { /* user cancelled */ }
    try { await navigator.clipboard.writeText(`${data.text}\n${data.url}`); } catch { /* unsupported */ }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className={`atyant-landing events-page${theme === 'dark' ? ' dark' : ''}`}>
      <div className="al-announce" style={{ display: 'none' }} />

      {/* ── HEADER ── */}
      <header className="al-header">
        <button className="al-brand" onClick={() => go('/')}>
          <span className="al-brand-mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5l1.9 5.3a3 3 0 001.8 1.8l5.3 1.9-5.3 1.9a3 3 0 00-1.8 1.8L12 20.5l-1.9-5.3a3 3 0 00-1.8-1.8L3 11.5l5.3-1.9a3 3 0 001.8-1.8z" fill="currentColor"/>
              <path d="M18.5 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor" opacity="0.85"/>
            </svg>
          </span>
          अत्यanT
        </button>
        <nav className={`al-nav${menuOpen ? ' open' : ''}`}>
          <button className="al-nav-btn" onClick={() => go('/')}>Products</button>
          <button className="al-nav-btn" onClick={() => scrollTo('approach')}>How it works</button>
          <button className="al-nav-btn" onClick={() => go('/achievements')}>Milestones</button>
          <button className={`al-nav-btn ${location.pathname === '/events' ? 'is-active' : ''}`} onClick={() => go('/events')}>Events</button>
          <button className="al-nav-btn" onClick={() => scrollTo('team')}>Company</button>
          <button className="al-nav-btn" onClick={() => go('/achievements')} style={{ color: 'var(--accent)', fontWeight: 900 }}>🏆 Achievements</button>
        </nav>
        <div className="al-header-actions">
          <button className="al-theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="al-primary-btn" style={{ minHeight: 38, padding: '0 18px', fontSize: '0.86rem' }} onClick={() => go('https://atyant.in/atyantEngine')}>Try the Engine →</button>
        </div>
        <div className="al-mobile-actions">
          <button className="al-theme-toggle" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button className="al-menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(p => !p)}><span /><span /><span /></button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="events-hero" ref={heroRef}>
        <div className="container events-hero__grid">
          <div className="events-hero__copy">
            <span className="eyebrow">
              {FEATURED_EVENT.title} · Registration closes in 3 days
            </span>
            <h1 className="events-hero__title">
              Explore. Learn.
              <br />
              Compete. <span className="text-accent">Grow.</span>
            </h1>
            <p className="events-hero__desc">
              From hackathons to webinars, workshops to competitions — be part of impactful experiences at Atyant.
            </p>
            <div className="events-hero__cta">
              <button className="btn btn--primary" onClick={() => scrollTo('all-events')}>Browse Events</button>
              <button className="btn btn--secondary" onClick={() => setShowHostModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Host an Event
              </button>
            </div>
            <div className="stats-bar">
              {STATS.map(s => (
                <div className="stats-bar__item" key={s.label}>
                  <span className="stats-bar__icon">{STAT_ICONS[s.iconKey]}</span>
                  <div>
                    <div className="stats-bar__value">{s.value}</div>
                    <div className="stats-bar__label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURED EVENT CARD (replaces collage) */}
          <div className="hero-featured">
            <div className="hero-featured__card">
              <div className="hero-featured__media">
                <img src={FEATURED_EVENT.image} alt={FEATURED_EVENT.title} />
                <div className="hero-featured__overlay" />
                <span className="hero-featured__star-tag">⭐ Featured Event</span>
                <span className={`event-card__badge badge--${FEATURED_EVENT.type.toLowerCase()} hero-featured__type-badge`}>
                  {FEATURED_EVENT.type}
                </span>
              </div>
              <div className="hero-featured__body">
                <div className="hero-featured__top">
                  <h3 className="hero-featured__title">{FEATURED_EVENT.title}</h3>
                  {FEATURED_EVENT.prize && (
                    <span className="hero-featured__prize">🏆 {FEATURED_EVENT.prize}</span>
                  )}
                </div>
                <p className="hero-featured__meta">📅 {FEATURED_EVENT.dateRange} &nbsp;·&nbsp; {FEATURED_EVENT.mode}</p>
                <div className="hero-featured__countdown-row">
                  <span className="hero-featured__countdown-label">Registration closes in</span>
                  <CountdownTimer deadline={FEATURED_EVENT.registrationDeadline} />
                </div>
                <SpotsBar registered={FEATURED_EVENT.spotsRegistered} total={FEATURED_EVENT.spotsTotal} />
                <button
                  className={`btn hero-featured__cta ${registeredEvents.has(FEATURED_EVENT.id) ? 'btn--registered' : 'btn--primary'}`}
                  onClick={e => handleRegister(FEATURED_EVENT, e)}
                >
                  {registeredEvents.has(FEATURED_EVENT.id) ? '✓ Registered!' : 'Register Now →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <div className="category-filter container">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`category-pill ${activeCategory === c.key ? "is-active" : ""}`}
            onClick={() => setActiveCategory(c.key)}
          >
            <span className="category-pill__icon">
              {c.iconSvg ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              ) : c.icon}
            </span>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── UPCOMING EVENTS CAROUSEL ── */}
      <section className="section upcoming-events" id="all-events">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">Upcoming Events</h2>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="container events-empty">
            <div className="events-empty__icon">📭</div>
            <p>No events in this category right now.</p>
            <button className="btn btn--secondary btn--sm" onClick={() => setActiveCategory('all')}>Browse all events</button>
          </div>
        ) : (
          <div className="container upcoming-events__carousel">
            <button className="carousel-nav carousel-nav--prev" onClick={() => scrollCarousel(-1)} aria-label="Previous events">‹</button>
            <div className="upcoming-events__track" ref={trackRef}>
              {filteredEvents.map(ev => {
                const isSelected = ev.id === selectedId;
                const isReg = registeredEvents.has(ev.id);
                return (
                  <article
                    key={ev.id}
                    className={`event-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedId(ev.id)}
                  >
                    <div className="event-card__media">
                      <img src={ev.image} alt={ev.title} />
                      <div className="event-card__badges">
                        <span className={`event-card__badge badge--${ev.type.toLowerCase()}`}>{ev.type}</span>
                        <span className={`event-card__price-badge ${ev.isFree ? 'badge--free' : 'badge--paid'}`}>
                          {ev.isFree ? 'FREE' : 'PAID'}
                        </span>
                      </div>
                      <div className="event-card__date">
                        <span className="event-card__date-day">{ev.dateDay}</span>
                        <span className="event-card__date-month">{ev.dateMonth}</span>
                      </div>
                    </div>
                    <div className="event-card__body">
                      {ev.prize && <div className="event-card__prize-chip">🏆 {ev.prize} Prize Pool</div>}
                      <h3 className="event-card__title">{ev.title}</h3>
                      <ul className="event-card__meta">
                        <li><span className="event-card__meta-icon">🕒</span>{ev.time || ev.dateRange}</li>
                        <li><span className="event-card__meta-icon">📍</span>{ev.mode}</li>
                      </ul>
                      <SpotsBar registered={ev.spotsRegistered} total={ev.spotsTotal} />
                      <div className="event-card__footer">
                        <button
                          className={`btn btn--sm event-card__cta ${isReg ? 'btn--registered' : isSelected ? 'btn--primary' : 'btn--tinted'}`}
                          onClick={e => handleRegister(ev, e)}
                        >
                          {isReg ? '✓ Registered!' : 'Register Now'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <button className="carousel-nav carousel-nav--next" onClick={() => scrollCarousel(1)} aria-label="Next events">›</button>
          </div>
        )}
      </section>

      {/* ── SELECTED EVENT DETAIL ── */}
      {selectedEvent && (
        <section className="section event-detail detail-section">
          <div className="container event-detail__grid">
            <div className="event-detail__media">
              <span className={`event-card__badge badge--${selectedEvent.type.toLowerCase()}`}>{selectedEvent.type}</span>
              <img src={selectedEvent.image} alt={selectedEvent.title} />
            </div>

            <div className="event-detail__summary">
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.shortDesc || selectedEvent.overview}</p>
              <ul className="event-detail__facts">
                <li>📅 {selectedEvent.dateRange}</li>
                <li>📍 {selectedEvent.mode}</li>
                {selectedEvent.teamSize && <li>👥 {selectedEvent.teamSize}</li>}
                {selectedEvent.prize && <li>🏆 {selectedEvent.prize} Prize Pool</li>}
              </ul>
              <JoiningAvatars count={selectedEvent.spotsRegistered} />
              <div className="event-detail__actions">
                <button
                  className={`btn ${registeredEvents.has(selectedEvent.id) ? 'btn--registered' : 'btn--primary'}`}
                  onClick={e => handleRegister(selectedEvent, e)}
                >
                  {registeredEvents.has(selectedEvent.id) ? '✓ Registered!' : 'Register Now'}
                </button>
                <button className="btn btn--secondary" onClick={handleShare}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  {shareToast ? '✓ Copied!' : 'Share'}
                </button>
              </div>
            </div>

            <div className="event-detail__accordion">
              {ACCORDION_ORDER.map(key => {
                const content = accordionContent(key);
                if (!content) return null;
                return (
                  <div className="accordion-item" key={key}>
                    <button
                      className="accordion-item__trigger"
                      onClick={() => toggleAccordion(key)}
                      aria-expanded={openSection === key}
                    >
                      {key}
                      <span className={`chev ${openSection === key ? "is-open" : ""}`}>⌄</span>
                    </button>
                    {openSection === key && (
                      <div className="accordion-item__content">{content}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">What Students Are Saying</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-card__stars">{'★'.repeat(t.stars)}</div>
                <p className="testimonial-card__text">"{t.outcome}"</p>
                <div className="testimonial-card__author">
                  <span className="testimonial-card__av" style={{ background: t.color }}>{t.initials}</span>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__college">{t.college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAST EVENTS GALLERY ── */}
      <section className="section gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">Glimpses from Past Events</h2>
          </div>
          <div className="gallery-grid">
            {GALLERY.map(src => (
              <img key={src} src={src} alt="Past event" className="gallery-grid__img" />
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONSORS ── */}
      <section className="section sponsors">
        <div className="container">
          <h2 className="section-heading">Our Sponsors &amp; Partners</h2>
          <div className="sponsors__grid">
            {SPONSORS.map(s => (
              <div className="sponsors__logo" key={s.name}>
                <span className="sponsors__logo-icon">{s.logo}</span>
                <span className="sponsors__logo-name" style={s.nameStyle}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section faq-section">
        <div className="container">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <div className="faq__grid">
            {FAQS.map((item, i) => (
              <div className="faq__item" key={item.q}>
                <button
                  className="faq__trigger"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className={`chev ${openFaq === i ? "is-open" : ""}`}>⌄</span>
                </button>
                {openFaq === i && <div className="faq__content">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ep-footer">
        <div className="container ep-footer__grid">
          <div className="ep-footer__brand">
            <div className="ep-footer__logo">
              <span className="ep-footer__logo-mark">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="22" height="22">
                  <path d="M12 2.5l1.9 5.3a3 3 0 001.8 1.8l5.3 1.9-5.3 1.9a3 3 0 00-1.8 1.8L12 20.5l-1.9-5.3a3 3 0 00-1.8-1.8L3 11.5l5.3-1.9a3 3 0 001.8-1.8z" fill="currentColor"/>
                  <path d="M18.5 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor" opacity="0.85"/>
                </svg>
              </span>
              <span className="ep-footer__logo-name">अत्यanT</span>
            </div>
            <p className="ep-footer__tagline">
              Atyant is dedicated to empowering engineering students through events, webinars, hackathons and workshops.
            </p>
            <div className="ep-footer__socials">
              <a href="#" aria-label="LinkedIn" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
              </a>
              <a href="#" aria-label="GitHub" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12C22 6.48 17.52 2 12 2z"/></svg>
              </a>
            </div>
          </div>

          <div className="ep-footer__col">
            <h4 className="ep-footer__col-title">Quick Links</h4>
            <ul className="ep-footer__links">
              <li><a href="/">Home</a></li>
              <li><a href="/">About Us</a></li>
              <li><a href="/events">Events</a></li>
              <li><a href="/achievements">Achievements</a></li>
              <li><a href="/webinar">Webinars</a></li>
              <li><a href="/">Contact Us</a></li>
            </ul>
          </div>

          <div className="ep-footer__col">
            <h4 className="ep-footer__col-title">Event Categories</h4>
            <ul className="ep-footer__links">
              <li><a href="/events">Hackathons</a></li>
              <li><a href="/events">Webinars</a></li>
              <li><a href="/events">Competitions</a></li>
              <li><a href="/events">Workshops</a></li>
              <li><a href="/events">Community Events</a></li>
            </ul>
          </div>

          <div className="ep-footer__col">
            <h4 className="ep-footer__col-title">Important Contacts</h4>
            <ul className="ep-footer__contacts">
              <li>
                <span className="ep-footer__contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <div>
                  <div className="ep-footer__contact-label">Events Coordinator</div>
                  <div className="ep-footer__contact-value">events@atyant.in</div>
                </div>
              </li>
              <li>
                <span className="ep-footer__contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </span>
                <div>
                  <div className="ep-footer__contact-label">Community Lead</div>
                  <div className="ep-footer__contact-value">community@atyant.in</div>
                </div>
              </li>
              <li>
                <span className="ep-footer__contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </span>
                <div>
                  <div className="ep-footer__contact-label">Partnerships</div>
                  <div className="ep-footer__contact-value">partnerships@atyant.in</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="ep-footer__col">
            <h4 className="ep-footer__col-title">Contact Us</h4>
            <ul className="ep-footer__contacts">
              <li>
                <span className="ep-footer__contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <div className="ep-footer__contact-value">hackathon@atyant.in</div>
              </li>
              <li>
                <span className="ep-footer__contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <div className="ep-footer__contact-value">+91 98765 43210</div>
              </li>
              <li>
                <span className="ep-footer__contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div className="ep-footer__contact-value">Nagpur, Maharashtra, India</div>
              </li>
            </ul>
          </div>
        </div>
        <div className="ep-footer__bottom">
          © 2025 Atyant. All rights reserved.
        </div>
      </footer>

      {/* ── STICKY REGISTER BAR (mobile only) ── */}
      {showStickyBar && selectedEvent && (
        <div className="sticky-register-bar">
          <span className="sticky-register-bar__title">{selectedEvent.title}</span>
          <button
            className={`btn btn--sm ${registeredEvents.has(selectedEvent.id) ? 'btn--registered' : 'btn--primary'}`}
            onClick={e => handleRegister(selectedEvent, e)}
          >
            {registeredEvents.has(selectedEvent.id) ? '✓ Registered!' : 'Register Now'}
          </button>
        </div>
      )}

      {/* ── REGISTER MODAL ── */}
      {showRegModal && regEvent && (
        <RegisterModal
          event={regEvent}
          onClose={() => { setShowRegModal(false); setRegEvent(null); }}
          onSuccess={(id) => { markRegistered(id); setShowRegModal(false); setRegEvent(null); }}
        />
      )}

      {/* ── HOST MODAL ── */}
      {showHostModal && <HostModal onClose={() => setShowHostModal(false)} />}
    </div>
  );
}
