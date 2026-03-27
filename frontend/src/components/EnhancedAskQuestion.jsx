import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../services/api.js';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EnhancedAskQuestion.css';
import ServiceBookingModal from './ServiceBookingModal.jsx';

// Mentor Services Preview Component
const MentorServicesPreview = ({ mentorId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [mentorId]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/monetization/services/mentor/${mentorId}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.services.filter(s => s.isActive).slice(0, 3)); // Show max 3 services
      }
    } catch (error) {
      console.error('Fetch services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading || services.length === 0) return null;

  return (
    <div className="mentor-services-preview">
      <h4 className="services-title">💼 Available Services</h4>
      <div className="services-grid-preview">
        {services.map(service => (
          <div key={service._id} className="service-card-mini">
            <div className="service-header-mini">
              <span className="service-icon">
                {service.type === 'video-call' && '📹'}
                {service.type === 'audio-call' && '🎤'}
                {service.type === 'chat' && '💬'}
                {service.type === 'answer-card' && '🎯'}
              </span>
              {service.isRecommended && (
                <span className="recommended-mini">⭐</span>
              )}
            </div>
            <h5>{service.title}</h5>
            <p className="service-desc-mini">{service.description.substring(0, 60)}...</p>
            <div className="service-footer-mini">
              <span className="price-mini">{formatCurrency(service.price)}</span>
              <button 
                className="book-mini-btn"
                onClick={() => handleBookService(service)}
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="view-all-services-btn"
        onClick={() => navigate(`/mentor/${mentorId}`)}
      >
        View All Services →
      </button>

      {showBookingModal && selectedService && (
        <ServiceBookingModal
          service={selectedService}
          mentorId={mentorId}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
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
  { label: 'Core Engineering', value: 'Core Engineering', icon: '⚙️' }
];

const EnhancedAskQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    reason: ''
  });

  const [eligibility, setEligibility] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(true);

  const [mentorPreview, setMentorPreview] = useState(null);
  const [showMentorPreview, setShowMentorPreview] = useState(false);

  const [qualityCheck, setQualityCheck] = useState(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [forceLive, setForceLive] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [findingMentor, setFindingMentor] = useState(false);
  const [checkingQuality, setCheckingQuality] = useState(false);

  const [mentorLoadingProgress, setMentorLoadingProgress] = useState(0);
  const [mentorLoadingMessage, setMentorLoadingMessage] = useState('Initializing mentor search...');

  const [errors, setErrors] = useState({});

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // Reduced from 4 to 2 (Ask Question → Mentor Match → Submit)

  const [editTimeLeft, setEditTimeLeft] = useState(300);
  const [editTimerActive, setEditTimerActive] = useState(false);

  // ─────────────────────────────────────────────
  //  🔴 FIX: token nikalo ek jagah se
  // ─────────────────────────────────────────────
  const token = user?.token || localStorage.getItem('token');

  // ─────────────────────────────────────────────
  //  CHECK ELIGIBILITY — fresh DB se credits lao
  // ─────────────────────────────────────────────
  const checkEligibility = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/questions/check-eligibility`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
      const data = await response.json();
      if (data.success) {
        setEligibility(data);
        if (!data.isProfileComplete) {
          alert(`Please complete your profile first. Missing: ${data.missingFields.join(', ')}`);
          navigate('/profile');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Eligibility check failed:', error);
    } finally {
      setLoadingEligibility(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const draftQuestion = localStorage.getItem('draftQuestion');
    if (draftQuestion) {
      const autoTitle =
        draftQuestion.length > 50
          ? draftQuestion.substring(0, 50).trim() + '...'
          : draftQuestion.trim();

      setFormData(prev => ({
        ...prev,
        title: autoTitle,
        description: draftQuestion
      }));

      localStorage.removeItem('draftQuestion');
    }

    checkEligibility();
  }, [token, navigate, checkEligibility]);

  useEffect(() => {
    if (!showPreview) {
      setEditTimerActive(false);
      return;
    }
    setEditTimeLeft(300);
    setEditTimerActive(true);
  }, [showPreview]);

  useEffect(() => {
    if (!editTimerActive) return;
    if (editTimeLeft <= 0) {
      setEditTimerActive(false);
      return;
    }
    const interval = setInterval(() => {
      setEditTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [editTimerActive, editTimeLeft]);

  useEffect(() => {
    if (!findingMentor) {
      setMentorLoadingProgress(0);
      setMentorLoadingMessage('Initializing mentor search...');
      return;
    }

    const loadingMessages = [
      'Understanding your question...',
      'Scanning mentor expertise...',
      'Matching domain and profile...',
      'Searching similar solved cases...',
      'Ranking the best mentor for you...',
      'Preparing your personalized preview...'
    ];

    let progress = 6;
    let messageIndex = 0;

    setMentorLoadingProgress(progress);
    setMentorLoadingMessage(loadingMessages[0]);

    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 3;
      if (progress > 94) progress = 94;
      setMentorLoadingProgress(progress);
    }, 450);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setMentorLoadingMessage(loadingMessages[messageIndex]);
    }, 1400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [findingMentor]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a company domain';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetAnswer = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    if ((eligibility?.credits || 0) === 0) {
      alert('You have 0 credits remaining. Please upgrade to continue.');
      return;
    }

    setFindingMentor(true);
    setMentorLoadingProgress(6);
    setMentorLoadingMessage('Understanding your question...');

    try {
      const response = await fetch(`${API_URL}/api/questions/preview-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category
        })
      });

      const data = await response.json();

      if (data.success) {
        setMentorLoadingProgress(100);
        setMentorLoadingMessage('Best mentor found! Preparing your preview...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setMentorPreview(data);
        setShowMentorPreview(true);
        setCurrentStep(2);
      } else {
        alert(data.error || 'Failed to find mentor match. Please try again.');
      }
    } catch (error) {
      console.error('❌ Mentor match failed:', error);
      alert('Failed to find mentor match. Please try again.');
    } finally {
      setFindingMentor(false);
    }
  };

  const checkQuestionQuality = async () => {
    setCheckingQuality(true);
    try {
      const response = await fetch(`${API_URL}/api/questions/quality-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        })
      });

      const data = await response.json();

      if (data.success) {
        setQualityCheck(data);
        if (data.needsImprovement) {
          setShowQualityWarning(true);
          setShowMentorPreview(false);
        } else {
          setShowPreview(true);
          setShowMentorPreview(false);
        }
      }
    } catch (error) {
      console.error('❌ Quality check failed:', error);
    } finally {
      setCheckingQuality(false);
    }
  };

  const handleContinueFromMentor = async () => {
    // Directly submit the question without quality check or preview
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/questions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          qualityScore: 100, // Skip quality check
          mentorId: mentorPreview?.mentor?.id || null,
          forceLive: forceLive || !!mentorPreview?.instantAnswer
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.instantAnswer) {
          alert('⚡ Great news! We found an instant answer from a mentor who solved the same problem!');
        } else {
          alert('✅ Question submitted successfully! You will receive an answer within 24 hours.');
        }
        navigate('/my-questions');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
      setShowMentorPreview(false);
      setForceLive(false);
    }
  };

  const handleImproveQuestion = () => {
    setShowQualityWarning(false);
    document.getElementById('description')?.focus();
  };

  const handleContinueAnyway = () => {
    setShowQualityWarning(false);
    setShowPreview(true);
  };

  const handleEditFromPreview = () => {
    setShowPreview(false);
    setCurrentStep(1);
  };

  const handleConfirmFromPreview = () => {
    setShowPreview(false);
    setShowConfirmation(true);
    setCurrentStep(4);
  };

  // ─────────────────────────────────────────────
  //  🔴 CREDIT FIX: payment ke baad DB se fresh
  //  credits lo aur state update karo
  // ─────────────────────────────────────────────
  const refreshCredits = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/profile/me/credits`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
      const data = await res.json();
      if (data.success) {
        setEligibility(prev => prev ? { ...prev, credits: data.credits } : prev);
      }
    } catch (err) {
      console.error('refreshCredits error:', err);
    }
  }, [token]);

  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ amount: 1, credits: 5 })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create order failed: ${response.status} ${errorText}`);
      }

      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Atyant',
        description: 'Question Credits - 5 Credits',
        order_id: order.id,
        handler: async function (paymentResponse) {
          try {
            const verificationResponse = await fetch(`${API_URL}/api/payment/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              credentials: 'include',
              body: JSON.stringify(paymentResponse)
            });

            const result = await verificationResponse.json();

            if (result.success) {
              toast.success(`🎉 Payment successful! ${result.creditsAdded || 5} credits added to your account.`, {
                position: 'top-center',
                autoClose: 4000
              });

              // 🔴 FIX: Instant UI update + DB se fresh sync
              setEligibility(prev => ({
                ...prev,
                credits: (prev?.credits || 0) + (result.creditsAdded || 5)
              }));
              await refreshCredits();

            } else {
              toast.error('Payment verification failed. Please contact support.', {
                position: 'top-center',
                autoClose: 5000
              });
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || ''
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled. You can try again anytime.', {
              position: 'top-center',
              autoClose: 3000
            });
          }
        }
      };

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while initiating payment. Please try again.', {
        position: 'top-center',
        autoClose: 5000
      });
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/questions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          qualityScore: qualityCheck?.qualityScore || 0,
          mentorId: mentorPreview?.mentor?.id || null,
          // If the preview we showed had an instant answer, assume the user
          // intends to force live routing when they confirm.
          forceLive: forceLive || !!mentorPreview?.instantAnswer
        })
      });

      const data = await response.json();

      if (data.success) {
        // Always redirect to My Questions so the user sees their question list
        // and the canonical status (Assigned to Mentor / Answer Ready) instead
        // of landing directly on the instant-answer view.
        if (data.instantAnswer) {
          alert('⚡ Great news! We found an instant answer from a mentor who solved the same problem!');
        } else {
          alert('✅ Question submitted successfully! You will receive an answer within 24 hours.');
        }
        navigate('/my-questions');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit question. Please try again.');
      } finally {
      setSubmitting(false);
      setShowConfirmation(false);
      setForceLive(false);
    }
  };

  if (loadingEligibility) {
    return (
      <div className="enhanced-ask-loading">
        <div className="spinner"></div>
        <p>Checking your eligibility...</p>
      </div>
    );
  }

  return (
    <>
      {findingMentor && (
        <div
          className="mentor-search-loading-overlay premium"
          aria-live="polite"
          aria-atomic="true"
          aria-busy="true"
        >
          <div className="mentor-search-glass-card">
            <div className="mentor-bg-orb mentor-bg-orb-1"></div>
            <div className="mentor-bg-orb mentor-bg-orb-2"></div>
            <div className="mentor-bg-grid"></div>

            <div className="mentor-loader-visual">
              <div className="mentor-loader-core">
                <div className="mentor-loader-ring ring-one"></div>
                <div className="mentor-loader-ring ring-two"></div>
                <div className="mentor-loader-ring ring-three"></div>

                <div className="mentor-loader-center">
                  <div className="mentor-loader-center-inner">
                    <span className="mentor-loader-ai">AI</span>
                  </div>
                </div>

                <div className="mentor-scan-line"></div>

                <div className="mentor-floating-chip chip-one">Skill Match</div>
                <div className="mentor-floating-chip chip-two">Profile Fit</div>
                <div className="mentor-floating-chip chip-three">Fastest Expert</div>
              </div>
            </div>

            <div className="mentor-loader-content">
              <div className="mentor-loader-badge">Atyant Intelligence</div>
              <h2>Finding your best mentor</h2>
              <p className="mentor-loader-subtitle">
                We are analyzing your question, searching solved patterns, and ranking the strongest mentor match for your needs.
              </p>
              <div className="mentor-live-status">
                <span className="mentor-live-dot"></span>
                <span>{mentorLoadingMessage}</span>
              </div>
              <div
                className="mentor-progress-wrap"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={mentorLoadingProgress}
                aria-label="Mentor search progress"
              >
                <div className="mentor-progress-fill" style={{ width: `${mentorLoadingProgress}%` }} />
              </div>
              <div className="mentor-progress-meta">
                <span>{mentorLoadingProgress}% completed</span>
                <span>Usually takes 3–8 seconds</span>
              </div>
              <div className="mentor-loader-steps">
                <div className={`mentor-loader-step ${mentorLoadingProgress >= 10 ? 'active' : ''}`}>
                  <span></span>Read question intent
                </div>
                <div className={`mentor-loader-step ${mentorLoadingProgress >= 35 ? 'active' : ''}`}>
                  <span></span>Compare mentor expertise
                </div>
                <div className={`mentor-loader-step ${mentorLoadingProgress >= 65 ? 'active' : ''}`}>
                  <span></span>Rank best match
                </div>
                <div className={`mentor-loader-step ${mentorLoadingProgress >= 90 ? 'active' : ''}`}>
                  <span></span>Build preview
                </div>
              </div>
              <p className="mentor-loader-sr-only">
                Mentor search is in progress. {mentorLoadingProgress}% completed. {mentorLoadingMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="enhanced-ask-container">
        <div className="enhanced-ask-header">
          <h1>Ask Your Question</h1>
          <p>Get personalized guidance from experienced mentors</p>

          <div className="profile-strength-bar">
            <div className="strength-label">
              Profile Strength: <strong>{eligibility?.profileStrength || 0}%</strong>
            </div>
            <div className="strength-bar">
              <div className="strength-fill" style={{ width: `${eligibility?.profileStrength || 0}%` }}></div>
            </div>
            {eligibility && eligibility.profileStrength < 100 && (
              <button className="complete-profile-btn" onClick={() => navigate('/profile')}>
                Complete Profile
              </button>
            )}
          </div>

          <div className="credits-display">
            <span className="credits-icon">🎫</span>
            <span className="credits-text">
              {eligibility?.credits || 0} {eligibility?.credits === 1 ? 'Credit' : 'Credits'} Remaining
            </span>
            {eligibility?.credits === 0 ? (
              <button className="upgrade-btn" onClick={handlePayment}>
                💳 Buy 5 Credits - ₹1
              </button>
            ) : (
              <button className="buy-more-btn" onClick={handlePayment}>
                ➕ Buy More
              </button>
            )}
          </div>
        </div>

        <div className="step-indicator">
          <div className="step-header">
            <h3>Step 1 of {totalSteps} | Ask Your Question</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(1 / totalSteps) * 100}%` }}></div>
            </div>
          </div>
          <p className="next-step-hint">Next: Meet Your Matched Mentor 🎯</p>
        </div>

        <form className="question-form" onSubmit={handleGetAnswer}>
          <div className="form-group">
            <label htmlFor="title">
              Question Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., How do I prepare for a Product Manager interview?"
              maxLength={200}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
            <span className="char-count">{formData.title.length}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context: What's your background? What have you tried? What specific help do you need?"
              maxLength={1000}
              rows={8}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <span className="char-count">{formData.description.length}/1000</span>
          </div>

          <div className="form-group">
            <label>Company Domain <span className="required">*</span></label>
            <div className="domain-cards">
              {COMPANY_DOMAINS.map(domain => (
                <button
                  type="button"
                  key={domain.value}
                  className={`domain-card${formData.category === domain.value ? ' selected' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, category: domain.value });
                    setErrors({ ...errors, category: '' });
                  }}
                >
                  <span className="domain-icon">{domain.icon}</span>
                  {domain.label}
                </button>
              ))}
            </div>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Why are you asking this? (Optional)</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g., I have an interview next week and want to prepare effectively"
              maxLength={500}
              rows={3}
            />
            <span className="char-count">{formData.reason.length}/500</span>
          </div>

          <button
            type="submit"
            className="get-answer-btn"
            disabled={findingMentor || eligibility?.credits === 0}
          >
            {findingMentor ? 'Finding Best Mentor...' : 'Get My Answer 🚀'}
          </button>
        </form>

        {showMentorPreview && mentorPreview && (
          <div className="modal-overlay" onClick={() => setShowMentorPreview(false)}>
            <div className="mentor-preview-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowMentorPreview(false)}>×</button>

              <div className="step-indicator">
                <div className="step-header">
                  <h3>
                    Step 2 of {totalSteps} | {mentorPreview.instantAnswer ? '⚡ Instant Answer Found!' : 'Meet Your Mentor'}
                  </h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(2 / totalSteps) * 100}%` }}></div>
                  </div>
                </div>
                <p className="next-step-hint">
                  {mentorPreview.instantAnswer
                    ? 'This mentor has already answered a similar question! 🎯'
                    : 'Click continue to get your free answer card 🎁'}
                </p>
              </div>

              {mentorPreview.mentorFound || mentorPreview.mentorUsername === 'Atyant Engine' || mentorPreview.message?.includes('Atyant Engine') ? (
                <>
                  {/* TOPMATE-INSPIRED MENTOR SECTION */}
                  <div className="topmate-mentor-section">
                    <div className="mentor-header-badge">
                      {mentorPreview.instantAnswer ? '⚡ Instant Answer Available!' : '✨ Perfect Match Found'}
                    </div>

                    {mentorPreview?.mentor && (
                      <>
                        <div className="topmate-mentor-card-enhanced">
                          {/* Avatar Section - Larger & Centered */}
                          <div className="mentor-avatar-section">
                            <div className="mentor-avatar-wrapper-large">
                              {mentorPreview.mentor?.profileImage ? (
                                <img 
                                  src={mentorPreview.mentor.profileImage} 
                                  alt={mentorPreview.mentor.name} 
                                  className="mentor-avatar-img-large" 
                                />
                              ) : (
                                <div className="mentor-avatar-placeholder-large">
                                  {(mentorPreview.mentor?.name || 'M').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="verified-badge-large">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 0L14.6942 3.50532L19.0535 3.70535L18.7053 8.06458L22.2106 10.7587L18.7053 13.4529L19.0535 17.8122L14.6942 18.0122L12 21.5174L9.30583 18.0122L4.94649 17.8122L5.29466 13.4529L1.78934 10.7587L5.29466 8.06458L4.94649 3.70535L9.30583 3.50532L12 0Z" fill="#10B981"/>
                                  <path d="M8.25 12L10.5 14.25L15.75 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Mentor Info - Centered */}
                          <div className="mentor-info-section">
                            <h2 className="mentor-name-large">{mentorPreview.mentor?.name || 'Matched Mentor'}</h2>
                            <p className="mentor-tagline-large">{mentorPreview.mentor?.bio || 'Expert mentor ready to help you'}</p>
                            
                            {/* Match Score - Inline */}
                            <div className="match-score-inline">
                              <div className="match-score-circle-small">
                                <svg className="match-score-ring-small" viewBox="0 0 100 100">
                                  <defs>
                                    <linearGradient id="matchGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#10b981" />
                                      <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                  </defs>
                                  <circle className="match-score-bg-small" cx="50" cy="50" r="45" />
                                  <circle 
                                    className="match-score-fill-small" 
                                    cx="50" 
                                    cy="50" 
                                    r="45"
                                    style={{
                                      strokeDasharray: `${2 * Math.PI * 45}`,
                                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - (mentorPreview.mentor?.matchPercentage || 0) / 100)}`
                                    }}
                                  />
                                </svg>
                                <div className="match-score-text-small">
                                  <span className="match-score-number-small">{mentorPreview.mentor?.matchPercentage || 0}</span>
                                  <span className="match-score-percent-small">%</span>
                                </div>
                              </div>
                              <div className="match-score-label-inline">
                                <strong>Match Score</strong>
                                <span>Based on your profile</span>
                              </div>
                            </div>

                            {/* Expertise Pills */}
                            <div className="mentor-expertise-pills-centered">
                              {mentorPreview.mentor?.expertise?.slice(0, 4).map((exp, i) => (
                                <span key={i} className="expertise-pill-enhanced">{exp}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Mentor Services Section */}
                        <MentorServicesPreview mentorId={mentorPreview.mentor.id} />
                      </>
                    )}

                    {/* INSTANT ANSWER PREVIEW (if available) */}
                    {mentorPreview.instantAnswer && mentorPreview.answerPreview && (
                      <div className="instant-answer-preview-enhanced">
                        <h4>📝 Answer Preview:</h4>
                        <p>{mentorPreview.answerPreview}</p>
                        <span className="instant-badge">✨ Based on similar question</span>
                        {mentorPreview.answerCardId && (
                          <button
                            className="view-answer-btn"
                            onClick={e => {
                              e.preventDefault();
                              window.open(`/answer/${mentorPreview.answerCardId}`, '_blank');
                            }}
                          >
                            See Full Answer Card ↗
                          </button>
                        )}
                      </div>
                    )}

                    {/* ACTION BUTTON - MOVED ABOVE COMMUNITY INSIGHTS */}
                    <div className="mentor-actions-top">
                      <button
                        className="continue-btn-enhanced-top"
                        onClick={handleContinueFromMentor}
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : '🎁 Get Free Answer Card'}
                      </button>
                    </div>

                    {/* REDDIT STATS SECTION (AFTER MENTOR) */}
                    {mentorPreview?.redditStats && (
                      <div className="reddit-section">
                        <h3 className="section-divider">📊 Community Insights</h3>
                        <div className="reddit-stats-card">
                          <div className="stat-item">
                            <div className="stat-value">{mentorPreview.redditStats.totalSolved}+</div>
                            <div className="stat-label">students solved this</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{mentorPreview.mentor?.matchPercentage || 0}%</div>
                            <div className="stat-label">profile match</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{mentorPreview.redditStats.totalThreads || 0}</div>
                            <div className="stat-label">Reddit threads found</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {mentorPreview?.redditStats?.aiSummary && (
                      <div className="ai-summary-card">
                        <div className="summary-header">💡 What others did in your situation:</div>
                        <p>{mentorPreview.redditStats.aiSummary}</p>
                      </div>
                    )}

                    {mentorPreview?.redditStats?.top10Posts?.length > 0 && (
                      <div className="reddit-threads-card">
                        <div className="threads-header">
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="#ff4500" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="10" fill="#ff4500" />
                            <text x="5" y="15" fontSize="12" fill="white" fontWeight="bold">r/</text>
                          </svg>
                          Top Reddit Threads matching your question
                        </div>
                        <div className="threads-list">
                          {mentorPreview.redditStats.top10Posts.map((post, idx) => (
                            <a
                              key={idx}
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="thread-item"
                            >
                              <span className="thread-number">{idx + 1}.</span>
                              <div className="thread-content">
                                <div className="thread-title">{post.title}</div>
                                <div className="thread-meta">
                                  <span>⬆ {post.ups.toLocaleString()}</span>
                                  <span>💬 {post.numComments.toLocaleString()}</span>
                                  <span>{post.subreddit}</span>
                                </div>
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" className="thread-arrow">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}


                  </div>
                </>
              ) : (
                <>
                  <div className="mentor-card-preview" style={{ marginBottom: '1.5rem' }}>
                    <div className="mentor-avatar">
                      <div className="avatar-placeholder">🤖</div>
                    </div>
                    <div className="mentor-info">
                      <h3>Atyant Engine</h3>
                      <p className="mentor-bio">AI-powered assistant. Your question will be answered by our engine if no human mentor is available right now.</p>
                      <div className="mentor-expertise">
                        <span className="expertise-tag">AI Guidance</span>
                        <span className="expertise-tag">24/7 Support</span>
                      </div>
                      <div className="match-percentage">
                        <div className="match-circle">∞</div>
                        <span>AI Match</span>
                      </div>
                    </div>
                  </div>
                  <h2>📋 Question Received</h2>
                  <p>No mentor match found. Your question will be answered by <strong>Atyant Engine</strong> after submission.</p>
                  <button className="continue-btn-enhanced" onClick={handleContinueFromMentor} disabled={submitting}>
                    {submitting ? 'Submitting...' : '🎁 Get Free Answer Card'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {showQualityWarning && qualityCheck && (
          <div className="modal-overlay" onClick={() => setShowQualityWarning(false)}>
            <div className="quality-warning-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowQualityWarning(false)}>×</button>
              <div className="quality-notice">
                <p>💡 <strong>Quick Quality Check</strong> (before Step 3)</p>
                <p className="quality-subtitle">Improve your question for better mentor guidance</p>
              </div>
              <div className="warning-icon">⚠️</div>
              <h2>Your question needs more details for better guidance</h2>
              <div className="quality-score">
                <div className="score-circle">{qualityCheck.qualityScore}</div>
                <span>Quality Score</span>
              </div>
              <div className="quality-issues">
                <h3>Suggestions for improvement:</h3>
                <ul>
                  {qualityCheck.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
              <div className="warning-actions">
                <button className="improve-btn" onClick={handleImproveQuestion}>Improve Question</button>
                <button className="continue-anyway-btn" onClick={handleContinueAnyway}>Continue Anyway</button>
              </div>
            </div>
          </div>
        )}

        {showPreview && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="preview-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowPreview(false)}>×</button>
              <div className="step-indicator">
                <div className="step-header">
                  <h3>Step 3 of {totalSteps} | Review Your Question</h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(3 / totalSteps) * 100}%` }}></div>
                  </div>
                </div>
                <p className="next-step-hint">Final Step: Confirm & Submit ✅</p>
              </div>
              <h2>📋 Review Your Question</h2>
              <div className="preview-content">
                <div className="preview-item"><label>Title</label><p>{formData.title}</p></div>
                <div className="preview-item"><label>Description</label><p>{formData.description}</p></div>
                <div className="preview-item"><label>Category</label><p>{formData.category}</p></div>
                {formData.reason && (
                  <div className="preview-item"><label>Reason</label><p>{formData.reason}</p></div>
                )}
                {mentorPreview?.mentorFound && (
                  <div className="preview-item">
                    <label>Matched Mentor</label>
                    <p>
                      <strong>{mentorPreview?.mentor?.name}</strong>
                      <span className="match-badge">{mentorPreview?.mentor?.matchPercentage}% match</span>
                    </p>
                  </div>
                )}
                {qualityCheck && (
                  <div className="preview-item">
                    <label>Quality Score</label>
                    <div className="quality-badge" data-score={qualityCheck.qualityScore}>
                      {qualityCheck.qualityScore}/100
                    </div>
                  </div>
                )}
              </div>
              <div className="preview-actions">
                <button className="edit-btn" onClick={handleEditFromPreview} disabled={editTimeLeft <= 0}>
                  ✏️ Edit {editTimeLeft > 0 ? `(${Math.floor(editTimeLeft / 60)}m ${editTimeLeft % 60}s left)` : '(Expired)'}
                </button>
                <button className="confirm-btn" onClick={handleConfirmFromPreview}>✅ Confirm</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="modal-overlay" onClick={() => setShowConfirmation(false)}>
            <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowConfirmation(false)}>×</button>
              <div className="step-indicator">
                <div className="step-header">
                  <h3>Step 4 of {totalSteps} | Final Step | Confirm & Submit</h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <p className="next-step-hint final-hint">🎉 Almost done! One click away from getting your answer</p>
              </div>
              <h2>Are you sure you want to submit this question?</h2>
              <p className="confirmation-text">
                Our mentors will respond within <strong>24 hours</strong>.<br />
                This will use <strong>1 credit</strong> from your account.
              </p>
              <div className="credits-info">
                <div className="credit-item">
                  <span>Current Credits:</span>
                  <strong>{eligibility?.credits}</strong>
                </div>
                <div className="credit-item">
                  <span>After Submission:</span>
                  <strong>{(eligibility?.credits || 0) - 1}</strong>
                </div>
              </div>
              <div className="confirmation-actions">
                <button className="cancel-btn" onClick={() => setShowConfirmation(false)} disabled={submitting}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleFinalSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EnhancedAskQuestion;