import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpRight, Zap, Sparkles, ExternalLink, User, Video, Phone, MessageSquare, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API_URL } from '../services/api';
import { MOCK_RESPONSES, detectIntent } from '../lib/responses';
import './intelligenceTerminal.css';


// ── Star canvas ───────────────────────────────────────────────────────────────
const StarCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: 0.25 + Math.random() * 1.1, base: 0.06 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2, speed: 0.007 + Math.random() * 0.016,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        s.phase += s.speed;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.base + Math.sin(s.phase) * 0.15})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
};

// ── Ticker ────────────────────────────────────────────────────────────────────
const TICKS = [
  '🎯 Arjun cracked Google SDE · 2 hrs ago', '📚 Priya got IIM Calcutta call · 4 hrs ago',
  '🚀 Ravi secured IIT research intern · 6 hrs ago', '💼 Sneha placed at Razorpay · 8 hrs ago',
  '🏆 Mohit cleared GATE AIR 42 · 1 day ago', '✨ Tanvi got Atlassian internship · 1 day ago',
  '🎓 Karan switched Mech -> ML at Microsoft · 2 days ago', '🌟 800+ students guided this month',
];
const Ticker = () => (
  <div className="w-full overflow-hidden border-b border-border py-2 relative z-10">
    <div className="flex animate-ticker whitespace-nowrap">
      {[...TICKS, ...TICKS].map((t, i) => (
        <span key={i} className="text-[11px] font-mono text-t-3 mx-8">{t}</span>
      ))}
    </div>
  </div>
);

// ── Quick chips ───────────────────────────────────────────────────────────
const CHIPS = [
  { icon: '🎯', label: 'IIM from NIT', q: 'How do I get into IIM from VNIT Metallurgy?' },
  { icon: '🏢', label: 'Tier-3 to product', q: 'Can a Tier-3 college student get into a product company?' },
  { icon: '🤖', label: 'Mech to AI/ML', q: 'Mechanical engineer switching to AI/ML - what skills?' },
  { icon: '📄', label: 'Resume for placements', q: 'How do I build a resume that gets shortlisted for campus placements?' },
  { icon: '🔬', label: 'Research internship', q: 'How to get a research internship at IIT or IISc from a Tier-2 college?' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

function isCareerQuestion(text) {
  const t = text.toLowerCase().trim();

  // Short casual messages are NOT career questions
  if (t.length < 10) return false;
  if (['hi', 'hey', 'hello', 'hey there', 'hii', 'yo', 'sup', 'thanks', 'ok', 'sure'].includes(t)) return false;

  // Multi-word questions or detailed descriptions are likely career questions
  const questionMarkers = ['how', 'what', 'when', 'where', 'why', 'which', 'can i', 'should i', 'do i'];
  const careerKeywords = ['internship', 'placement', 'job', 'career', 'iim', 'iit', 'nit', 'gate', 'cat', 'gre',
    'resume', 'interview', 'company', 'google', 'amazon', 'microsoft', 'startup', 'mba', 'cgpa',
    'branch', 'college', 'engineer', 'software', 'data', 'product', 'ml', 'ai', 'skill', 'project',
    'portfolio', 'off-campus', 'on-campus', 'crack', 'prepare', 'study', 'learn', 'switch', 'salary',
    'package', 'transition', 'role', 'position', 'hiring', 'recruit', 'fellowship'];

  // If it's a question with career keywords, it's a career question
  const isQuestion = questionMarkers.some(m => t.includes(m));
  const hasCareerKeywords = careerKeywords.some(k => t.includes(k));

  if (isQuestion && hasCareerKeywords) return true;

  // Long text (likely detailed problem description)
  if (text.length > 80) {
    // But not if it's just rambling without career context
    return hasCareerKeywords || t.split(' ').length > 15;
  }

  return false;
}

function buildProfileContext(profile) {
  if (!profile) return null;
  const edu = profile.education?.[0] || {};
  const parts = [];
  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (edu.institutionName) parts.push(`College: ${edu.institutionName}`);
  if (edu.field) parts.push(`Branch: ${edu.field}`);
  if (edu.cgpa) parts.push(`CGPA: ${edu.cgpa}`);
  if (edu.year) parts.push(`Year: ${edu.year}`);
  if (profile.bio) parts.push(`Bio: ${profile.bio.substring(0, 120)}`);
  if (profile.interests?.length) parts.push(`Interests: ${profile.interests.slice(0, 4).join(', ')}`);
  if (profile.skills?.length) parts.push(`Skills: ${profile.skills.slice(0, 4).join(', ')}`);
  return parts.length > 0 ? parts.join(' | ') : null;
}

function getProfileCompleteness(profile) {
  if (!profile) return { score: 0, missing: ['college', 'branch', 'bio'] };
  const edu = profile.education?.[0] || {};
  const missing = [];
  if (!edu.institutionName) missing.push('college');
  if (!edu.field) missing.push('branch');
  if (!profile.bio) missing.push('bio');
  if (!edu.cgpa) missing.push('CGPA');
  return { score: Math.round(((4 - missing.length) / 4) * 100), missing };
}

// ── API layer ─────────────────────────────────────────────────────────────────
async function callGroqChat(history, profileCtx, token) {
  const systemPrompt = `You are Atyant AI - a sharp, warm career advisor for Indian engineering students.
${profileCtx ? `\nStudent profile: ${profileCtx}` : '\nStudent profile: not filled yet.'}

Conversation Flow:
1. DISCOVERY PHASE: For casual greetings or vague messages, always ask clarifying questions to understand their problem
   - Ask what career challenge they are facing
   - Ask about their college, branch, year, goals
   - Ask what specific help they need (internship? placement? domain switch? interview prep?)
2. PROBLEM UNDERSTANDING: Once you understand their problem, either:
   - Give short conversational advice (2-3 sentences)
   - OR say "Let me run this through Atyant Engine for you" if it is detailed enough

Personality rules:
- Talk like a helpful senior, not a corporate bot
- Keep replies SHORT (2-4 sentences) - one idea per message
- ALWAYS ask at least ONE question to move the conversation forward
- Reference student's college/branch/CGPA when you know it
- Be genuinely curious about their situation
- If they say "hello" or casual greeting, respond warmly and ask "What is on your mind? Career-related?"
- If profile is incomplete (<50%), mention it can unlock mentor matches
- NEVER jump to solutions without understanding their problem first
- NEVER say "As an AI" - you ARE Atyant AI`;

  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: history, systemPrompt }),
  });
  if (!res.ok) throw new Error('Groq chat failed');
  const d = await res.json();
  return d.reply || "Tell me more about your situation - college, branch, what you are aiming for?";
}

