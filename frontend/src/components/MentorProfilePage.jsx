import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API_URL } from '../services/api.js';
import './MentorProfilePage.css';

const MentorProfilePage = () => {
  const { mentorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const token = user?.token || localStorage.getItem('token');

  useEffect(() => {
    fetchMentorData();
  }, [mentorId]);

  const fetchMentorData = async () => {
    try {
      const [mentorRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/api/mentor/mentors/${mentorId}`),
        fetch(`${API_URL}/api/monetization/services/mentor/${mentorId}`)
      ]);

      const mentorData = await mentorRes.json();
      const servicesData = await servicesRes.json();

      setMentor(mentorData);
      if (servicesData.success) {
        setServices(servicesData.services.filter(s => s.isActive));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    if (!token) {
      navigate('/login');
      return;
    }
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

  if (loading) {
    return (
      <div className="mentor-profile-loading">
        <div className="spinner"></div>
        <p>Loading mentor profile...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mentor-profile-error">
        <h2>Mentor not found</h2>
        <button onClick={() => navigate('/mentors')}>Back to Mentors</button>
      </div>
    );
  }

  return (
    <div className="mentor-profile-page">
      {/* Hero Section */}
      <div className="mentor-hero">
        <div className="mentor-hero-content">
          <div className="mentor-avatar-section">
            <img 
              src={mentor.profilePicture || mentor.profileImage || '/default-avatar.png'} 
              alt={mentor.username}
              className="mentor-avatar-large"
            />
            <div className="mentor-status">
              <span className={`status-indicator ${mentor.isOnline ? 'online' : 'offline'}`}></span>
              {mentor.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>

          <div className="mentor-info">
            <h1>{mentor.name || mentor.username}</h1>
            <p className="mentor-username">@{mentor.username}</p>
            
            {mentor.bio && <p className="mentor-bio">{mentor.bio}</p>}

            <div className="mentor-meta">
              {mentor.city && (
                <span className="meta-item">
                  📍 {mentor.city}
                </span>
              )}
              {mentor.yearsOfExperience > 0 && (
                <span className="meta-item">
                  💼 {mentor.yearsOfExperience} years experience
                </span>
              )}
              {mentor.rating > 0 && (
                <span className="meta-item">
                  ⭐ {mentor.rating.toFixed(1)} rating
                </span>
              )}
            </div>

            {/* Actions removed from here, moved to dedicated section below */}
          </div>
        </div>
      </div>

      {/* Expertise Section */}
      {mentor.expertise && mentor.expertise.length > 0 && (
        <div className="mentor-section">
          <h2>Expertise</h2>
          <div className="expertise-tags">
            {mentor.expertise.map((exp, idx) => (
              <span key={idx} className="expertise-tag">{exp}</span>
            ))}
          </div>
        </div>
      )}

      {/* Premium AnswerCard Promo Section */}
      <div className="mentor-section answer-card-promo-section">
        <div className="promo-content">
          <div className="promo-badge">💎 ATYANT PREMIUM SYSTEM</div>
          <h2>Get a Personalized Answer Card</h2>
          <p>
            Skip the 1:1 call and get a detailed <strong>Answer Card</strong> from {mentor.name || mentor.username}. 
            Our AI engine collects the mentor's exact experience to solve your specific problem.
          </p>
          <div className="promo-features">
            <div className="promo-feature">✨ Real experience-based solution</div>
            <div className="promo-feature">⚡ Faster than scheduling a call</div>
            <div className="promo-feature">📄 Lifetime access to your answer</div>
          </div>
          <div className="promo-actions">
            <button 
              className="btn-promo-primary"
              onClick={() => navigate('/my-questions')}
            >
              🎯 Get Answer Card
            </button>
          </div>
        </div>
        <div className="promo-visual">
          <div className="visual-card">
            <div className="visual-line"></div>
            <div className="visual-line short"></div>
            <div className="visual-check">✓</div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      {mentor.skills && mentor.skills.length > 0 && (
        <div className="mentor-section">
          <h2>Skills</h2>
          <div className="skills-tags">
            {mentor.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <div className="mentor-section services-section">
          <h2>💰 Paid Services</h2>
          <p className="section-subtitle">Book a session or purchase a service</p>
          
          <div className="services-grid">
            {services.map(service => (
              <div key={service._id} className="service-card-public">
                <div className="service-type-badge">
                  {service.type === 'session' && '📞 1:1 Session'}
                  {service.type === 'package' && '📦 Package'}
                  {service.type === 'digital-product' && '📄 Digital Product'}
                </div>
                
                <h3>{service.title}</h3>
                <p className="service-description">{service.description}</p>
                
                <div className="service-details-public">
                  {service.type === 'session' && (
                    <div className="detail">
                      <span className="detail-icon">⏱️</span>
                      <span>{service.duration} minutes</span>
                    </div>
                  )}
                  {service.type === 'package' && (
                    <div className="detail">
                      <span className="detail-icon">📊</span>
                      <span>{service.sessionsIncluded} sessions</span>
                    </div>
                  )}
                </div>
                
                <div className="service-footer">
                  <div className="service-price">
                    {formatCurrency(service.price)}
                  </div>
                  <button 
                    className="book-btn"
                    onClick={() => handleBookService(service)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {mentor.education && mentor.education.length > 0 && (
        <div className="mentor-section">
          <h2>Education</h2>
          <div className="education-list">
            {mentor.education.map((edu, idx) => (
              <div key={idx} className="education-item">
                <h4>{edu.institutionName || edu.institution}</h4>
                {edu.degree && <p>{edu.degree} {edu.field && `in ${edu.field}`}</p>}
                {edu.year && <p className="edu-year">{edu.year}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="mentor-section">
        <h2>Stats</h2>
        <div className="stats-grid-public">
          <div className="stat-item">
            <div className="stat-value">{mentor.profileViews || 0}</div>
            <div className="stat-label">Profile Views</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{mentor.totalChats || 0}</div>
            <div className="stat-label">Total Chats</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{mentor.successfulMatches || 0}</div>
            <div className="stat-label">Successful Matches</div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          mentor={mentor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          token={token}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ service, mentor, onClose, token }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async () => {
    if (service.type === 'session' && (!selectedDate || !selectedTime)) {
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: service.price,
          serviceId: service._id,
          mentorId: mentor._id,
          scheduledAt: service.type === 'session' ? `${selectedDate}T${selectedTime}` : null,
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
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                serviceId: service._id,
                mentorId: mentor._id,
                scheduledAt: service.type === 'session' ? `${selectedDate}T${selectedTime}` : null,
                notes
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert('✅ Booking confirmed! Check your email for details.');
              onClose();
              navigate('/my-bookings');
            }
          },
          prefill: {
            name: mentor.name,
            email: mentor.email
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

  // Generate next 30 days for date selection
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book: {service.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="booking-form">
          <div className="booking-summary">
            <div className="summary-item">
              <span>Mentor:</span>
              <strong>{mentor.name || mentor.username}</strong>
            </div>
            <div className="summary-item">
              <span>Price:</span>
              <strong>₹{service.price}</strong>
            </div>
            {service.type === 'session' && (
              <div className="summary-item">
                <span>Duration:</span>
                <strong>{service.duration} minutes</strong>
              </div>
            )}
          </div>

          {service.type === 'session' && (
            <>
              <div className="form-group">
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

              <div className="form-group">
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

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific requirements or questions..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              className="submit-btn" 
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

export default MentorProfilePage;
