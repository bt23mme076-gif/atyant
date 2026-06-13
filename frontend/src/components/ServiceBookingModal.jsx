import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/api.js';
import './ServiceBookingModal.css';

const ServiceBookingModal = ({ service, mentorId, onClose, user }) => {
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [customRequest, setCustomRequest] = useState({
    preferredDates: ['', '', ''],
    preferredTimeRange: { start: '', end: '' },
    message: ''
  });

  useEffect(() => {
    fetchMentorAvailability();
  }, [mentorId]);

  const fetchMentorAvailability = async () => {
    try {
      const res = await fetch(`${API_URL}/api/monetization/availability/mentor/${mentorId}`);
      const data = await res.json();
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Fetch availability error:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const getAvailableDates = () => {
    if (!availability) return [];
    
    const dates = [];
    const today = new Date();
    
    // Generate next 60 days
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = availability.weeklySchedule[dayName];
      
      // Check if mentor is available on this day
      if (daySchedule && daySchedule.enabled && daySchedule.slots && daySchedule.slots.length > 0) {
        // Check if date is not blocked
        const isBlocked = availability.blockedDates?.some(blocked => {
          const blockedDate = new Date(blocked.date);
          return blockedDate.toDateString() === date.toDateString();
        });
        
        if (!isBlocked) {
          dates.push({
            date: date.toISOString().split('T')[0],
            dayName,
            displayDate: date.toLocaleDateString('en-IN', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short',
              year: 'numeric'
            })
          });
        }
      }
    }
    
    return dates;
  };

  const getAvailableSlots = (selectedDate) => {
    if (!availability || !selectedDate) return [];
    
    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = availability.weeklySchedule[dayName];
    
    if (!daySchedule || !daySchedule.enabled || !daySchedule.slots) return [];
    
    const slots = [];
    const serviceDuration = service.duration || 30;
    const bufferTime = availability.bufferTime || 15;
    
    daySchedule.slots.forEach(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      
      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      while (currentTime + serviceDuration <= endTime) {
        const hour = Math.floor(currentTime / 60);
        const min = currentTime % 60;
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeStr,
          display: formatTime(timeStr)
        });
        
        currentTime += serviceDuration + bufferTime;
      }
    });
    
    return slots;
  };

  const formatTime = (time) => {
    const [hour, min] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  };

  const handleBooking = async () => {
    if ((service.type === 'video-call' || service.type === 'audio-call') && (!selectedDate || !selectedSlot)) {
      alert('Please select date and time slot');
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = selectedDate && selectedSlot 
        ? `${selectedDate}T${selectedSlot.time}:00` 
        : null;

      console.log('Creating booking order...', {
        API_URL,
        amount: service.price,
        serviceId: service._id,
        mentorId,
        scheduledAt,
        notes
      });

      // Create Razorpay order
      const orderRes = await fetch(`${API_URL}/api/payment/create-booking-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          amount: service.price,
          serviceId: service._id,
          mentorId,
          scheduledAt,
          notes
        })
      });

      console.log('Order response status:', orderRes.status);
      console.log('Order response headers:', Object.fromEntries(orderRes.headers.entries()));

      // Check if response is JSON
      const contentType = orderRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await orderRes.text();
        console.error('Non-JSON response:', text.substring(0, 500));
        throw new Error(`Server error (${orderRes.status}). Please check if the backend is running at ${API_URL}`);
      }

      const orderData = await orderRes.json();
      console.log('Order response:', orderData);
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Initialize Razorpay
      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Atyant',
        description: service.title,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            console.log('Payment successful, verifying...', response);
            
            // Verify payment
            const verifyRes = await fetch(`${API_URL}/api/payment/verify-booking`, {
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
                scheduledAt,
                notes
              })
            });

            // Check if response is JSON
            const contentType = verifyRes.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await verifyRes.text();
              console.error('Non-JSON response:', text);
              throw new Error('Server error during payment verification. Please contact support with payment ID: ' + response.razorpay_payment_id);
            }

            const verifyData = await verifyRes.json();
            console.log('Verification response:', verifyData);
            
            if (verifyData.success) {
              alert('✅ Booking confirmed! Redirecting to My Questions...');
              onClose();
              
              // Always redirect to My Questions page
              window.location.href = '/my-questions';
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('❌ ' + error.message);
          }
        },
        prefill: {
          name: user.name || user.username,
          email: user.email
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('❌ Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Booking error:', error);
      alert('❌ ' + (error.message || 'Failed to create booking. Please try again.'));
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleCustomRequestSubmit = async () => {
    // TODO: Implement custom availability request
    alert('Custom availability request feature coming soon! The mentor will be notified of your preferred times.');
    setShowCustomRequest(false);
  };

  const availableDates = getAvailableDates();
  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-container" onClick={e => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>Book: {service.title}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="booking-modal-content">
          {/* Service Summary */}
          <div className="booking-summary">
            <div className="summary-row">
              <span className="summary-label">Service:</span>
              <span className="summary-value">{service.title}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{service.duration} minutes</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Price:</span>
              <span className="summary-value price">₹{service.price}</span>
            </div>
          </div>

          {(service.type === 'video-call' || service.type === 'audio-call') && (
            <>
              {loadingAvailability ? (
                <div className="loading-availability">
                  <div className="spinner-small"></div>
                  <p>Loading mentor availability...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="no-availability">
                  <p>😔 No available slots found in the next 30 days.</p>
                  <button 
                    className="request-custom-btn"
                    onClick={() => setShowCustomRequest(true)}
                  >
                    📅 Request Custom Time
                  </button>
                </div>
              ) : (
                <>
                  {/* Date Selection */}
                  <div className="form-section">
                    <label className="form-label">
                      <span className="label-icon">📅</span>
                      Select Date
                    </label>
                    <select 
                      className="form-select"
                      value={selectedDate} 
                      onChange={e => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      required
                    >
                      <option value="">Choose a date</option>
                      {availableDates.map(dateObj => (
                        <option key={dateObj.date} value={dateObj.date}>
                          {dateObj.displayDate}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div className="form-section">
                      <label className="form-label">
                        <span className="label-icon">⏰</span>
                        Select Time Slot
                      </label>
                      {availableSlots.length === 0 ? (
                        <p className="no-slots">No available slots for this date</p>
                      ) : (
                        <div className="time-slots-grid">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              className={`time-slot-btn ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot.display}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Request Custom Time */}
                  <button 
                    className="request-custom-link"
                    onClick={() => setShowCustomRequest(true)}
                  >
                    Can't find a suitable time? Request custom availability →
                  </button>
                </>
              )}
            </>
          )}

          {/* Notes */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Notes (Optional)
            </label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific requirements or questions..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="booking-actions">
            <button className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              className="pay-btn" 
              onClick={handleBooking}
              disabled={loading || (service.type === 'video-call' || service.type === 'audio-call') && (!selectedDate || !selectedSlot)}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Processing...
                </>
              ) : (
                <>
                  💳 Pay ₹{service.price}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Request Modal */}
        {showCustomRequest && (
          <div className="custom-request-overlay" onClick={() => setShowCustomRequest(false)}>
            <div className="custom-request-modal" onClick={e => e.stopPropagation()}>
              <h3>Request Custom Availability</h3>
              <p className="custom-request-desc">
                Can't find a suitable time? Let the mentor know your preferred availability.
              </p>

              <div className="form-section">
                <label className="form-label">Preferred Dates (up to 3)</label>
                {customRequest.preferredDates.map((date, index) => (
                  <input
                    key={index}
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={e => {
                      const newDates = [...customRequest.preferredDates];
                      newDates[index] = e.target.value;
                      setCustomRequest({ ...customRequest, preferredDates: newDates });
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                ))}
              </div>

              <div className="form-section">
                <label className="form-label">Preferred Time Range</label>
                <div className="time-range-inputs">
                  <input
                    type="time"
                    className="form-input"
                    value={customRequest.preferredTimeRange.start}
                    onChange={e => setCustomRequest({
                      ...customRequest,
                      preferredTimeRange: { ...customRequest.preferredTimeRange, start: e.target.value }
                    })}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    className="form-input"
                    value={customRequest.preferredTimeRange.end}
                    onChange={e => setCustomRequest({
                      ...customRequest,
                      preferredTimeRange: { ...customRequest.preferredTimeRange, end: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Additional Message</label>
                <textarea
                  className="form-textarea"
                  value={customRequest.message}
                  onChange={e => setCustomRequest({ ...customRequest, message: e.target.value })}
                  placeholder="Any additional information for the mentor..."
                  rows={3}
                />
              </div>

              <div className="custom-request-actions">
                <button className="cancel-btn" onClick={() => setShowCustomRequest(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleCustomRequestSubmit}>
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceBookingModal;
