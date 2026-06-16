import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Mail, Phone, Award, BookOpen, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from './SEO';
import { API_URL } from '../services/api';
import './WebinarRegistration.css';

const WebinarRegistration = () => {
  // Configurable Webinar Details
  const WEBINAR_DATE_TARGET = new Date('2026-07-18T18:00:00+05:30'); // July 18, 2026 6:00 PM IST
  const WEBINAR_TITLE = 'How to Crack an IIM Internship from a Tier-2 NIT — Live with Atyant Seniors';
  const WEBINAR_SPEAKER = 'Nitin Rai (Founder, Atyant & VNIT Nagpur)';
  const WEBINAR_DATE_STR = 'Friday, July 18, 2026 at 6:00 PM IST';
  const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/IsOeHy87Tu0BsIJiBVHjUW';

  // State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    yearOfStudy: '',
    stream: '',
    questions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  // Check if already registered in this session/browser
  useEffect(() => {
    const isRegistered = localStorage.getItem('atyant_webinar_registered_2026');
    if (isRegistered) {
      setSuccess(true);
    }
  }, []);

  // Countdown timer calculations
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const difference = WEBINAR_DATE_TARGET.getTime() - now.getTime();

      if (difference <= 0) {
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Extra Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.college.trim() || !formData.yearOfStudy || !formData.stream) {
      setError('All fields except questions are required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/webinar/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success
      localStorage.setItem('atyant_webinar_registered_2026', 'true');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Google Calendar Link
  const getGoogleCalendarLink = () => {
    const title = encodeURIComponent(WEBINAR_TITLE);
    const dates = '20260718T123000Z/20260718T140000Z'; // 6:00 PM - 7:30 PM IST (12:30 - 14:00 UTC)
    const details = encodeURIComponent('Join Atyant\'s live career guidance webinar to break through your career block. Webinar Registration Link: https://atyant.in/webinar');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
  };

  return (
    <>
      <SEO
        title="Webinar: How to Crack an IIM Internship from a Tier-2 NIT | Atyant"
        description="Live session with Atyant seniors who cracked consulting and finance internships from non-IIT backgrounds. Register free — real paths, not generic prep advice."
        keywords="IIM internship Tier-2 NIT, career webinar VNIT, Atyant webinar, Nitin Rai Atyant, engineering student career clarity"
        url="https://atyant.in/webinar"
      />

      <div className="webinar-page-wrapper">
        {/* Minimal nav */}
        <header className="webinar-nav">
          <a href="/home" className="webinar-nav-brand">
            <span className="webinar-nav-mark">A</span>
            Atyant
          </a>
          <a href="/home" className="webinar-nav-back">← Back to home</a>
        </header>

        {/* Glow Blobs */}
        <div className="webinar-glow-blob webinar-blob-1"></div>
        <div className="webinar-glow-blob webinar-blob-2"></div>
        <div className="webinar-glow-blob webinar-blob-3"></div>

        <div className="webinar-container">
          {/* Badge */}
          <div className="webinar-badge-wrapper">
            <div className="webinar-badge">
              <span className="live-dot"></span>
              LIVE INTERACTIVE WEBINAR
            </div>
          </div>

          {/* Heading */}
          <h1 className="webinar-title">
            How to Crack an IIM Internship from a Tier-2 NIT
          </h1>
          <p className="webinar-subtitle">
            Live with Atyant seniors who cracked consulting and finance internships from non-IIT backgrounds. Real paths, real context — not generic prep advice.
          </p>

          <div className="webinar-grid">
            {/* Info Column */}
            <div className="webinar-info-side">
              {/* Countdown Card */}
              <div className="webinar-countdown-card">
                {isLive ? (
                  <div className="webinar-live-badge">
                    <span className="live-dot"></span> WEBINAR IS LIVE NOW!
                  </div>
                ) : (
                  <>
                    <p className="webinar-countdown-title">📅 Live Session Starts In</p>
                    <div className="webinar-timer">
                      <div className="timer-segment">
                        <span className="timer-number">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="timer-label">Days</span>
                      </div>
                      <div className="timer-segment">
                        <span className="timer-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="timer-label">Hours</span>
                      </div>
                      <div className="timer-segment">
                        <span className="timer-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="timer-label">Mins</span>
                      </div>
                      <div className="timer-segment">
                        <span className="timer-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="timer-label">Secs</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* What You Will Learn Card */}
              <div className="webinar-features-card">
                <h3 className="webinar-section-heading">Key Takeaways from the Webinar</h3>
                <div className="webinar-features-list">
                  <div className="webinar-feature-item">
                    <div className="webinar-feature-icon-wrapper">
                      <Award size={20} />
                    </div>
                    <div className="webinar-feature-text-block">
                      <h4>AI-Driven Career Mapping</h4>
                      <p>How semantic matching analyzes your skill sets to design customized roadmaps mapping exact milestones.</p>
                    </div>
                  </div>

                  <div className="webinar-feature-item">
                    <div className="webinar-feature-icon-wrapper">
                      <BookOpen size={20} />
                    </div>
                    <div className="webinar-feature-text-block">
                      <h4>Direct Mentor Connection Tactics</h4>
                      <p>The strategy to bypass standard HR gateways and get 1-on-1 chats with experts working at top companies.</p>
                    </div>
                  </div>

                  <div className="webinar-feature-item">
                    <div className="webinar-feature-icon-wrapper">
                      <Clock size={20} />
                    </div>
                    <div className="webinar-feature-text-block">
                      <h4>Breaking the "No Response" Cycle</h4>
                      <p>Why sending generic resumes fails and how to tailor application cards that convert views into interviews.</p>
                    </div>
                  </div>

                  <div className="webinar-feature-item">
                    <div className="webinar-feature-icon-wrapper">
                      <Users size={20} />
                    </div>
                    <div className="webinar-feature-text-block">
                      <h4>Live Q&A Session</h4>
                      <p>Ask Atyant seniors your specific blockers directly — get live, context-matched answers for your college and background.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenter Card */}
              <div className="webinar-presenter-card">
                <div className="presenter-avatar-wrapper">
                  <div className="presenter-avatar" style={{ background: 'linear-gradient(135deg, #7567C9, #5A4CB0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
                    N
                  </div>
                  <div className="presenter-tag">Host</div>
                </div>
                <div className="presenter-details">
                  <h4>Nitin Rai</h4>
                  <p className="presenter-title">Founder & CEO, Atyant — VNIT Nagpur</p>
                  <p className="presenter-bio">
                    Experienced the career clarity gap firsthand as a Tier-2 engineering student. Built Atyant to fix it. Hult Prize Top 20, IIT Bombay 2026. Shipped 20+ real products while in college.
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Form / Success side */}
            <div className="webinar-form-card">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="webinar-form-header">
                      <h3>Secure Your Spot</h3>
                      <p className="webinar-seats-notice">
                        🔥 Only 14 Seats Left! Over 485 students registered.
                      </p>
                    </div>

                    {error && <div className="webinar-error-alert">{error}</div>}

                    <form onSubmit={handleSubmit} className="webinar-form">
                      <div className="webinar-form-group">
                        <label className="webinar-label" htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="webinar-input"
                          placeholder="e.g. Priyanshu Sharma"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="webinar-form-group">
                        <label className="webinar-label" htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="webinar-input"
                          placeholder="e.g. sharma@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="webinar-form-group">
                        <label className="webinar-label" htmlFor="phone">Mobile Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="webinar-input"
                          placeholder="10-digit Indian Number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="webinar-form-group">
                        <label className="webinar-label" htmlFor="college">College/Institution</label>
                        <input
                          type="text"
                          id="college"
                          name="college"
                          className="webinar-input"
                          placeholder="e.g. VNIT Nagpur"
                          value={formData.college}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="webinar-grid-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="webinar-form-group">
                          <label className="webinar-label" htmlFor="yearOfStudy">Year of Study</label>
                          <input
                            type="text"
                            id="yearOfStudy"
                            name="yearOfStudy"
                            className="webinar-input"
                            placeholder="e.g. 2nd Year, Graduate"
                            value={formData.yearOfStudy}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="webinar-form-group">
                          <label className="webinar-label" htmlFor="stream">Stream</label>
                          <input
                            type="text"
                            id="stream"
                            name="stream"
                            className="webinar-input"
                            placeholder="e.g. CSE, Mechanical"
                            value={formData.stream}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="webinar-form-group">
                        <label className="webinar-label" htmlFor="questions">Questions for Speaker (Optional)</label>
                        <textarea
                          id="questions"
                          name="questions"
                          className="webinar-input"
                          style={{ minHeight: '80px', resize: 'vertical' }}
                          placeholder="What is your biggest career obstacle right now?"
                          value={formData.questions}
                          onChange={handleChange}
                        />
                      </div>

                      <button
                        type="submit"
                        className="webinar-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <>
                            Register For Free <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="webinar-success-container"
                  >
                    <div className="success-check-wrapper">
                      <CheckCircle2 className="success-check-icon" />
                    </div>

                    <h3 className="webinar-success-title">Seat Reserved!</h3>
                    <p className="webinar-success-subtitle">
                      Your registration is confirmed. We have dispatched a confirmation email detailing the event. Please perform these next steps:
                    </p>

                    <div className="webinar-success-actions">
                      <a
                        href={WHATSAPP_GROUP_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-success-action btn-whatsapp-group"
                      >
                        💬 Join WhatsApp Updates Group
                      </a>

                      <a
                        href={getGoogleCalendarLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-success-action btn-add-calendar"
                      >
                        📅 Add to Google Calendar
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebinarRegistration;
