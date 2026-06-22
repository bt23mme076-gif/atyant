import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './AtyantLandingPage.css';
import "./EventsPage.css";

const EVENTS = [
  {
    id: "genai-future",
    type: "Webinar",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=1400&auto=format&fit=crop",
    dateDay: "24",
    dateMonth: "May",
    title: "Generative AI: The Future is Now",
    summary: "Explore the power of GenAI and its real-world applications.",
    dateRange: "24th May, 2025",
    mode: "Online",
    time: "6:00 PM – 7:30 PM IST",
    isFree: true,
    overview: "A live session with industry practitioners on where generative AI is headed next, and what that means for early-career engineers.",
    details: {
      "Problem Statements": "Not applicable — this is a webinar, not a competition.",
      Eligibility: "Open to everyone, no registration fee.",
      Timeline: "Single session, 6:00 PM – 7:30 PM IST on 24th May, 2025.",
      "Prizes & Rewards": "Certificate of attendance for all participants.",
      FAQs: "A recording will be shared with registered participants after the session.",
    },
  },
  {
    id: "ai-hackathon-2025",
    type: "Hackathon",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop",
    dateDay: "21",
    dateMonth: "Jun",
    title: "AI Hackathon 2025",
    summary: "Build AI solutions for real-world problems and win exciting prizes.",
    dateRange: "21st – 22nd June, 2025",
    mode: "Online",
    teamSize: "Team Size: 2 – 4 Members",
    registrationDeadline: "18th June, 2025",
    prize: "₹50,000 Prize Pool",
    isFree: false,
    shortDesc: "Join the brightest minds to solve real-world problems using AI and emerging technologies.",
    overview: "A 24-hour online hackathon where participants will build innovative AI solutions.",
    details: {
      "Problem Statements": "Five themed problem statements spanning healthcare, fintech, sustainability, education and developer tooling will be released at kickoff.",
      Eligibility: "Open to all college students (undergraduate and postgraduate) across India, in teams of 2–4 members.",
      Timeline: "Registrations close 18th June. Kickoff on 21st June, 9:00 AM IST. Submissions close 22nd June, 9:00 AM IST. Results announced 22nd June, 6:00 PM IST.",
      "Prizes & Rewards": "₹50,000 total prize pool, plus internship interview fast-tracks with sponsor companies and Atyant goodies for all finalists.",
      FAQs: "Need a team? Use our Discord to find teammates. All code must be written during the hackathon window — pre-built projects will be disqualified.",
    },
  },
  {
    id: "codesprint-5",
    type: "Competition",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1400&auto=format&fit=crop",
    dateDay: "05",
    dateMonth: "Jul",
    title: "CodeSprint 5.0",
    summary: "A coding competition to test your logic and speed.",
    dateRange: "5th July, 2025",
    mode: "Online",
    teamSize: "Team Size: 1 – 3",
    prize: "₹20,000 Prize Pool",
    isFree: false,
    overview: "A timed competitive-programming sprint across three difficulty tiers, open to solo coders and small teams.",
    details: {
      "Problem Statements": "12 algorithmic problems released at contest start, ranging from easy to hard.",
      Eligibility: "Open to individuals or teams of up to 3.",
      Timeline: "Contest runs for 3 hours starting 5th July, 5:00 PM IST.",
      "Prizes & Rewards": "₹20,000 prize pool split across top 3 individuals/teams.",
      FAQs: "Any standard language (C++, Java, Python, JS) is allowed.",
    },
  },
  {
    id: "fullstack-workshop",
    type: "Workshop",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1400&auto=format&fit=crop",
    dateDay: "19",
    dateMonth: "Jul",
    title: "Full Stack Development Workshop",
    summary: "Hands-on workshop to build modern web applications.",
    dateRange: "19th July, 2025",
    mode: "Offline | Pune",
    teamSize: "Team Size: Individual",
    isFree: true,
    overview: "A full-day, hands-on workshop covering the essentials of building and shipping a modern full-stack web application.",
    details: {
      "Problem Statements": "Not applicable — this is a guided, hands-on workshop.",
      Eligibility: "Open to all college students with basic programming knowledge.",
      Timeline: "Single day, 10:00 AM – 5:00 PM, 19th July, 2025, in Pune.",
      "Prizes & Rewards": "Certificate of completion and starter project templates for all attendees.",
      FAQs: "Bring your own laptop. Lunch and refreshments will be provided.",
    },
  },
];

