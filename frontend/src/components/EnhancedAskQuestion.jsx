import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../services/api.js';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EnhancedAskQuestion.css';

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
            setSelectedService(null);
          }}
          user={user}
        />
      )}
    </div>
  );
};

// Service Booking Modal Component
const ServiceBookingModal = ({ service, mentorId, onClose, user }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async () => {
    if ((service.type === 'video-call' || service.type === 'audio-call') && (!selectedDate || !selectedTime)) {
      alert('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          amount: service.price,
          serviceId: service._id,
          mentorId,
          scheduledAt: (service.type === 'video-call' || service.type === 'audio-call') ? `${selectedDate}T${selectedTime}` : null,
          notes
        })
      });

      const orderData = await orderRes.json();
      
      if (orderData.success) {
        // Initialize Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'Atyant',
          description: service.title,
          order_id: orderData.order.id,
          handler: async function (response) {
            // Verify payment
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                serviceId: service._id,
                mentorId,
                scheduledAt: (service.type === 'video-call' || service.type === 'audio-call') ? `${selectedDate}T${selectedTime}` : null,
                notes
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert('✅ Booking confirmed! Check your email for details.');
              onClose();
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#667eea'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate next 30 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Generate time slots
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h3>Book: {service.title}</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="booking-modal-body">
          <div className="booking-summary-box">
            <div className="summary-row">
              <span>Service:</span>
              <strong>{service.title}</strong>
            </div>
            <div className="summary-row">
              <span>Price:</span>
              <strong>₹{service.price}</strong>
            </div>
            {(service.type === 'video-call' || service.type === 'audio-call') && (
              <div className="summary-row">
                <span>Duration:</span>
                <strong>{service.duration} minutes</strong>
              </div>
            )}
          </div>

          {(service.type === 'video-call' || service.type === 'audio-call') && (
            <>
              <div className="form-group-booking">
                <label>Select Date</label>
                <select 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)}
                  required
                >
                  <option value="">Choose a date</option>
                  {getAvailableDates().map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-booking">
                <label>Select Time</label>
                <select 
                  value={selectedTime} 
                  onChange={e => setSelectedTime(e.target.value)}
                  required
                >
                  <option value="">Choose a time</option>
                  {getTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group-booking">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific requirements..."
              rows={3}
            />
          </div>

          <div className="booking-modal-actions">
            <button className="cancel-booking-btn" onClick={onClose}>Cancel</button>
            <button 
              className="confirm-booking-btn" 
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ₹${service.price}`}
            </button>
          </div>
        </div>
      </div>
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
  const totalSteps = 4;

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
        headers: { Authorization: `Bearer ${token}` }
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

  const handleContinueFromMentor = () => {
    setShowMentorPreview(false);
    // If the mentor preview contained an instant answer and the user
    // chose to continue, we should force live routing to mentors.
    if (mentorPreview?.instantAnswer) setForceLive(true);
    setCurrentStep(3);
    checkQuestionQuality();
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
        headers: { Authorization: `Bearer ${token}` }
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
                    : 'Next: Quality Check & Review 📝'}
                </p>
              </div>

              {mentorPreview.mentorFound || mentorPreview.mentorUsername === 'Atyant Engine' || mentorPreview.message?.includes('Atyant Engine') ? (
                <>
                  {mentorPreview?.redditStats && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        color: 'white'
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                          {mentorPreview.redditStats.totalSolved}+
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>students solved this</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                          {mentorPreview.mentor?.matchPercentage || 0}%
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>profile match</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                          {mentorPreview.redditStats.totalThreads || 0}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>Reddit threads found</div>
                      </div>
                    </div>
                  )}

                  {mentorPreview?.redditStats?.aiSummary && (
                    <div
                      style={{
                        background: '#f8f9ff',
                        border: '1px solid #e0e3ff',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        💡 What others did in your situation:
                      </div>
                      <p style={{ margin: 0 }}>{mentorPreview.redditStats.aiSummary}</p>
                    </div>
                  )}

                  {mentorPreview?.redditStats?.top10Posts?.length > 0 && (
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 'bold',
                          marginBottom: '12px',
                          fontSize: '14px',
                          color: '#333',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="#ff4500" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="10" fill="#ff4500" />
                          <text x="5" y="15" fontSize="12" fill="white" fontWeight="bold">r/</text>
                        </svg>
                        Top Reddit Threads matching your question
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mentorPreview.redditStats.top10Posts.map((post, idx) => (
                          <a
                            key={idx}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '10px 12px',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              color: '#111',
                              border: '1px solid #f0f0f0',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                          >
                            <span style={{ minWidth: '22px', fontWeight: 'bold', color: '#6b7280', fontSize: '13px', paddingTop: '1px' }}>
                              {idx + 1}.
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.4', marginBottom: '4px' }}>
                                {post.title}
                              </div>
                              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#9ca3af' }}>
                                <span>⬆ {post.ups.toLocaleString()}</span>
                                <span>💬 {post.numComments.toLocaleString()}</span>
                                <span>{post.subreddit}</span>
                              </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ marginTop: '3px', flexShrink: 0 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <h2>
                    {mentorPreview.instantAnswer
                      ? '⚡ Instant Answer Available!'
                      : '✨ We found the best mentor for your question!'}
                  </h2>

                  {mentorPreview.instantAnswer && mentorPreview.answerPreview && (
                    <div className="instant-answer-preview">
                      <h4>📝 Answer Preview:</h4>
                      <p>{mentorPreview.answerPreview}</p>
                      <span className="instant-badge">✨ Based on similar question</span>
                      {mentorPreview.answerCardId && (
                        <button
                          className="view-answer-btn"
                          style={{
                            marginTop: '12px',
                            padding: '8px 16px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            transition: 'background 0.2s'
                          }}
                          onClick={e => {
                            e.preventDefault();
                            window.open(`/answer/${mentorPreview.answerCardId}`, '_blank');
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
                        >
                          See Full Answer Card ↗
                        </button>
                      )}
                    </div>
                  )}

                  {mentorPreview?.mentor && (
                    <>
                      <div className="mentor-card-preview">
                        <div className="mentor-avatar">
                          {mentorPreview.mentor?.profileImage ? (
                            <img src={mentorPreview.mentor.profileImage} alt="Mentor" />
                          ) : (
                            <div className="avatar-placeholder">👤</div>
                          )}
                        </div>
                        <div className="mentor-info">
                          <h3>{mentorPreview.mentor?.name || 'Matched Mentor'}</h3>
                          <p className="mentor-bio">{mentorPreview.mentor?.bio || 'A mentor match has been found for your question.'}</p>
                          <div className="mentor-expertise">
                            {mentorPreview.mentor?.expertise?.slice(0, 3).map((exp, i) => (
                              <span key={i} className="expertise-tag">{exp}</span>
                            ))}
                          </div>
                          <div className="match-percentage">
                            <div className="match-circle">{mentorPreview.mentor?.matchPercentage || 0}%</div>
                            <span>Match Score</span>
                          </div>
                        </div>
                      </div>

                      {/* Mentor Services Section */}
                      <MentorServicesPreview mentorId={mentorPreview.mentor.id} />
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexDirection: 'row' }}>
                    {mentorPreview.mentor && mentorPreview.mentor.id && (
                      <button
                        className="continue-btn"
                        style={{ background: '#10b981', flex: 1, opacity: 0.7, cursor: 'not-allowed' }}
                        disabled
                        onClick={() => {
                          toast.info('Chat feature coming soon!', { position: 'top-center', autoClose: 2500 });
                        }}
                      >
                        💬 Chat Now
                      </button>
                    )}
                    <button
                      className="continue-btn"
                      onClick={handleContinueFromMentor}
                      disabled={checkingQuality}
                      style={{ flex: 1 }}
                    >
                      {checkingQuality ? 'Analyzing...' : 'Continue'}
                    </button>
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
                  <button className="continue-btn" onClick={handleContinueFromMentor}>
                    Continue
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