import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/api.js';
import './MyBookings.css';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const token = user?.token || localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/monetization/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return b.status === 'confirmed' && new Date(b.scheduledAt) > new Date();
    if (filter === 'past') return b.status === 'completed' || new Date(b.scheduledAt) < new Date();
    return b.status === filter;
  });

  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h1>📅 My Bookings</h1>
        <p>Manage your upcoming and past sessions</p>
      </div>

      <div className="filter-tabs-bookings">
        {['all', 'upcoming', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`filter-tab-booking ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="count-badge">{bookings.filter(b => {
              if (f === 'all') return true;
              if (f === 'upcoming') return b.status === 'confirmed' && new Date(b.scheduledAt) > new Date();
              return b.status === f;
            }).length}</span>
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-bookings">
          <div className="empty-icon">📭</div>
          <h3>No bookings found</h3>
          <p>Book a session with a mentor to get started</p>
          <button className="browse-mentors-btn" onClick={() => navigate('/mentors')}>
            Browse Mentors
          </button>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map(booking => (
            <div key={booking._id} className={`booking-card-user ${booking.status}`}>
              <div className="booking-card-header">
                <div className="mentor-info-mini">
                  <img 
                    src={booking.mentorId?.profilePicture || '/default-avatar.png'} 
                    alt={booking.mentorId?.name}
                    className="mentor-avatar-mini"
                  />
                  <div>
                    <h4>{booking.mentorId?.name}</h4>
                    <p>@{booking.mentorId?.username}</p>
                  </div>
                </div>
                <span className={`status-badge-user ${booking.status}`}>
                  {booking.status === 'confirmed' && '✅'}
                  {booking.status === 'completed' && '✔️'}
                  {booking.status === 'cancelled' && '❌'}
                  {booking.status === 'pending' && '⏳'}
                  {' '}
                  {booking.status}
                </span>
              </div>

              <div className="booking-details-user">
                <div className="detail-row-user">
                  <span className="detail-icon">
                    {booking.serviceId?.type === 'video-call' && '📹'}
                    {booking.serviceId?.type === 'audio-call' && '🎤'}
                    {booking.serviceId?.type === 'chat' && '💬'}
                    {booking.serviceId?.type === 'answer-card' && '🎯'}
                  </span>
                  <span className="detail-text">{booking.serviceId?.title}</span>
                </div>

                {booking.scheduledAt && (
                  <div className="detail-row-user">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{formatDate(booking.scheduledAt)}</span>
                  </div>
                )}

                <div className="detail-row-user">
                  <span className="detail-icon">💰</span>
                  <span className="detail-text">{formatCurrency(booking.amount)}</span>
                </div>

                {booking.serviceId?.duration && (
                  <div className="detail-row-user">
                    <span className="detail-icon">⏱️</span>
                    <span className="detail-text">{booking.serviceId.duration} minutes</span>
                  </div>
                )}
              </div>

              {booking.notes && (
                <div className="booking-notes">
                  <strong>Notes:</strong> {booking.notes}
                </div>
              )}

              {booking.meetingLink && booking.status === 'confirmed' && new Date(booking.scheduledAt) > new Date() && (
                <a 
                  href={booking.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="join-meeting-btn"
                >
                  🎥 Join Meeting
                </a>
              )}

              {booking.status === 'confirmed' && new Date(booking.scheduledAt) > new Date() && (
                <div className="booking-actions-user">
                  <button 
                    className="reschedule-btn-user"
                    onClick={() => handleReschedule(booking)}
                    disabled={booking.rescheduleCount >= 2}
                  >
                    🔄 Reschedule {booking.rescheduleCount > 0 && `(${2 - booking.rescheduleCount} left)`}
                  </button>
                  <button 
                    className="cancel-btn-user"
                    onClick={() => handleCancel(booking)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}

              {booking.status === 'cancelled' && booking.refundAmount > 0 && (
                <div className="refund-info">
                  💰 Refund: {formatCurrency(booking.refundAmount)} ({booking.refundStatus})
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRescheduleModal && selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={fetchBookings}
          token={token}
        />
      )}

      {showCancelModal && selectedBooking && (
        <CancelModal
          booking={selectedBooking}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={fetchBookings}
          token={token}
        />
      )}
    </div>
  );
};

// Reschedule Modal
const RescheduleModal = ({ booking, onClose, onSuccess, token }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/monetization/bookings/${booking._id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newDate, newTime })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Booking rescheduled successfully!');
        onSuccess();
        onClose();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Reschedule error:', error);
      alert('Failed to reschedule booking');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  return (
    <div className="modal-overlay-booking" onClick={onClose}>
      <div className="modal-content-booking" onClick={e => e.stopPropagation()}>
        <div className="modal-header-booking">
          <h3>🔄 Reschedule Booking</h3>
          <button className="close-btn-booking" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-booking">
          <p>Current: {new Date(booking.scheduledAt).toLocaleString('en-IN')}</p>
          
          <div className="form-group-modal">
            <label>New Date</label>
            <select value={newDate} onChange={e => setNewDate(e.target.value)}>
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

          <div className="form-group-modal">
            <label>New Time</label>
            <select value={newTime} onChange={e => setNewTime(e.target.value)}>
              <option value="">Choose a time</option>
              {getTimeSlots().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="warning-box">
            ⚠️ You can reschedule up to 2 times. Remaining: {2 - (booking.rescheduleCount || 0)}
          </div>

          <div className="modal-actions-booking">
            <button className="cancel-modal-btn" onClick={onClose}>Cancel</button>
            <button 
              className="confirm-modal-btn" 
              onClick={handleReschedule}
              disabled={loading}
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cancel Modal
const CancelModal = ({ booking, onClose, onSuccess, token }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateRefund = () => {
    const hoursUntil = (new Date(booking.scheduledAt) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil > 24) return { percentage: 100, amount: booking.amount };
    if (hoursUntil > 12) return { percentage: 50, amount: booking.amount * 0.5 };
    return { percentage: 0, amount: 0 };
  };

  const refund = calculateRefund();

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/monetization/bookings/${booking._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Booking cancelled. Refund: ₹${data.refundAmount} (${data.refundPercentage}%)`);
        onSuccess();
        onClose();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-booking" onClick={onClose}>
      <div className="modal-content-booking" onClick={e => e.stopPropagation()}>
        <div className="modal-header-booking">
          <h3>❌ Cancel Booking</h3>
          <button className="close-btn-booking" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-booking">
          <div className="refund-info-box">
            <h4>Refund Policy</h4>
            <p>You will receive: <strong>₹{refund.amount} ({refund.percentage}%)</strong></p>
            <ul>
              <li>Cancel 24+ hours before: 100% refund</li>
              <li>Cancel 12-24 hours before: 50% refund</li>
              <li>Cancel less than 12 hours: No refund</li>
            </ul>
          </div>

          <div className="form-group-modal">
            <label>Reason for Cancellation</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              rows={4}
              required
            />
          </div>

          <div className="modal-actions-booking">
            <button className="cancel-modal-btn" onClick={onClose}>Keep Booking</button>
            <button 
              className="confirm-cancel-btn" 
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