const CATEGORIES = [
  { key: "all",          label: "All Events",   icon: "▦" },
  { key: "webinars",     label: "Webinars",      icon: "🎙" },
  { key: "hackathons",   label: "Hackathons",    icon: null, iconSvg: true },
  { key: "competitions", label: "Competitions",  icon: "🏆" },
  { key: "workshops",    label: "Workshops",     icon: "⚙" },
  { key: "community",    label: "Community",     icon: "👥" },
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

const FAQS = [
  {
    q: "Who can participate in the events?",
    a: "All college students across India are welcome — regardless of branch, year, or college tier. Whether you're from a Tier-1 IIT or a Tier-3 regional college, Atyant events are designed to be inclusive. Some events may have specific eligibility criteria (like being in a particular year or having a certain skill level), which will be clearly mentioned on the event page.",
  },
  {
    q: "Is there any registration fee?",
    a: "The majority of our events — including webinars, live Q&As, and most workshops — are completely free. For competitive events like hackathons or coding sprints that involve prize pools, a nominal registration fee may apply to filter serious participants. The fee, if any, is always displayed upfront on the event listing before you register.",
  },
  {
    q: "Will I get a certificate for participating?",
    a: "Yes! Every registered participant receives a digital certificate of participation after the event. For competitive events, top performers receive merit certificates or winner certificates in addition to their prizes. Certificates are issued within 5–7 working days after the event concludes and are sent to your registered email.",
  },
  {
    q: "Can I participate in more than one event?",
    a: "Absolutely — there's no cap on how many events you can register for. You're free to participate in as many events as you like, as long as their schedules don't clash. We recommend checking the event timings carefully before registering for multiple events in the same time window.",
  },
  {
    q: "How will I receive the event details?",
    a: "Once you register, a confirmation email with all event details — including the meeting link, schedule, and any pre-event preparation material — is sent to your registered email address. You can also find all your registered events on your Atyant dashboard under 'My Events'. Important updates and reminders are sent 24 hours and 1 hour before the event starts.",
  },
  {
    q: "Who can I contact for more information?",
    a: "For any queries related to events, registrations, or technical issues, reach out to our team at events@atyant.in. We typically respond within 24 hours on weekdays. For urgent issues on the day of an event, you can also reach us through the live support chat available on your dashboard. For partnership or sponsorship inquiries, write to partnerships@atyant.in.",
  },
];

const ACCORDION_ORDER = ["Overview", "Problem Statements", "Eligibility", "Timeline", "Prizes & Rewards", "FAQs"];

const GALLERY = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
];

const COLLAGE = [
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
];