async function callIntelligenceSearch(query, profileCtx) {
  try {
    const res = await fetch(`${API_URL}/api/search/intelligence/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, profileContext: profileCtx }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function callPreviewMatch(query, token) {
  if (!token) return null;
  try {
    const title = query.length > 50 ? query.substring(0, 50) + '...' : query;
    const res = await fetch(`${API_URL}/api/questions/preview-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description: query, category: 'Tech' }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d.success ? d : null;
  } catch { return null; }
}

async function submitToEngine(query, token, mentorId = null) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/engine/submit-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ questionText: query, ...(mentorId && { preferredMentorId: mentorId }) }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function pollStatus(questionId, token, max = 5) {
  for (let i = 0; i < max; i++) {
    await new Promise(r => setTimeout(r, 2200));
    try {
      const res = await fetch(`${API_URL}/api/engine/question-status/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const d = await res.json();
      if (d.success && d.answerCard) return d;
    } catch { continue; }
  }
  return null;
}

async function getUserProfile(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ── Profile nudge ─────────────────────────────────────────────────────────
function ProfileNudge({ missing, navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="bg-bg-2 border border-signal-bdr rounded-xl p-4 flex items-start gap-3 mt-3"
    >
      <div className="w-8 h-8 bg-signal-dim border border-signal-bdr rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <User size={14} className="text-signal" />
      </div>
      <div className="flex-1">
        <div className="font-mono text-[10px] text-signal mb-1 uppercase tracking-wider">// Profile incomplete</div>
        <p className="text-t-2 text-[13px] leading-relaxed">
          To give you <span className="text-t-1 font-semibold">personalised</span> advice and match you with mentors from your exact background, I need a bit more about you.
          {' '}Missing: <span className="text-signal font-mono">{missing.join(', ')}</span>
        </p>
        <button onClick={() => navigate('/profile')}
          className="mt-3 text-xs font-mono bg-signal text-bg px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity font-bold"
        >
          Complete profile - better matches
        </button>
      </div>
    </motion.div>
  );
}

// ── Instant answer card ───────────────────────────────────────────────────────
function AnswerCardView({ answerCard, questionId, navigate }) {
  const content = answerCard?.content || answerCard?.answerContent || {};
  const mentor = answerCard?.mentor || {};
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="border border-signal-bdr bg-signal-dim rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-signal uppercase tracking-wider">⚡ Instant Answer Found</span>
        {answerCard?.matchScore && <span className="ml-auto font-mono text-signal text-sm font-bold">{answerCard.matchScore}% match</span>}
      </div>
      {mentor?.name && (
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-bg-3 flex items-center justify-center font-bold text-t-1 text-sm">
            {getInitials(mentor.name || mentor.username)}
          </div>
          <div>
            <div className="text-t-1 font-semibold text-sm">{mentor.name || mentor.username}</div>
            <div className="text-t-3 text-xs font-mono">{(mentor.expertise || []).slice(0, 2).join(' · ')}</div>
          </div>
        </div>
      )}
      {content.mainAnswer && <p className="text-t-1 text-[14px] leading-relaxed">{content.mainAnswer}</p>}
      {content.whatWorked && (
        <div className="bg-bg-2 border border-border rounded-lg p-3">
          <div className="font-mono text-[10px] text-signal mb-1 uppercase tracking-wider">// What worked</div>
          <p className="text-t-1 text-[13px] leading-relaxed">{content.whatWorked}</p>
        </div>
      )}
      {Array.isArray(content.actionableSteps) && content.actionableSteps.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-t-3 mb-2 uppercase tracking-wider">// Action plan</div>
          <div className="space-y-2">
            {content.actionableSteps.slice(0, 4).map((s, i) => (
              <div key={i} className="flex gap-3 text-[13px]">
                <span className="text-signal font-mono font-bold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-t-2">{s.description || s.step || s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => navigate(`/engine/${questionId}`)}
        className="w-full flex items-center justify-center gap-2 bg-signal text-bg font-bold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity font-mono"
      >
        <ExternalLink size={14} /> View full answer card
      </button>
    </motion.div>
  );
}

// ── Service icons ─────────────────────────────────────────────────────────────
const SERVICE_META = {
  'video-call': { icon: Video, label: 'Video Call', color: '#7C3AED' },
  'audio-call': { icon: Phone, label: 'Audio Call', color: '#0891B2' },
  'chat': { icon: MessageSquare, label: 'Chat Session', color: '#059669' },
  'answer-card': { icon: FileText, label: 'Answer Card', color: '#D97706' },
};

// ── Service popup ─────────────────────────────────────────────────────────────
function ServicePopup({ mentor, navigate, onAskQuestion, onClose }) {
  const [services, setServices] = React.useState(null); // null = loading

  React.useEffect(() => {
    if (!mentor?.isReal || !mentor?.id) { setServices([]); return; }
    fetch(`${API_URL}/api/monetization/services/mentor/${mentor.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setServices(d?.services || []))
      .catch(() => setServices([]));
  }, [mentor?.id]);

  const handleBook = (e, serviceId) => {
    e.stopPropagation();
    onClose();
    navigate(`/mentor/${mentor.id}?service=${serviceId}`);
  };

  const handleAskFree = (e) => {
    e.stopPropagation();
    onClose();
    onAskQuestion(mentor);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.72)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ duration: 0.18 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#141829', border: '1px solid #2D3748', borderRadius: '1rem', width: '100%', maxWidth: 400, margin: '0 1rem' }}
        >
          {/* Header */}
          <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid #2D3748', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#1E2541', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
              {mentor.profilePicture
                ? <img src={mentor.profilePicture} alt={mentor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'Georgia, serif', fontSize: 14 }}>{mentor.initials}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{mentor.name}</div>
              <div style={{ color: '#6B7280', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>Connect with this senior</div>
            </div>
            <button onClick={onClose} style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, lineHeight: 1 }}>
              <X size={16} />
            </button>
          </div>

          {/* Services */}
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {services === null && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#6B7280', fontSize: 13, fontFamily: 'monospace' }}>
                Loading services…
              </div>
            )}

            {services !== null && services.length > 0 && (
              <>
                <div style={{ color: '#B4BAC4', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                  Book a session
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {services.map(svc => {
                    const meta = SERVICE_META[svc.type] || SERVICE_META['chat'];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={svc._id}
                        onClick={e => handleBook(e, svc._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#1E2541', border: '1px solid #2D3748', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#4A5568'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#2D3748'}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={15} color={meta.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{svc.title || meta.label}</div>
                          {svc.duration && <div style={{ color: '#6B7280', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{svc.duration} min session</div>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ color: '#B6FF3C', fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
                            {svc.price === 0 ? 'Free' : `₹${svc.price}`}
                          </div>
                          <div style={{ color: '#6B7280', fontSize: 10, marginTop: 2 }}>Book →</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#2D3748' }} />
                  <span style={{ color: '#6B7280', fontSize: 11, fontFamily: 'monospace' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#2D3748' }} />
                </div>
              </>
            )}

            {/* Always show ask question option */}
            <button
              onClick={handleAskFree}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #B6FF3C', borderRadius: '0.625rem', padding: '0.625rem', cursor: 'pointer', color: '#B6FF3C', fontSize: 13, fontFamily: 'monospace', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(182,255,60,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Ask a question (free) →
            </button>
          </div>

          <div style={{ padding: '0.5rem 1.25rem 1rem', color: '#4A5568', fontSize: 10, fontFamily: 'monospace', textAlign: 'center' }}>
            Questions answered within 24–48 hours by this senior
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Mentor card ───────────────────────────────────────────────────────────────
function MentorCard({ mentor, index, navigate, onAsk }) {
  const [asked, setAsked] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);

  const goProfile = (e) => { e.stopPropagation(); navigate(mentor.isReal && mentor.id ? `/mentor/${mentor.id}` : '/mentors'); };

  const handleAsk = (e) => {
    e.stopPropagation();
    if (asked) return;
    setShowPopup(true);
  };

  const handleAskQuestion = (m) => {
    setAsked(true);
    onAsk(m);
  };

  const roleText = (() => {
    if (mentor.role && mentor.role !== 'Mentor · Atyant') return mentor.role;
    const parts = [];
    if (mentor.topCompanies?.length) parts.push(mentor.topCompanies[0]);
    if (mentor.primaryDomain && mentor.primaryDomain !== 'both') parts.push(mentor.primaryDomain);
    else if (mentor.primaryDomain === 'both') parts.push('Placement & Internship');
    return parts.join(' · ') || 'Mentor · Atyant';
  })();

  return (
    <>
      {showPopup && (
        <ServicePopup
          mentor={mentor}
          navigate={navigate}
          onAskQuestion={handleAskQuestion}
          onClose={() => setShowPopup(false)}
        />
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 + index * 0.07 }} onClick={goProfile}
        className={`bg-bg-2 border ${mentor.isTopMatch ? 'border-l-[3px] border-l-signal border-border' : 'border-border'} p-4 rounded-lg flex items-center gap-4 hover:border-border-2 transition-all duration-200 cursor-pointer`}
      >
        <div className="w-11 h-11 rounded-lg bg-bg-3 flex items-center justify-center text-t-1 font-bold text-sm flex-shrink-0 overflow-hidden">
          {mentor.profilePicture
            ? <img src={mentor.profilePicture} alt={mentor.name} className="w-full h-full object-cover" />
            : <span className="font-serif">{mentor.initials}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-t-1 text-[14px]">{mentor.name}</span>
            {mentor.isReal && <span className="text-[9px] font-mono bg-signal-dim text-signal border border-signal-bdr px-1.5 py-0.5 rounded">verified</span>}
          </div>
          <div className="text-xs text-t-2 font-mono mt-0.5 truncate">{roleText}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(mentor.tags || []).slice(0, 3).map((tag, ti) => (
              <span key={ti} className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${ti === 0 && mentor.isTopMatch ? 'bg-signal-dim text-signal border border-signal-bdr' : 'bg-bg-3 text-t-2'}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-signal font-mono text-xl font-bold leading-none">{mentor.matchScore}%</div>
          <button
            onClick={handleAsk}
            className={`mt-2 text-[11px] font-mono px-3 py-1 rounded transition-colors ${asked ? 'bg-signal text-bg cursor-default' : 'bg-transparent border border-signal text-signal hover:bg-signal hover:text-bg'}`}
          >
            {asked ? 'Asked ✓' : 'Ask →'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ── Loading dots ──────────────────────────────────────────────────────────
function LoadingDots({ text, steps }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-signal flex items-center justify-center rounded-sm font-serif text-bg font-bold text-xs">A</div>
        <span className="font-mono text-xs text-signal uppercase tracking-wider">AtyantEngine</span>
      </div>
      <div className="border-l-2 border-border pl-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-signal animate-dot1" />
          <div className="w-1.5 h-1.5 rounded-full bg-signal animate-dot2" />
          <div className="w-1.5 h-1.5 rounded-full bg-signal animate-dot3" />
          <span className="text-xs font-mono text-t-3 ml-1">{text}</span>
        </div>
        {steps && (
          <div className="space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className={`text-xs font-mono flex items-center gap-2 transition-colors ${s.done ? 'text-signal' : 'text-t-3'}`}>
                <span className="w-3">{s.done ? '✓' : '○'}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI message renderer ───────────────────────────────────────────────────────
function AIMessage({ msg, onFollowUp, navigate, onAskMentor }) {
  if (msg.isLoading) return <LoadingDots text={msg.loadingText || 'Thinking...'} steps={msg.loadingSteps} />;

  const r = msg.response;
  if (!r) return null;

  // Pure chat reply (no career engine result)
  if (r.type === 'chat') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-signal flex items-center justify-center rounded-sm font-serif text-bg font-bold text-xs">A</div>
          <span className="font-mono text-xs text-signal uppercase tracking-wider">Atyant AI</span>
        </div>
        <div className="border-l-2 border-border pl-5">
          <p className="text-t-1 text-[15px] leading-relaxed whitespace-pre-wrap">{r.text}</p>
          {r.showProfileNudge && r.missingFields?.length > 0 && (
            <ProfileNudge missing={r.missingFields} navigate={navigate} />
          )}
        </div>
      </motion.div>
    );
  }

  if (r.type === 'asked') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-signal flex items-center justify-center rounded-sm font-serif text-bg font-bold text-xs">A</div>
          <span className="font-mono text-xs text-signal uppercase tracking-wider">Atyant AI</span>
        </div>
        <div className="border-l-2 border-signal-bdr pl-5 space-y-3">
          <div className="bg-signal-dim border border-signal-bdr rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-signal text-lg mt-0.5">✅</span>
            <div>
              <p className="text-t-1 text-[15px] font-semibold mb-1">Question sent to {r.mentorName}!</p>
              <p className="text-t-2 text-sm leading-relaxed">
                Your senior is reviewing your question and will share their personal experience soon.
                You'll get a notification once the answer is ready.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => navigate('/my-questions')}
              className="bg-signal text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              View in My Questions →
            </button>
            <span className="text-t-3 text-xs font-mono">Redirecting in {r.countdown}s…</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full career engine result
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-signal flex items-center justify-center rounded-sm font-serif text-bg font-bold text-xs">A</div>
        <span className="font-mono text-xs text-signal uppercase tracking-wider">AtyantEngine</span>
        {r.context && <span className="ml-auto text-[11px] font-mono text-t-3">{r.context}</span>}
      </div>

      <div className="border-l-2 border-border pl-5 space-y-5">

        {/* Personalised analysis */}
        {r.analysis && <p className="text-t-1 leading-relaxed text-[15px]">{r.analysis}</p>}

        {/* Profile nudge if incomplete */}
        {r.showProfileNudge && r.missingFields?.length > 0 && (
          <ProfileNudge missing={r.missingFields} navigate={navigate} />
        )}

        {/* Verified callout */}
        {r.callout && (
          <div className="bg-signal-dim border border-signal-bdr p-4 rounded-lg font-mono text-sm">
            <div className="text-signal text-[11px] mb-2 tracking-wider">{r.callout.label}</div>
            <div className="text-t-1 leading-relaxed italic">"{r.callout.quote}"</div>
          </div>
        )}

        {/* Instant answer card */}
        {r.answerCard && r.questionId && (
          <AnswerCardView answerCard={r.answerCard} questionId={r.questionId} navigate={navigate} />
        )}

        {/* Mentor cards */}
        {r.mentors?.length > 0 && (
          <div>
            <div className="mb-3">
              <p className="text-t-1 text-[14px] font-medium mb-1">
                These are seniors who walked exactly your path 👇
              </p>
              <div className="font-mono text-[11px] text-t-3 tracking-wider">
                // talk to them directly — they have been where you are
                {r.hasRealMentors && <span className="text-signal ml-2">· verified on Atyant</span>}
              </div>
            </div>
            <div className="space-y-3">
              {r.mentors.map((m, i) => <MentorCard key={i} mentor={m} index={i} navigate={navigate} onAsk={(mentor) => onAskMentor && onAskMentor(mentor, msg.query)} />)}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => navigate(r.questionId ? `/engine/${r.questionId}` : '/ask')}
            className="inline-flex items-center gap-2 text-xs font-mono bg-signal text-bg px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-bold"
          >
            <Sparkles size={11} />
            {r.questionId ? 'View full answer card' : 'Ask a detailed question - full answer'}
          </button>
          {!r.questionId && (
            <button onClick={() => navigate('/ask')}
              className="inline-flex items-center gap-2 text-xs font-mono border border-border text-t-2 px-4 py-2 rounded-full hover:border-border-2 hover:text-t-1 transition-all"
            >
              Submit to Atyant Engine
            </button>
          )}
        </div>

        {/* Follow-up chips */}
        {r.followUps?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="font-mono text-[11px] text-t-3 mb-3 tracking-wider">// go deeper</div>
            <div className="flex flex-wrap gap-2">
              {r.followUps.map((fu, i) => (
                <button key={i} onClick={() => onFollowUp(fu)}
                  className="bg-bg-2 border border-border text-t-2 text-xs font-mono px-3 py-1.5 rounded-full hover:bg-bg-3 hover:text-t-1 hover:border-border-2 transition-all"
                >
                  {fu}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Local smart conversation engine (fallback when Groq unavailable) ──────────
function extractInfo(text) {
  const t = text.toLowerCase();
  const info = {};
  // College
  if (/vnit/.test(t)) info.college = 'VNIT Nagpur';
  else if (/iit/.test(t)) info.college = 'IIT';
  else if (/bits/.test(t)) info.college = 'BITS Pilani';
  else if (/nit/.test(t)) info.college = 'NIT';
  else if (/vit/.test(t)) info.college = 'VIT';
  else if (/iiit/.test(t)) info.college = 'IIIT';
  else if (/manipal/.test(t)) info.college = 'Manipal';
  else if (/srm/.test(t)) info.college = 'SRM';
  else if (/college|university|institute/.test(t)) info.college = 'your college';
  // Branch
  if (/\bcse\b|computer science/.test(t)) info.branch = 'CSE';
  else if (/\bece\b|electronics/.test(t)) info.branch = 'ECE';
  else if (/\bmme\b|metallurgy/.test(t)) info.branch = 'MME';
  else if (/\bmech\b|mechanical/.test(t)) info.branch = 'Mechanical';
  else if (/\bcivil\b/.test(t)) info.branch = 'Civil';
  else if (/\bee\b|electrical/.test(t)) info.branch = 'EE';
  else if (/\bchemical\b/.test(t)) info.branch = 'Chemical';
  else if (/\bit\b|information tech/.test(t)) info.branch = 'IT';
  else if (/\bai\b|\bml\b|data science/.test(t)) info.branch = 'AI/ML';
  // Year
  const yr = t.match(/([1-4])(st|nd|rd|th)?\s*year|year\s*([1-4])/);
  if (yr) info.year = (yr[1] || yr[3]) + 'th year';
  // Goal — order matters: check specific combos before generic keywords
  if (/iim.*intern|intern.*iim/.test(t)) info.goal = 'IIM research internship';
  else if (/iit.*intern|intern.*iit/.test(t)) info.goal = 'IIT research internship';
  else if (/research.*intern|intern.*research/.test(t)) info.goal = 'research internship';
  else if (/\biim\b|\bmba\b|\bcat\b/.test(t)) info.goal = 'IIM/MBA';
  else if (/gate|mtech|higher study/.test(t)) info.goal = 'higher studies';
  else if (/google|amazon|microsoft|flipkart|product company/.test(t)) info.goal = 'top tech company';
  else if (/placement|campus|job|hire/.test(t)) info.goal = 'campus placements';
  else if (/internship/.test(t)) info.goal = 'internship';
  else if (/startup/.test(t)) info.goal = 'startup';
  else if (/switch|change domain|move to tech/.test(t)) info.goal = 'domain switch';
  // CGPA
  const cgpaMatch = t.match(/cgpa[:\s]*([0-9]\.[0-9]+)|([0-9]\.[0-9]+)\s*cgpa/);
  if (cgpaMatch) info.cgpa = cgpaMatch[1] || cgpaMatch[2];
  return info;
}

function buildSmartReply(discovery, lastMsg) {
  const t = lastMsg.toLowerCase();
  const { college, branch, year, goal, cgpa } = discovery;

  // Greeting
  if (/^(hi+|hey+|hello+|hii+|sup|yo|hola)[\s!.?]*$/.test(t.trim())) {
    return " What career challenge are you working through? Tell me your situation!";
  }

  // They just told us their college
  if (college && !branch) {
    const cname = college === 'VNIT Nagpur' ? 'VNIT' : college;
    return `${cname} - nice! 🎓 What branch are you in, and what year?`;
  }

  // They told us college + branch
  if (college && branch && !goal) {
    return `${college} ${branch} - got it! What are you aiming for? IIM/MBA, campus placements, a specific company, research internship, or switching domains?`;
  }

  // They told us goal but no college yet
  if (goal && !college) {
    if (goal === 'IIM/MBA') return "IIM is a solid target! 🏆 Which college are you at, and what branch + CGPA? I want to connect you with seniors who actually cracked CAT from your background.";
    if (goal === 'IIM research internship') return "IIM research internship — that's a smart move! 🔬 Which college and branch are you from? I'll find seniors who landed IIM research stints.";
    if (goal === 'IIT research internship') return "IIT research intern is a great goal! 🔬 Which college and branch? I know seniors who got SURGE, SPARK, and similar programs.";
    if (goal === 'top tech company') return "Aiming for top tech — love it! 🚀 Which college and branch are you from? That helps me match you with seniors who cracked exactly that.";
    return "Great goal! Which college and branch are you from?";
  }

  // We have enough info - trigger engine
  if (college && branch && goal) {
    return `__TRIGGER_ENGINE__`;
  }

  // They mentioned something but we need more
  if (!college) return "Which college are you from? That'll help me find the right seniors for you.";
  if (!goal) return "What's your main goal right now - placements, IIM, internship, or something else?";

  return "Tell me more - I want to understand your full situation before matching you with seniors!";
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IntelligenceTerminal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user ? localStorage.getItem('token') : null;

  // ── Persistent storage key per user ─────────────────────────────────────────
  const storageKey = user ? `atyant_chat_${user._id || user.id || user.email}` : null;

  // Load persisted messages on mount
  const [messages, setMessages] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isIdle, setIsIdle] = useState(() => {
    // Start in chat mode if there are saved messages
    if (!storageKey) return true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const msgs = JSON.parse(saved);
        return msgs.length === 0;
      }
    } catch { }
    return true;
  });
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [discovery, setDiscovery] = useState(() => {
    if (!storageKey) return { college: null, branch: null, year: null, goal: null, cgpa: null };
    try {
      const saved = localStorage.getItem(storageKey + '_discovery');
      return saved ? JSON.parse(saved) : { college: null, branch: null, year: null, goal: null, cgpa: null };
    } catch { return { college: null, branch: null, year: null, goal: null, cgpa: null }; }
  });
  // Groq conversation history for multi-turn chat
  const [chatHistory, setChatHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load user profile on mount
  useEffect(() => {
    if (token) getUserProfile(token).then(p => { if (p) setUserProfile(p); }).catch(() => { });
  }, [token]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (!storageKey || messages.length === 0) return;
    try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch { }
  }, [messages, storageKey]);

  // Persist discovery state
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey + '_discovery', JSON.stringify(discovery)); } catch { }
  }, [discovery, storageKey]);

  // NO auto-greeting on mount — AI responds only after user's first message
  // (greeting is injected as AI's first reply in handleSubmit)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [query]);

  const setMsgField = useCallback((id, fields) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...fields } : m));
  }, []);

  // ── Main handler ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (textQuery, forceEngine = false) => {
    const q = (textQuery || query).trim();
    if (!q || isLoading) return;

    setIsIdle(false);
    setQuery('');
    setIsLoading(true);

    const userMsgId = `u-${Date.now()}`;
    const aiMsgId = `a-${Date.now() + 1}`;

    const profileCtx = buildProfileContext(userProfile);
    const { score: profileScore, missing: profileMissing } = getProfileCompleteness(userProfile);
    const isQuestion = forceEngine || isCareerQuestion(q);

    // Add user message + loading placeholder
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: q },
      { id: aiMsgId, role: 'ai', isLoading: true, loadingText: isQuestion ? 'Running Atyant Engine...' : 'Thinking...' },
    ]);

    // Update Groq chat history
    const newHistory = [...chatHistory, { role: 'user', content: q }];
    setChatHistory(newHistory);

    if (!isQuestion) {
      // ── CHAT MODE: discovery conversation, NO engine results ─────────────
      try {
        // Extract info from this message and merge with discovery state
        const newInfo = extractInfo(q);
        const updatedDiscovery = { ...discovery, ...newInfo };
        setDiscovery(updatedDiscovery);

        // Check if we now have enough info to run the engine
        const smartReply = buildSmartReply(updatedDiscovery, q);

        if (smartReply === '__TRIGGER_ENGINE__') {
          // We have college + branch + goal - auto-run engine!
          const engineQuery = `I am from ${updatedDiscovery.college}, ${updatedDiscovery.branch} branch${updatedDiscovery.year ? `, ${updatedDiscovery.year}` : ''}${updatedDiscovery.cgpa ? `, CGPA ${updatedDiscovery.cgpa}` : ''}. My goal is ${updatedDiscovery.goal}.`;

          // Show a transition message first
          const goalLabel = updatedDiscovery.goal || 'your goal';
          const collegeLabel = updatedDiscovery.college || 'your college';
          const branchLabel = updatedDiscovery.branch || 'your branch';
          setMsgField(aiMsgId, {
            isLoading: false,
            response: {
              type: 'chat',
              text: `Got everything I need! 🎯 ${collegeLabel} · ${branchLabel} · ${goalLabel}. Finding seniors who actually walked this exact path — give me a sec! 🚀`,
              showProfileNudge: false,
            },
          });
          setIsLoading(false);

          // Delay slightly then auto-trigger engine with forceEngine=true
          setTimeout(() => {
            handleSubmit(engineQuery, true);
          }, 1200);
          return;
        }

        // Try Groq for a better reply, fall back to smart local response
        let reply = smartReply;
        try {
          const groqReply = await callGroqChat(newHistory, profileCtx, token);
          if (groqReply && groqReply.length > 10) reply = groqReply;
        } catch { /* use smartReply as fallback */ }

        // On the very first message, prepend a warm greeting to the reply
        const isFirstMessage = messages.length === 0 ||
          (messages.length === 1 && messages[0].role === 'user');
        if (isFirstMessage) {
          const name = userProfile?.name || user?.name || user?.username || '';
          const firstName = name ? name.split(' ')[0] : '';
          reply = `Hey${firstName ? ` ${firstName}` : ''}! 👋 ${reply}`;
        }

        setChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);
        setMsgField(aiMsgId, {
          isLoading: false,
          response: {
            type: 'chat',
            text: reply,
            showProfileNudge: !token || profileScore < 50,
            missingFields: profileMissing,
          },
        });
      } catch (chatErr) {
        console.error('Chat mode error:', chatErr);
        setMsgField(aiMsgId, {
          isLoading: false,
          response: {
            type: 'chat',
            text: 'What career challenge are you working on? Tell me your college, branch, and goal!',
            showProfileNudge: false,
          },
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {

      // ── CAREER ENGINE MODE ────────────────────────────────────────────────
      console.log('⚙️ ENGINE MODE TRIGGERED - running full analysis and mentor matching');
      const steps = [
        { label: 'Groq AI personalising analysis...', done: false },
        { label: 'Atyant Engine matching mentors...', done: false },
        { label: 'Ranking by background similarity...', done: false },
      ];
      setMsgField(aiMsgId, { loadingSteps: steps, loadingText: 'Analysing your query...' });

      // Fire Groq + preview-match in parallel
      const [groqRes, previewRes] = await Promise.allSettled([
        callIntelligenceSearch(q, profileCtx),
        callPreviewMatch(q, token),
      ]);

      steps[0].done = true; steps[1].done = true;
      setMsgField(aiMsgId, { loadingSteps: [...steps], loadingText: 'Building personalised result...' });

      const groqData = groqRes.status === 'fulfilled' ? groqRes.value : null;
      const previewData = previewRes.status === 'fulfilled' ? previewRes.value : null;

      // Try to get instant answer card
      let questionId = null;
      let answerCard = null;

      // Questions are only submitted when the user explicitly chooses a mentor
      // No auto-submission to engine or mentors happens here

      steps[2].done = true;
      setMsgField(aiMsgId, { loadingSteps: [...steps], loadingText: 'Done' });

      // Build mentor list - real DB mentors take priority
      const intent = detectIntent(q);
      const mock = MOCK_RESPONSES[intent] || MOCK_RESPONSES.default;

      const hasRealMentors = !!(previewData?.mentors?.length || previewData?.mentor);
      let mentors;
      if (hasRealMentors) {
        const raw = previewData.mentors || (previewData.mentor ? [previewData.mentor] : []);
        mentors = raw.map((m, i) => {
          // Build rich tags from expertise + specialTags + topCompanies
          const tags = [
            ...(m.expertise || []).slice(0, 2),
            ...(m.specialTags || []).slice(0, 1),
          ].map(t => t.length > 14 ? t.slice(0, 14) : t).filter(Boolean).slice(0, 3);

          // Meaningful role: bio snippet OR topCompanies
          const role = m.bio
            ? m.bio.substring(0, 55) + (m.bio.length > 55 ? '...' : '')
            : (m.topCompanies?.[0] ? `${m.topCompanies[0]} · Mentor` : 'Mentor · Atyant');

          return {
            id: m.id,
            initials: getInitials(m.name),
            name: m.name,
            role,
            matchScore: m.matchPercentage || Math.max(76, 96 - i * 7),
            tags: tags.length ? tags : ['Mentor'],
            isTopMatch: i === 0,
            profilePicture: m.profileImage || null,
            topCompanies: m.topCompanies,
            primaryDomain: m.primaryDomain,
            isReal: true,
          };
        });
      } else {
        mentors = mock.mentors;
      }

      // Personalise analysis: inject student's college/branch into Groq text
      let analysis = groqData?.analysis || mock.analysis;
      if (profileCtx && groqData?.analysis) {
        // Analysis already personalised by backend (profileContext was sent)
      } else if (!profileCtx && groqData?.analysis) {
        // No profile - analysis is generic, that is fine
      }

      const showNudge = !token || profileScore < 50;

      const response = {
        type: 'engine',
        context: groqData?.context || mock.context,
        analysis,
        callout: groqData?.callout || mock.callout,
        followUps: groqData?.followUps || mock.followUps,
        mentors,
        hasRealMentors,
        answerCard: answerCard || null,
        questionId: questionId || null,
        showProfileNudge: showNudge,
        missingFields: profileMissing,
      };

      // Add AI reply to Groq history for continuity
      const summaryForHistory = `[Atyant Engine result for: "${q}" - analysis: ${analysis.substring(0, 100)}...]`;
      setChatHistory(prev => [...prev, { role: 'assistant', content: summaryForHistory }]);

      setMsgField(aiMsgId, { isLoading: false, query: q, response });

    } catch (err) {
      console.error('IntelligenceTerminal error:', err);
      const intent = detectIntent(q);
      const mock = MOCK_RESPONSES[intent] || MOCK_RESPONSES.default;
      setMsgField(aiMsgId, {
        isLoading: false,
        response: { type: 'engine', ...mock, hasRealMentors: false, answerCard: null, questionId: null, showProfileNudge: false },
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, token, userProfile, chatHistory, setMsgField, discovery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  // Called only when user explicitly clicks "Ask →" on a mentor card
  const handleAskMentor = useCallback(async (mentor, query) => {
    if (!token || !query) return;

    const successMsgId = `a-asked-${Date.now()}`;
    const mentorName = mentor.name || mentor.username || 'your senior';
    let countdown = 4;

    const injectSuccess = (count) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === successMsgId);
        const msg = { id: successMsgId, role: 'ai', isLoading: false, response: { type: 'asked', mentorName, countdown: count } };
        return exists ? prev.map(m => m.id === successMsgId ? msg : m) : [...prev, msg];
      });
    };

    try {
      const eng = await submitToEngine(query, token, mentor.isReal && mentor.id ? mentor.id : null);
      if (eng?.success) {
        injectSuccess(countdown);
        const timer = setInterval(() => {
          countdown -= 1;
          if (countdown <= 0) {
            clearInterval(timer);
            navigate('/my-questions');
          } else {
            injectSuccess(countdown);
          }
        }, 1000);
      } else {
        injectSuccess(countdown);
        const timer = setInterval(() => {
          countdown -= 1;
          if (countdown <= 0) { clearInterval(timer); navigate('/my-questions'); }
          else injectSuccess(countdown);
        }, 1000);
      }
    } catch {
      injectSuccess(countdown);
      const timer = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) { clearInterval(timer); navigate('/my-questions'); }
        else injectSuccess(countdown);
      }, 1000);
    }
  }, [token, navigate, setMessages]);

  const college = userProfile?.education?.[0]?.institutionName;

  return (
    <div className="it-page min-h-screen bg-bg text-t-1 font-sans relative overflow-hidden flex flex-col">
      <StarCanvas />
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.015 }}
      />

      {/* Ticker */}
      <div className="relative z-10 mt-[60px]"><Ticker /></div>

      {/* Header */}
      <header className="w-full fixed top-0 px-6 py-4 flex justify-between items-center z-50 backdrop-blur-sm bg-bg/60 border-b border-border">
        <div className="font-serif italic text-2xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          Atyant <div className="w-2 h-2 rounded-full bg-signal animate-pulse-dot" />
        </div>
        <div className="flex items-center gap-3 text-sm font-mono font-medium text-t-2">
          {/* New Chat button — only visible when a conversation is active */}
          {!isIdle && messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                setChatHistory([]);
                setDiscovery({ college: null, branch: null, year: null, goal: null, cgpa: null });
                setIsIdle(true);
                if (storageKey) {
                  localStorage.removeItem(storageKey);
                  localStorage.removeItem(storageKey + '_discovery');
                }
              }}
              className="flex items-center gap-1.5 text-xs font-mono border border-border text-t-2 px-3 py-1.5 rounded-full hover:border-signal-bdr hover:text-signal transition-all"
            >
              + New Chat
            </button>
          )}
          {user ? (
            <>
              {college && <span className="text-t-3 text-xs hidden sm:block">{college}</span>}
              <button onClick={() => navigate('/my-questions')} className="hover:text-t-1 transition-colors hidden sm:block">My Questions</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="hover:text-t-1 transition-colors hidden sm:block">Login</button>
              <button onClick={() => navigate('/signup')} className="hover:text-t-1 transition-colors hidden sm:block">Sign Up</button>
            </>
          )}
          <span className="bg-signal-dim border border-signal-bdr text-signal px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Zap size={10} /> Live
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="w-full max-w-[700px] mx-auto px-4 flex flex-col z-10 relative pb-44 pt-4 flex-1">

        {/* IDLE STATE */}
        <AnimatePresence>
          {isIdle && (
            <motion.div key="idle" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.28 } }}
              className="flex flex-col items-center text-center pt-8 pb-4"
            >
              <h1 className="font-serif text-5xl md:text-[64px] leading-[1.08] mb-5 tracking-tight">
                Find someone who
                <span className="italic text-t-2">already solved</span><br />
                your <span className="text-signal">exact</span> problem.
              </h1>
              <p className="text-t-2 text-lg max-w-lg mb-8 leading-relaxed">
                {user && college
                  ? `Personalised for ${college} - type your career question and Atyant AI matches you with verified seniors from your background.`
                  : 'Type your career question. Atyant AI matches you with verified seniors from your background - then shows you their real path.'
                }
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3 font-mono text-sm text-t-3 mb-8">
                <span>800+ journeys</span><span className="text-border-2">·</span>
                <span>300+ mentors</span><span className="text-border-2">·</span>
                <span>50+ colleges</span><span className="text-border-2">·</span>
                <span className="text-signal flex items-center gap-1"><Zap size={11} /> Groq + Atyant Engine</span>
              </div>
              {!user && (
                <div className="text-xs font-mono text-t-3 bg-bg-2 border border-border px-4 py-2 rounded-full mb-6">
                  💡 <button onClick={() => navigate('/login')} className="text-signal hover:underline">Login</button> to get personalised mentor matches from Atyant Engine
                </div>
              )}
              {user && userProfile && getProfileCompleteness(userProfile).score < 75 && (
                <div className="text-xs font-mono text-t-3 bg-bg-2 border border-signal-bdr px-4 py-2 rounded-full mb-6 flex items-center gap-2">
                  <User size={11} className="text-signal" />
                  Profile {getProfileCompleteness(userProfile).score}% complete -
                  <button onClick={() => navigate('/profile')} className="text-signal hover:underline">complete it</button> for better matches
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHAT STATE */}
        {!isIdle && (
          <div className="w-full space-y-8 pt-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col w-full ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.role === 'user' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-3 border border-border px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed"
                  >
                    {m.content}
                  </motion.div>
                )}
                {m.role === 'ai' && (
                  <AIMessage msg={m} onFollowUp={handleSubmit} navigate={navigate} onAskMentor={handleAskMentor} />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* INPUT BAR */}
      <div className={`w-full fixed z-40 flex flex-col items-center px-4 transition-all duration-500 ease-out ${isIdle ? 'bottom-0 left-0 right-0 pb-8' : 'bottom-0 left-0 bg-bg/85 backdrop-blur-md border-t border-border pb-4 pt-3'
        }`}>
        <div className="w-full max-w-[680px] bg-bg-2 border border-border rounded-xl focus-within:border-signal-bdr focus-within:shadow-[0_0_20px_rgba(182,255,60,0.1)] transition-all">
          <div className="px-4 pt-4 pb-2">
            <textarea ref={textareaRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown} disabled={isLoading}
              placeholder={user ? `Ask anything - career, internship, placements${college ? ` at ${college}` : ''}...` : 'Describe your situation - college, branch, goal...'}
              className="w-full bg-transparent text-t-1 placeholder-t-3 resize-none outline-none text-[16px] min-h-[48px] max-h-[160px] leading-relaxed"
              rows={1}
            />
          </div>
          <div className="flex justify-between items-center px-4 pb-3 border-t border-border mt-1 pt-2">
            <div className="flex gap-2 items-center">
              <span className="flex items-center gap-1 text-[11px] font-mono bg-signal-dim border border-signal-bdr text-signal px-2 py-1 rounded">
                <Zap size={9} /> Atyant Engine
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-t-3 hidden sm:inline-block">
                {isLoading ? 'Processing...' : 'Enter ↵'}
              </span>
              <button onClick={() => handleSubmit()} disabled={isLoading || !query.trim()}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${query.trim() && !isLoading ? 'bg-signal text-bg hover:opacity-90' : 'bg-bg-3 text-t-3 cursor-not-allowed'}`}
              >
                {isLoading
                  ? <div className="w-3 h-3 border-2 border-t-transparent border-signal rounded-full animate-spin" />
                  : <ArrowUpRight size={18} strokeWidth={3} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Quick chips - idle only */}
        <AnimatePresence>
          {isIdle && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }}
              className="mt-4 flex flex-wrap justify-center gap-2 max-w-[640px]"
            >
              {CHIPS.map((chip, i) => (
                <button key={i} onClick={() => handleSubmit(chip.q)}
                  className="bg-bg-2 border border-border hover:border-border-2 px-3 py-1.5 rounded-full text-xs font-mono text-t-2 flex items-center gap-1.5 transition-all hover:text-t-1"
                >
                  <span>{chip.icon}</span> {chip.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}