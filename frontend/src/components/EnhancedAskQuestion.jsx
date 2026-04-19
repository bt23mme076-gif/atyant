import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../services/api.js';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EnhancedAskQuestion.css';
import ServiceBookingModal from './ServiceBookingModal.jsx';

const SERVICE_ICONS = {
  'video-call': '📹',
  'audio-call': '🎤',
  'chat': '💬',
  'answer-card': '🎯',
};

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const MentorServicesPreview = ({ mentorId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/monetization/services/mentor/${mentorId}`);
        const data = await res.json();
        if (data.success) setServices(data.services.filter((s) => s.isActive).slice(0, 3));
      } catch (err) {
        console.error('Fetch services error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [mentorId]);

  if (loading || !services.length) return null;

  return (
    <div className="aq-services-preview">
      <h4 className="aq-services-title">Available Services</h4>
      <div className="aq-services-grid">
        {services.map((s) => (
          <div key={s._id} className="aq-service-card">
            <div className="aq-service-top">
              <span className="aq-service-icon">{SERVICE_ICONS[s.type] || '📋'}</span>
              {s.isRecommended && <span className="aq-recommended-badge">Recommended</span>}
            </div>
            <h5 className="aq-service-name">{s.title}</h5>
            <p className="aq-service-desc">{s.description.substring(0, 60)}…</p>
            <div className="aq-service-footer">
              <span className="aq-service-price">{formatINR(s.price)}</span>
              <button
                className="aq-btn aq-btn-sm aq-btn-primary"
                onClick={() => { setSelectedService(s); setShowBookingModal(true); }}
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="aq-btn aq-btn-ghost aq-view-all" onClick={() => navigate(`/mentor/${mentorId}`)}>
        View all services →
      </button>
      {showBookingModal && selectedService && (
        <ServiceBookingModal
          service={selectedService}
          mentorId={mentorId}
          onClose={() => { setShowBookingModal(false); setSelectedService(null); }}
          user={user}
        />
      )}
    </div>
  );
};

const COMPANY_DOMAINS = [
  { label: 'Tech', value: 'Tech', icon: '💻' },
  { label: 'Data Analytics', value: 'Data Analytics', icon: '📊' },
  { label: 'Consulting', value: 'Consulting', icon: '🧑‍💼' },
  { label: 'Product', value: 'Product', icon: '📦' },
  { label: 'Core Engineering', value: 'Core Engineering', icon: '⚙️' },
];

const LOADING_MESSAGES = [
  'Understanding your question…',
  'Scanning mentor expertise…',
  'Matching domain and profile…',
  'Searching similar solved cases…',
  'Ranking the best mentor for you…',
  'Preparing your personalized preview…',
];

const STEPS = ['Ask', 'Mentor'];

const StepBar = ({ current, total }) => (
  <div className="aq-step-bar">
    {STEPS.slice(0, total).map((label, i) => {
      const idx = i + 1;
      const status = idx < current ? 'done' : idx === current ? 'active' : 'pending';
      return (
        <React.Fragment key={idx}>
          <div className={`aq-step-node aq-step-${status}`}>
            <div className="aq-step-circle">
              {status === 'done' ? '✓' : idx}
            </div>
            <span className="aq-step-label">{label}</span>
          </div>
          {idx < total && <div className={`aq-step-connector ${idx < current ? 'done' : ''}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

const ModalShell = ({ onClose, children, size = 'md' }) => (
  <div className="aq-overlay" onClick={onClose}>
    <div
      className={`aq-modal aq-modal-${size}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <button className="aq-close-btn" onClick={onClose} aria-label="Close">✕</button>
      {children}
    </div>
  </div>
);

const ProgressRing = ({ value }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg className="aq-progress-ring" viewBox="0 0 88 88" width="88" height="88">
      <circle cx="44" cy="44" r={r} className="aq-ring-track" />
      <circle cx="44" cy="44" r={r} className="aq-ring-fill" strokeDasharray={circ} strokeDashoffset={offset} />
      <text x="44" y="50" textAnchor="middle" className="aq-ring-text">{value}%</text>
    </svg>
  );
};

// ─── Reddit Threads (collapsible, 3 visible) ───────────────────────────────────

const RedditThreads = ({ posts }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? posts : posts.slice(0, 3);
  const extra = posts.length - 3;

  return (
    <div className="aq-reddit-posts">
      <p className="aq-reddit-posts-title">
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="10" fill="#ff4500"/>
          <text x="4.5" y="14.5" fontSize="10" fill="white" fontWeight="bold">r/</text>
        </svg>
        Top Reddit threads matching your question
      </p>
      {visible.map((post, i) => (
        <a
          key={i}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="aq-reddit-post"
        >
          <span className="aq-post-num">{i + 1}.</span>
          <div className="aq-post-info">
            <span className="aq-post-title">{post.title}</span>
            <span className="aq-post-meta">
              ⬆ {post.ups.toLocaleString()} · 💬 {post.numComments.toLocaleString()} · {post.subreddit}
            </span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 5l7 7-7 7M3 12h18"/>
          </svg>
        </a>
      ))}
      {posts.length > 3 && (
        <button
          className="aq-reddit-toggle"
          onClick={() => setExpanded((p) => !p)}
        >
          {expanded
            ? '▲ Show less'
            : `▼ Show ${extra} more thread${extra > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

// ─── Mentor Preview Content ─────────────────────────────────────────────────────

const MentorPreviewContent = ({ mentorPreview, checkingQuality, onContinue, onAsk }) => {
  const navigate = useNavigate();
  const [currentMentorIndex, setCurrentMentorIndex] = useState(0);

  // Get mentors array (support both old and new API format)
  const mentors = mentorPreview.mentors || (mentorPreview.mentor ? [mentorPreview.mentor] : []);
  const currentMentor = mentors[currentMentorIndex] || mentors[0];

  const handlePrevMentor = () => {
    setCurrentMentorIndex((prev) => (prev === 0 ? mentors.length - 1 : prev - 1));
  };

  const handleNextMentor = () => {
    setCurrentMentorIndex((prev) => (prev === mentors.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* 1. Heading */}
      <h2 className="aq-modal-heading">
        {mentorPreview.instantAnswer ? '⚡ Instant answer available!' : '✨ Best mentor found for your question'}
      </h2>

      {/* 2. Mentor Carousel */}
      {currentMentor && (
        <div className="aq-mentor-carousel">
          {/* Recommended Badge */}
          {currentMentor.isRecommended && (
            <div className="aq-recommended-by-atyant">
              ⭐ Recommended by Atyant
            </div>
          )}

          {/* Navigation Arrows (only show if multiple mentors) */}
          {mentors.length > 1 && (
            <>
              <button 
                className="aq-carousel-arrow aq-carousel-prev" 
                onClick={handlePrevMentor}
                aria-label="Previous mentor"
              >
                ‹
              </button>
              <button 
                className="aq-carousel-arrow aq-carousel-next" 
                onClick={handleNextMentor}
                aria-label="Next mentor"
              >
                ›
              </button>
            </>
          )}

          {/* Mentor Card */}
          <div className="aq-mentor-card">
            <div className="aq-mentor-avatar">
              {currentMentor.profileImage
                ? <img src={currentMentor.profileImage} alt={currentMentor.name} />
                : <div className="aq-avatar-fallback"><svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></div>}
            </div>
            <div className="aq-mentor-details">
              <h3>{currentMentor.name || 'Matched Mentor'}</h3>
              <p className="aq-mentor-bio">{currentMentor.bio || 'A mentor match has been found for your question.'}</p>
              <div className="aq-expertise-tags">
                {currentMentor.expertise?.slice(0, 4).map((exp, i) => (
                  <span key={i} className="aq-tag">{exp}</span>
                ))}
              </div>
            </div>
            <div className="aq-match-score">
              <ProgressRing value={currentMentor.matchPercentage || 0} />
              <span className="aq-match-label">Match</span>
            </div>
          </div>

          {/* Carousel Dots (only show if multiple mentors) */}
          {mentors.length > 1 && (
            <div className="aq-carousel-dots">
              {mentors.map((_, index) => (
                <button
                  key={index}
                  className={`aq-carousel-dot ${index === currentMentorIndex ? 'active' : ''}`}
                  onClick={() => setCurrentMentorIndex(index)}
                  aria-label={`View mentor ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Services */}
      {currentMentor && <MentorServicesPreview mentorId={currentMentor.id} />}

      {/* 4. Reddit Stats Banner */}
      {mentorPreview.redditStats && (
        <div className="aq-reddit-stats">
          {[
            { value: `${mentorPreview.redditStats.totalSolved}+`, label: 'students solved this' },
            { value: `${mentorPreview.mentor?.matchPercentage || 0}%`, label: 'profile match' },
            { value: mentorPreview.redditStats.totalThreads || 0, label: 'Reddit threads found' },
          ].map(({ value, label }) => (
            <div key={label} className="aq-stat-item">
              <span className="aq-stat-value">{value}</span>
              <span className="aq-stat-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 5. AI Summary */}
      {mentorPreview.redditStats?.aiSummary && (
        <div className="aq-ai-summary">
          <p className="aq-ai-summary-title">💡 What others did in your situation:</p>
          <p>{mentorPreview.redditStats.aiSummary}</p>
        </div>
      )}

      {/* 6. Reddit Threads (collapsible) */}
      {mentorPreview.redditStats?.top10Posts?.length > 0 && (
        <RedditThreads posts={mentorPreview.redditStats.top10Posts} />
      )}

      {/* 7. Instant Answer Preview */}
      {mentorPreview.instantAnswer && mentorPreview.answerPreview && (
        <div className="aq-instant-answer">
          <h4>📝 Answer Preview</h4>
          <p>{mentorPreview.answerPreview}</p>
          <span className="aq-instant-badge">✨ Based on similar question</span>
          {mentorPreview.answerCardId && (
            <button
              className="aq-btn aq-btn-primary aq-btn-full"
              onClick={() => window.open(`/answer/${mentorPreview.answerCardId}`, '_blank')}
            >
              See full answer card ↗
            </button>
          )}
        </div>
      )}

      {/* 8. Actions */}
      <div className="aq-modal-actions">
        <button
          className="aq-btn aq-btn-primary"
          onClick={onAsk}
          disabled={checkingQuality}
        >
          {checkingQuality ? 'Analysing…' : 'Ask for Answer Card'}
        </button>
      </div>
    </>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const EnhancedAskQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = user?.token || localStorage.getItem('token');

  const [formData, setFormData] = useState({ title: '', description: '', category: '', reason: '' });
  const [eligibility, setEligibility] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(true);
  const [mentorPreview, setMentorPreview] = useState(null);
  const [qualityCheck, setQualityCheck] = useState(null);
  const [forceLive, setForceLive] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [autoRecommended, setAutoRecommended] = useState(null);
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  const [ui, setUi] = useState({
    findingMentor: false,
    checkingQuality: false,
    submitting: false,
    showMentorPreview: false,
    showQualityWarning: false,
  });

  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderMessage, setLoaderMessage] = useState(LOADING_MESSAGES[0]);

  // ─── Eligibility ──────────────────────────────────────────────────────────

  const checkEligibility = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/questions/check-eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setEligibility(data);
        if (!data.isProfileComplete) {
          alert(`Please complete your profile first. Missing: ${data.missingFields.join(', ')}`);
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Eligibility check failed:', err);
    } finally {
      setLoadingEligibility(false);
    }
  }, [token, navigate]);

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/me/credits`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setEligibility((p) => p ? { ...p, credits: data.credits } : p);
    } catch (err) {
      console.error('refreshCredits error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const draft = localStorage.getItem('draftQuestion');
    if (draft) {
      const autoTitle = draft.length > 50 ? draft.substring(0, 50).trim() + '…' : draft.trim();
      setFormData((p) => ({ ...p, title: autoTitle, description: draft }));
      localStorage.removeItem('draftQuestion');
    }
    checkEligibility();
  }, [token, navigate, checkEligibility]);

  // ─── Auto-Categorization based on Question Text ────────────────────────────
  useEffect(() => {
    if (userManuallySelected) return; // Respect user choice

    const text = (formData.title + ' ' + formData.description).toLowerCase();
    if (text.length < 5) return;

    const rules = [
      { category: 'Consulting', keywords: ['iim', 'mba', 'consulting', 'business', 'case interview', 'mckinsey', 'bain', 'bcg'] },
      { category: 'Tech', keywords: ['iit', 'software', 'developer', 'coding', 'dsa', 'web', 'app', 'sde', 'react', 'java', 'frontend', 'backend'] },
      { category: 'Data Analytics', keywords: ['data', 'analytics', 'machine learning', 'ai', 'sql', 'python', 'analyst', 'dashboard'] },
      { category: 'Product', keywords: ['product manager', 'pm', 'product management', 'roadmap', 'agile'] },
      { category: 'Core Engineering', keywords: ['mechanical', 'civil', 'chemical', 'electrical', 'core engineering', 'gate'] }
    ];

    let matchedCategory = null;
    let highestScore = 0;

    rules.forEach(rule => {
      let score = 0;
      rule.keywords.forEach(kw => {
        if (text.includes(kw)) score++;
      });
      if (score > highestScore) {
        highestScore = score;
        matchedCategory = rule.category;
      }
    });

    if (matchedCategory && matchedCategory !== autoRecommended) {
      setFormData(prev => ({ ...prev, category: matchedCategory }));
      setAutoRecommended(matchedCategory);
    }
  }, [formData.title, formData.description, userManuallySelected, autoRecommended]);

  // ─── Edit timer ───────────────────────────────────────────────────────────

  

  // ─── Loader animation ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!ui.findingMentor) { setLoaderProgress(0); setLoaderMessage(LOADING_MESSAGES[0]); return; }
    let p = 6, mIdx = 0;
    setLoaderProgress(p); setLoaderMessage(LOADING_MESSAGES[0]);
    const prog = setInterval(() => { p = Math.min(p + Math.floor(Math.random() * 8) + 3, 94); setLoaderProgress(p); }, 450);
    const msg = setInterval(() => { mIdx = (mIdx + 1) % LOADING_MESSAGES.length; setLoaderMessage(LOADING_MESSAGES[mIdx]); }, 1400);
    return () => { clearInterval(prog); clearInterval(msg); };
  }, [ui.findingMentor]);

  // ─── Form helpers ─────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    else if (formData.title.length < 10) e.title = 'Title must be at least 10 characters';
    if (!formData.description.trim()) e.description = 'Description is required';
    else if (formData.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!formData.category) e.category = 'Please select a company domain';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const setUiKey = (key, val) => setUi((p) => ({ ...p, [key]: val }));

  // ─── Submit flow ──────────────────────────────────────────────────────────

  const handleGetAnswer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!eligibility?.credits) { alert('You have 0 credits. Please buy more to continue.'); return; }
    setUiKey('findingMentor', true);
    try {
      const res = await fetch(`${API_URL}/api/questions/preview-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ title: formData.title, description: formData.description, category: formData.category }),
      });
      const data = await res.json();
      if (data.success) {
        setLoaderProgress(100); setLoaderMessage('Best mentor found!');
        await new Promise((r) => setTimeout(r, 400));
        setMentorPreview(data);
        setUi((p) => ({ ...p, findingMentor: false, showMentorPreview: true }));
        setCurrentStep(2);
      } else {
        alert(data.error || 'Failed to find a mentor. Please try again.');
        setUiKey('findingMentor', false);
      }
    } catch (err) {
      console.error('Mentor match failed:', err);
      alert('Failed to find a mentor. Please try again.');
      setUiKey('findingMentor', false);
    }
  };

  const checkQuestionQuality = async () => {
    setUiKey('checkingQuality', true);
    try {
      const res = await fetch(`${API_URL}/api/questions/quality-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ title: formData.title, description: formData.description }),
      });
      const data = await res.json();
      if (data.success) {
        setQualityCheck(data);
        if (data.needsImprovement) {
          setUi((p) => ({ ...p, showQualityWarning: true, showMentorPreview: false }));
        } else {
          // Quality is fine — submit immediately (no separate review/confirm steps)
          setUi((p) => ({ ...p, showMentorPreview: false }));
          await handleFinalSubmit();
        }
      }
    } catch (err) {
      console.error('Quality check failed:', err);
    } finally {
      setUiKey('checkingQuality', false);
    }
  };

  const handleContinueFromMentor = async () => {
    if (mentorPreview?.instantAnswer) setForceLive(true);
    setUiKey('showMentorPreview', false);
    await handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    setUiKey('submitting', true);
    try {
      const res = await fetch(`${API_URL}/api/questions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          qualityScore: qualityCheck?.qualityScore || 0,
          mentorId: mentorPreview?.mentor?.id || null,
          forceLive: forceLive || !!mentorPreview?.instantAnswer,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.instantAnswer) alert('⚡ Instant answer found from a mentor who solved the same problem!');
        else alert('✅ Question submitted! You will receive an answer within 24 hours.');
        navigate('/my-questions');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setUi((p) => ({ ...p, submitting: false }));
      setForceLive(false);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ amount: 1, credits: 5 }),
      });
      if (!res.ok) throw new Error(`Create order failed: ${res.status}`);
      const order = await res.json();
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Atyant',
        description: 'Question Credits — 5 Credits',
        order_id: order.id,
        handler: async (payment) => {
          const vRes = await fetch(`${API_URL}/api/payment/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include',
            body: JSON.stringify(payment),
          });
          const result = await vRes.json();
          if (result.success) {
            toast.success(`Payment successful! ${result.creditsAdded || 5} credits added.`, { position: 'top-center', autoClose: 4000 });
            setEligibility((p) => ({ ...p, credits: (p?.credits || 0) + (result.creditsAdded || 5) }));
            await refreshCredits();
          } else {
            toast.error('Payment verification failed. Contact support.', { position: 'top-center', autoClose: 5000 });
          }
        },
        prefill: { name: user?.username || '', email: user?.email || '' },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: () => toast.info('Payment cancelled.', { position: 'top-center', autoClose: 3000 }) },
      };
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = resolve; s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      new window.Razorpay(options).open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Error initiating payment. Please try again.', { position: 'top-center', autoClose: 5000 });
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loadingEligibility) {
    return (
      <div className="aq-fullscreen-loader">
        <div className="aq-spinner" />
        <p>Checking your eligibility…</p>
      </div>
    );
  }

  const loaderSteps = [
    { label: 'Read question intent', threshold: 10 },
    { label: 'Compare mentor expertise', threshold: 35 },
    { label: 'Rank best match', threshold: 65 },
    { label: 'Build preview', threshold: 90 },
  ];

  return (
    <>
      {/* ── Mentor Search Overlay ─────────────────────────────────────────── */}
      {ui.findingMentor && (
        <div className="aq-loader-overlay" role="status" aria-live="polite">
          <div className="aq-loader-card">
            <div className="aq-loader-rings">
              <div className="aq-ring r1" /><div className="aq-ring r2" /><div className="aq-ring r3" />
              <div className="aq-ring-center"><span>AI</span></div>
              {['Skill Match', 'Profile Fit', 'Top Expert'].map((chip, i) => (
                <div key={i} className={`aq-chip aq-chip-${i + 1}`}>{chip}</div>
              ))}
            </div>
            <div className="aq-loader-body">
              <p className="aq-loader-eyebrow">Atyant Intelligence</p>
              <h2 className="aq-loader-heading">Finding your best mentor</h2>
              <p className="aq-loader-sub">
                Analysing your question, searching solved patterns, and ranking the strongest mentor match.
              </p>
              <div className="aq-loader-status">
                <span className="aq-pulse-dot" />{loaderMessage}
              </div>
              <div className="aq-prog-track" role="progressbar" aria-valuenow={loaderProgress} aria-valuemax={100}>
                <div className="aq-prog-fill" style={{ width: `${loaderProgress}%` }} />
              </div>
              <div className="aq-prog-meta">
                <span>{loaderProgress}% completed</span>
                <span>Usually 3–8 seconds</span>
              </div>
              <div className="aq-loader-steps">
                {loaderSteps.map(({ label, threshold }) => (
                  <div key={label} className={`aq-loader-step ${loaderProgress >= threshold ? 'active' : ''}`}>
                    <span className="aq-loader-step-dot" />{label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Page ─────────────────────────────────────────────────────── */}
      <div className="aq-container">

        {/* Header */}
        <header className="aq-header">
          <div className="aq-header-text">
            <h1>Ask Your Question</h1>
            <p>Get personalised guidance from experienced mentors</p>
          </div>

          <div className="aq-header-meta">
            {/* Profile Strength */}
            <div className="aq-profile-strength">
              <div className="aq-ps-label">
                <span>Profile Strength</span>
                <strong>{eligibility?.profileStrength || 0}%</strong>
              </div>
              <div className="aq-ps-track">
                <div className="aq-ps-fill" style={{ width: `${eligibility?.profileStrength || 0}%` }} />
              </div>
              {(eligibility?.profileStrength || 0) < 100 && (
                <button className="aq-btn aq-btn-ghost aq-btn-sm" onClick={() => navigate('/profile')}>
                  Complete profile →
                </button>
              )}
            </div>

            {/* Credits */}
            <div className="aq-credits-card">
              <div className="aq-credits-info">
                <span className="aq-credits-icon">🎫</span>
                <div>
                  <span className="aq-credits-count">{eligibility?.credits || 0}</span>
                  <span className="aq-credits-label">{eligibility?.credits === 1 ? 'credit' : 'credits'} remaining</span>
                </div>
              </div>
              {eligibility?.credits === 0 ? (
                <button className="aq-btn aq-btn-primary" onClick={handlePayment}>
                  Buy 5 Credits — ₹1
                </button>
              ) : (
                <button className="aq-btn aq-btn-ghost aq-btn-sm" onClick={handlePayment}>
                  + Buy more
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Step Bar */}
        <StepBar current={currentStep} total={2} />

        {/* Form */}
        <section className="aq-form-section">
          <div className="aq-step-hint">
            <span className="aq-step-hint-label">Step 1 of 2</span>
            <span className="aq-step-hint-next">Next: Meet your matched mentor 🎯</span>
          </div>

          <form className="aq-form" onSubmit={handleGetAnswer} noValidate>
            {/* Title */}
            <div className={`aq-field ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="title">
                Question Title <span className="aq-required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., How do I prepare for a Product Manager interview?"
                maxLength={200}
              />
              <div className="aq-field-footer">
                {errors.title ? <span className="aq-error-msg">{errors.title}</span> : <span />}
                <span className="aq-char-count">{formData.title.length}/200</span>
              </div>
            </div>

            {/* Description */}
            <div className={`aq-field ${errors.description ? 'has-error' : ''}`}>
              <label htmlFor="description">
                Detailed Description <span className="aq-required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide context: What's your background? What have you tried? What specific help do you need?"
                maxLength={1000}
                rows={7}
              />
              <div className="aq-field-footer">
                {errors.description ? <span className="aq-error-msg">{errors.description}</span> : <span />}
                <span className="aq-char-count">{formData.description.length}/1000</span>
              </div>
            </div>

            {/* Domain */}
            <div className={`aq-field ${errors.category ? 'has-error' : ''}`}>
              <label>Company Domain <span className="aq-required">*</span></label>
              <div className="aq-domain-grid">
                {COMPANY_DOMAINS.map(({ label, value, icon }) => (
                  <button
                    type="button"
                    key={value}
                    className={`aq-domain-btn ${formData.category === value ? 'selected' : ''} ${autoRecommended === value ? 'recommended' : ''}`}
                    onClick={() => { 
                      setFormData((p) => ({ ...p, category: value })); 
                      setErrors((p) => ({ ...p, category: null })); 
                      setUserManuallySelected(true);
                      if (autoRecommended !== value) setAutoRecommended(null);
                    }}
                  >
                    {autoRecommended === value && (
                      <div style={{ position: 'absolute', top: -10, right: -10, background: '#7C3AED', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                        ✨ Recommended
                      </div>
                    )}
                    <span className="aq-domain-icon">{icon}</span>
                    <span className="aq-domain-label">{label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <span className="aq-error-msg">{errors.category}</span>}
            </div>

            {/* Reason */}
            <div className="aq-field">
              <label htmlFor="reason">Why are you asking this? <span className="aq-optional">(optional)</span></label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., I have an interview next week and want to prepare effectively"
                maxLength={500}
                rows={3}
              />
              <div className="aq-field-footer">
                <span />
                <span className="aq-char-count">{formData.reason.length}/500</span>
              </div>
            </div>

            <button
              type="submit"
              className="aq-btn aq-btn-primary aq-btn-lg aq-submit-btn"
              disabled={ui.findingMentor || !eligibility?.credits}
            >
              {ui.findingMentor ? 'Finding best mentor…' : 'Get My Answer 🚀'}
            </button>
          </form>
        </section>
      </div>

      {/* ── Mentor Preview Modal ─────────────────────────────────────────── */}
      {ui.showMentorPreview && mentorPreview && (
        <ModalShell onClose={() => setUiKey('showMentorPreview', false)} size="lg">
          <StepBar current={2} total={2} />
          <div className="aq-modal-step-hint">
            <span className="aq-step-hint-label">Step 2 of 2</span>
            <span className="aq-step-hint-next">
              {mentorPreview.instantAnswer ? 'Instant answer found! 🎯' : 'Ask for an Answer Card 🎯'}
            </span>
          </div>

          {mentorPreview.mentorFound || mentorPreview.mentorUsername === 'Atyant Engine' || mentorPreview.message?.includes('Atyant Engine') ? (
            <MentorPreviewContent
              mentorPreview={mentorPreview}
              checkingQuality={ui.checkingQuality}
              onContinue={null}
              onAsk={async () => {
                // Close preview and submit immediately (ask for answer card)
                setUiKey('showMentorPreview', false);
                // mark forceLive if instant answer
                if (mentorPreview?.instantAnswer) setForceLive(true);
                await handleFinalSubmit();
              }}
            />
          ) : (
            <>
              <div className="aq-mentor-card">
                <div className="aq-mentor-avatar"><div className="aq-avatar-fallback" style={{fontSize:'22px'}}>🤖</div></div>
                <div className="aq-mentor-details">
                  <h3>Atyant Engine</h3>
                  <p className="aq-mentor-bio">AI-powered assistant — your question will be answered by our engine if no human mentor is available.</p>
                  <div className="aq-expertise-tags">
                    <span className="aq-tag">AI Guidance</span><span className="aq-tag">24/7 Support</span>
                  </div>
                </div>
                <div className="aq-match-score">
                  <div className="aq-match-infinity">∞</div>
                  <span className="aq-match-label">AI</span>
                </div>
              </div>
              <p className="aq-no-mentor-msg">No mentor match found. Your question will be answered by <strong>Atyant Engine</strong>.</p>
              <div className="aq-modal-actions">
                <button className="aq-btn aq-btn-primary" onClick={async () => { setUiKey('showMentorPreview', false); await handleFinalSubmit(); }}>Ask for Answer Card</button>
              </div>
            </>
          )}
        </ModalShell>
      )}

      {/* ── Quality Warning Modal ─────────────────────────────────────────── */}
      {ui.showQualityWarning && qualityCheck && (
        <ModalShell onClose={() => setUiKey('showQualityWarning', false)}>
          <div className="aq-quality-header">
            <span className="aq-quality-icon">⚠️</span>
            <div>
              <h2>Improve your question</h2>
              <p>Better detail means better mentor guidance</p>
            </div>
            <div className="aq-quality-score">
              <span className="aq-score-num">{qualityCheck.qualityScore}</span>
              <span className="aq-score-label">/100</span>
            </div>
          </div>
          <div className="aq-quality-issues">
            <p className="aq-issues-title">Suggestions</p>
            <ul>
              {qualityCheck.issues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
          </div>
          <div className="aq-modal-actions">
            <button className="aq-btn aq-btn-primary" onClick={() => { setUiKey('showQualityWarning', false); document.getElementById('description')?.focus(); }}>
              Improve question
            </button>
            <button className="aq-btn aq-btn-ghost" onClick={async () => { setUiKey('showQualityWarning', false); await handleFinalSubmit(); }}>
              Continue anyway
            </button>
          </div>
        </ModalShell>
      )}

    </>
  );
};

export default EnhancedAskQuestion;