export default function EventsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('atyant_theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  useEffect(() => { localStorage.setItem('atyant_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const go = (href) => {
    if (!href) return;
    if (href.startsWith('http')) { window.open(href, '_blank', 'noopener,noreferrer'); }
    else { navigate(href); }
    setMenuOpen(false);
  };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("ai-hackathon-2025");
  const [openSection, setOpenSection] = useState("Overview");
  const [openFaq, setOpenFaq] = useState(null);
  const trackRef = useRef(null);

  const filteredEvents =
    activeCategory === "all"
      ? EVENTS
      : EVENTS.filter((e) => e.type.toLowerCase() === activeCategory.replace(/s$/, ""));

  const visibleEvents = filteredEvents.length ? filteredEvents : EVENTS;
  const selectedEvent = EVENTS.find((e) => e.id === selectedId) || visibleEvents[0];

  const scrollCarousel = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  const toggleAccordion = (key) => setOpenSection((prev) => (prev === key ? null : key));
  const accordionContent = (key) =>
    key === "Overview" ? selectedEvent.overview : selectedEvent.details[key];

  return (
    <div className={`atyant-landing events-page${theme === 'dark' ? ' dark' : ''}`}>
      <div className="al-announce" style={{ display: 'none' }} />

      {/* HEADER */}
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
          <button className="al-nav-btn" onClick={() => go('/home')}>Products</button>
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
          <button className="al-primary-btn" style={{ minHeight: 38, padding: '0 18px', fontSize: '0.86rem' }} onClick={() => go('https://atyant.in/')}>Try the Engine →</button>
        </div>
        <div className="al-mobile-actions">
          <button className="al-theme-toggle" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button className="al-menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(p => !p)}><span /><span /><span /></button>
        </div>
      </header>

      {/* HERO */}
      <section className="events-hero">
        <div className="container events-hero__grid">
          <div className="events-hero__copy">
            <span className="eyebrow">Events</span>
            <h1 className="events-hero__title">
              Explore. Learn.
              <br />
              Compete. <span className="text-accent">Grow.</span>
            </h1>
            <p className="events-hero__desc">
              From hackathons to webinars, workshops to competitions – be a
              part of impactful experiences at Atyant.
            </p>
            <div className="events-hero__cta">
              <button className="btn btn--primary" onClick={() => scrollTo('all-events')}>Browse Events</button>
              <button className="btn btn--secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Host an Event
              </button>
            </div>

            <div className="stats-bar">
              {STATS.map((s) => (
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

          {/* COLLAGE */}
          <div className="events-hero__collage">
            <img src={COLLAGE[0]} alt="" className="collage-img collage-img--1" />
            <img src={COLLAGE[1]} alt="" className="collage-img collage-img--2" />
            <img src={COLLAGE[2]} alt="" className="collage-img collage-img--3" />
            <img src={COLLAGE[3]} alt="" className="collage-img collage-img--4" />
            <img src={COLLAGE[4]} alt="" className="collage-img collage-img--5" />
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <div className="category-filter container">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`category-pill ${activeCategory === c.key ? "is-active" : ""}`}
            onClick={() => setActiveCategory(c.key)}
          >
            <span className="category-pill__icon">
              {c.iconSvg ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              ) : c.icon}
            </span>
            {c.label}
          </button>
        ))}
      </div>

      {/* UPCOMING EVENTS CAROUSEL — "View all events" link removed */}
      <section className="section upcoming-events" id="all-events">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">Upcoming Events</h2>
          </div>
        </div>

        <div className="container upcoming-events__carousel">
          <button className="carousel-nav carousel-nav--prev" onClick={() => scrollCarousel(-1)} aria-label="Previous events">
            ‹
          </button>
          <div className="upcoming-events__track" ref={trackRef}>
            {visibleEvents.map((ev) => {
              const isSelected = ev.id === selectedEvent?.id;
              return (
                <article
                  key={ev.id}
                  className={`event-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(ev.id)}
                >
                  <div className="event-card__media">
                    <img src={ev.image} alt={ev.title} />
                    <span className={`event-card__badge badge--${ev.type.toLowerCase()}`}>{ev.type}</span>
                    <div className="event-card__date">
                      <span className="event-card__date-day">{ev.dateDay}</span>
                      <span className="event-card__date-month">{ev.dateMonth}</span>
                    </div>
                  </div>
                  <div className="event-card__body">
                    <h3 className="event-card__title">{ev.title}</h3>
                    <ul className="event-card__meta">
                      <li>
                        <span className="event-card__meta-icon">🕒</span>
                        {ev.time ? ev.time : ev.dateRange}
                      </li>
                      <li>
                        <span className="event-card__meta-icon">📍</span>
                        {ev.mode}
                      </li>
                    </ul>
                    <p className="event-card__summary">{ev.summary}</p>
                    <div className="event-card__footer">
                      <button
                        className={`btn btn--sm event-card__cta ${isSelected ? "btn--primary" : "btn--tinted"}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <button className="carousel-nav carousel-nav--next" onClick={() => scrollCarousel(1)} aria-label="Next events">
            ›
          </button>
        </div>
      </section>

      {/* SELECTED EVENT DETAIL */}
      {selectedEvent && (
        <section className="section event-detail detail-section">
          <div className="container event-detail__grid">
            <div className="event-detail__media">
              <span className={`event-card__badge badge--${selectedEvent.type.toLowerCase()}`}>
                {selectedEvent.type}
              </span>
              <img src={selectedEvent.image} alt={selectedEvent.title} />
            </div>

            <div className="event-detail__summary">
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.shortDesc || selectedEvent.overview}</p>
              <ul className="event-detail__facts">
                <li>📅 {selectedEvent.dateRange}</li>
                <li>📍 {selectedEvent.mode}</li>
                {selectedEvent.teamSize && <li>👥 {selectedEvent.teamSize}</li>}
                {selectedEvent.prize && <li>🏆 {selectedEvent.prize}</li>}
              </ul>
              <div className="event-detail__actions">
                <button className="btn btn--primary">Register Now</button>
                <button className="btn btn--secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>

            <div className="event-detail__accordion">
              {ACCORDION_ORDER.map((key) => (
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
                    <div className="accordion-item__content">{accordionContent(key)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PAST EVENTS GALLERY */}
      <section className="section gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">Glimpses from Past Events</h2>
          </div>
          <div className="gallery-grid">
            {GALLERY.map((src) => (
              <img key={src} src={src} alt="Past event" className="gallery-grid__img" />
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="section sponsors">
        <div className="container">
          <h2 className="section-heading">Our Sponsors &amp; Partners</h2>
          <div className="sponsors__grid">
            {SPONSORS.map((s) => (
              <div className="sponsors__logo" key={s.name}>
                <span className="sponsors__logo-icon">{s.logo}</span>
                <span className="sponsors__logo-name" style={s.nameStyle}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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
      {/* FOOTER */}
      <footer className="ep-footer">
        <div className="container ep-footer__grid">

          {/* Brand col */}
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
              Atyant is a non-profit organization dedicated to empowering youth through events, webinars, hackathons and workshops.
            </p>
            <div className="ep-footer__socials">
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
              </a>
              {/* GitHub */}
              <a href="#" aria-label="GitHub" className="ep-footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12C22 6.48 17.52 2 12 2z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="ep-footer__col">
            <h4 className="ep-footer__col-title">Quick Links</h4>
            <ul className="ep-footer__links">
              <li><a href="/home">Home</a></li>
              <li><a href="/home">About Us</a></li>
              <li><a href="/events">Events</a></li>
              <li><a href="/achievements">Achievements</a></li>
              <li><a href="/webinar">Webinars</a></li>
              <li><a href="/home">Contact Us</a></li>
            </ul>
          </div>

          {/* Event Categories */}
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

          {/* Important Contacts */}
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

          {/* Contact Us */}
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
    </div>
  );
}
