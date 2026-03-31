import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/api.js';
import './MentorMonetization.css';
import MentorAvailabilityCalendar from './MentorAvailabilityCalendar.jsx';

const MentorMonetization = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [earnings, setEarnings] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState(null);
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const token = user?.token || localStorage.getItem('token');

  useEffect(() => {
    if (!token || user?.role !== 'mentor') {
      navigate('/');
      return;
    }
    fetchData();
  }, [token, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const [earningsRes, servicesRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/api/monetization/earnings`, { headers }),
        fetch(`${API_URL}/api/monetization/services`, { headers }),
        fetch(`${API_URL}/api/monetization/bookings`, { headers })
      ]);
      
      const [earningsData, servicesData, bookingsData] = await Promise.all([
        earningsRes.json(),
        servicesRes.json(),
        bookingsRes.json()
      ]);
      
      if (earningsData.success) setEarnings(earningsData);
      if (servicesData.success) setServices(servicesData.services);
      if (bookingsData.success) setBookings(bookingsData.bookings);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="monetization-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monetization-container">
      {/* Sidebar */}
      <aside className="monetization-sidebar">
        <div className="sidebar-header">
          <h2>💰 Monetization</h2>
          <p className="mentor-name">{user?.username}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <span className="nav-icon">🎯</span>
            <span>Services</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="nav-icon">📅</span>
            <span>Bookings</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            <span className="nav-icon">⏰</span>
            <span>Availability</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <span className="nav-icon">💵</span>
            <span>Earnings</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="back-btn"
            onClick={() => navigate('/mentor-dashboard')}
          >
            ← Back to Questions
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="monetization-main">
        {activeTab === 'overview' && (
          <OverviewTab 
            earnings={earnings} 
            services={services} 
            bookings={bookings} 
            formatCurrency={formatCurrency}
            setActiveTab={setActiveTab}
            user={user}
          />
        )}
        
        {activeTab === 'services' && (
          <ServicesTab 
            services={services} 
            setShowServiceModal={setShowServiceModal}
            setEditingService={setEditingService}
            formatCurrency={formatCurrency}
            fetchData={fetchData}
            token={token}
          />
        )}
        
        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} formatDate={formatDate} formatCurrency={formatCurrency} />
        )}
        
        {activeTab === 'availability' && (
          <AvailabilityTab token={token} />
        )}
        
        {activeTab === 'earnings' && (
          <EarningsTab earnings={earnings} formatCurrency={formatCurrency} />
        )}
      </main>

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onSave={fetchData}
          token={token}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ earnings, services, bookings, formatCurrency, setActiveTab, user }) => {
  const navigate = useNavigate();
  const activeServices = services.filter(s => s.isActive).length;
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.scheduledAt) > new Date()
  ).length;

  return (
    <div className="overview-tab">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Earnings</p>
            <h2 className="stat-value">{formatCurrency(earnings?.earnings?.total || 0)}</h2>
            <p className="stat-meta">Last {earnings?.earnings?.period || 30} days</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <p className="stat-label">Active Services</p>
            <h2 className="stat-value">{activeServices}</h2>
            <p className="stat-meta">{services.length} total</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Upcoming Bookings</p>
            <h2 className="stat-value">{upcomingBookings}</h2>
            <p className="stat-meta">{bookings.length} total</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <h2 className="stat-value">{earnings?.bookings?.completed || 0}</h2>
            <p className="stat-meta">Sessions delivered</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => setActiveTab('services')}
          >
            + Create Service
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate(`/mentor/${user._id || user.userId}`)}
          >
            👁️ Preview Profile
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('availability')}
          >
            ⏰ Set Availability
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('bookings')}
          >
            📅 View Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

// Services Tab Component
const ServicesTab = ({ services, setShowServiceModal, setEditingService, formatCurrency, fetchData, token }) => {
  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/monetization/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Service deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete service');
    }
  };

  return (
    <div className="services-tab">
      <div className="tab-header">
        <h1>My Services</h1>
        <button 
          className="create-btn"
          onClick={() => {
            setEditingService(null);
            setShowServiceModal(true);
          }}
        >
          + Create Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No services yet</h3>
          <p>Create your first service to start earning</p>
          <button 
            className="create-btn"
            onClick={() => setShowServiceModal(true)}
          >
            + Create Service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <span className={`service-type ${service.type}`}>
                  {service.type === 'video-call' && '📹'}
                  {service.type === 'audio-call' && '🎤'}
                  {service.type === 'chat' && '💬'}
                  {service.type === 'answer-card' && '🎯'}
                  {' '}
                  {service.type.replace('-', ' ')}
                </span>
                <div className="service-badges">
                  {service.isRecommended && (
                    <span className="recommended-badge">⭐ Recommended</span>
                  )}
                  <span className={`service-status ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-details">
                <div className="detail-item">
                  <span className="detail-label">Price</span>
                  <span className="detail-value">{formatCurrency(service.price)}</span>
                </div>
                {(service.type === 'video-call' || service.type === 'audio-call') && (
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{service.duration} min</span>
                  </div>
                )}
              </div>
              
              <div className="service-stats">
                <span>{service.totalSales || 0} sales</span>
                <span>{formatCurrency(service.totalRevenue || 0)} revenue</span>
              </div>
              
              <div className="service-actions">
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setEditingService(service);
                    setShowServiceModal(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(service._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bookings Tab Component
const BookingsTab = ({ bookings, formatDate, formatCurrency }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return b.status === 'confirmed' && new Date(b.scheduledAt) > new Date();
    if (filter === 'past') return b.status === 'completed' || new Date(b.scheduledAt) < new Date();
    return b.status === filter;
  });

  return (
    <div className="bookings-tab">
      <h1>Bookings</h1>
      
      <div className="filter-tabs">
        {['all', 'upcoming', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No bookings found</h3>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-user">
                  <img 
                    src={booking.userId?.profilePicture || '/default-avatar.png'} 
                    alt={booking.userId?.username}
                    className="user-avatar"
                  />
                  <div>
                    <h4>{booking.userId?.username}</h4>
                    <p>{booking.userId?.email}</p>
                  </div>
                </div>
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-details">
                <p><strong>Service:</strong> {booking.serviceId?.title}</p>
                {booking.scheduledAt && (
                  <p><strong>Scheduled:</strong> {formatDate(booking.scheduledAt)}</p>
                )}
                <p><strong>Amount:</strong> {formatCurrency(booking.amount)}</p>
                {booking.meetingLink && (
                  <p><strong>Meeting Link:</strong> <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">Join</a></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Availability Tab Component
const AvailabilityTab = ({ token }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`${API_URL}/api/monetization/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Fetch availability error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          enabled: !prev.weeklySchedule[day].enabled
        }
      }
    }));
  };

  const handleAddSlot = (day) => {
    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: [...(prev.weeklySchedule[day].slots || []), { start: '09:00', end: '10:00' }]
        }
      }
    }));
  };

  const handleRemoveSlot = (day, index) => {
    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: prev.weeklySchedule[day].slots.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleSlotChange = (day, index, field, value) => {
    setAvailability(prev => {
      const newSlots = [...prev.weeklySchedule[day].slots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            slots: newSlots
          }
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/monetization/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(availability)
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Availability saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="availability-tab">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading availability...</p>
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="availability-tab">
      <div className="tab-header">
        <h1>⏰ Set Your Availability</h1>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div className="availability-settings">
        <div className="setting-card">
          <div className="setting-icon">🌍</div>
          <div className="setting-content">
            <label>Timezone</label>
            <select 
              value={availability.timezone}
              onChange={e => setAvailability({ ...availability, timezone: e.target.value })}
            >
              <option value="Asia/Kolkata">🇮🇳 India (IST)</option>
              <option value="America/New_York">🇺🇸 New York (EST)</option>
              <option value="Europe/London">🇬🇧 London (GMT)</option>
              <option value="Asia/Dubai">🇦🇪 Dubai (GST)</option>
            </select>
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-icon">⏱️</div>
          <div className="setting-content">
            <label>Buffer Time Between Sessions</label>
            <select 
              value={availability.bufferTime}
              onChange={e => setAvailability({ ...availability, bufferTime: parseInt(e.target.value) })}
            >
              <option value="0">No buffer</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>
      </div>

      <div className="weekly-schedule">
        <h3>Weekly Schedule</h3>
        <MentorAvailabilityCalendar availability={availability} setAvailability={setAvailability} token={token} />
      </div>

      <div className="save-footer">
        <button className="save-btn-large" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Availability'}
        </button>
      </div>
    </div>
  );
};

// Earnings Tab Component
const EarningsTab = ({ earnings, formatCurrency }) => {
  return (
    <div className="earnings-tab">
      <h1>Earnings</h1>
      
      <div className="earnings-summary">
        <div className="earnings-card">
          <h3>Total Earnings</h3>
          <p className="earnings-amount">{formatCurrency(earnings?.earnings?.total || 0)}</p>
          <span className="earnings-period">Last {earnings?.earnings?.period || 30} days</span>
        </div>
        
        <div className="earnings-card">
          <h3>Transactions</h3>
          <p className="earnings-amount">{earnings?.earnings?.transactions || 0}</p>
          <span className="earnings-period">Completed payments</span>
        </div>
      </div>
      
      <div className="earnings-breakdown">
        <h3>Booking Status</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="breakdown-label">Pending</span>
            <span className="breakdown-value">{earnings?.bookings?.pending || 0}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Confirmed</span>
            <span className="breakdown-value">{earnings?.bookings?.confirmed || 0}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Completed</span>
            <span className="breakdown-value">{earnings?.bookings?.completed || 0}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Cancelled</span>
            <span className="breakdown-value">{earnings?.bookings?.cancelled || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Service Modal Component
const ServiceModal = ({ service, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    type: service?.type || 'video-call',
    title: service?.title || '',
    description: service?.description || '',
    price: service?.price || '',
    duration: service?.duration || 30,
    isRecommended: service?.isRecommended || false,
    isActive: service?.isActive ?? true
  });
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  // Auto-fill title and description based on type
  const serviceTemplates = {
    'video-call': {
      title: 'Video Call - 30 min',
      description: '1-on-1 video mentorship session. Get personalized guidance and career advice.',
      duration: 30,
      isRecommended: true
    },
    'audio-call': {
      title: 'Audio Call - 30 min',
      description: 'Voice call mentorship session. Perfect for quick discussions and guidance.',
      duration: 30,
      isRecommended: false
    },
    'chat': {
      title: '1-to-1 Platform Chat',
      description: 'Direct messaging on platform. Get answers to your questions via text.',
      duration: 0,
      isRecommended: true
    },
    'answer-card': {
      title: 'Answer Card (Reusable)',
      description: 'Record once, help many! Audio answer that can be reused for similar questions.',
      duration: 0,
      isRecommended: true
    }
  };

  const handleTypeChange = (type) => {
    const template = serviceTemplates[type];
    setFormData({
      ...formData,
      type,
      title: template.title,
      description: template.description,
      duration: template.duration,
      isRecommended: template.isRecommended
    });
  };

  const handleRecord = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        mr.start();
        mediaRecorderRef.current = mr;
        setRecording(true);
      } catch (err) {
        alert('Microphone access denied: ' + err.message);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // For now, we'll store audio as base64 if recorded
      const submitData = { ...formData };
      
      if (audioBlob && formData.type === 'answer-card') {
        // Convert audio to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          submitData.audioUrl = reader.result;
          await saveService(submitData);
        };
      } else {
        await saveService(submitData);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save service');
      setSubmitting(false);
    }
  };

  const saveService = async (data) => {
    try {
      const url = service 
        ? `${API_URL}/api/monetization/services/${service._id}`
        : `${API_URL}/api/monetization/services`;
      
      const res = await fetch(url, {
        method: service ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();
      if (responseData.success) {
        alert(service ? 'Service updated!' : 'Service created!');
        onSave();
        onClose();
      } else {
        alert('Error: ' + responseData.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{service ? 'Edit Service' : 'Create Service'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-group">
            <label>Service Type</label>
            <select
              value={formData.type}
              onChange={e => handleTypeChange(e.target.value)}
              required
            >
              <option value="video-call">📹 Video Call</option>
              <option value="audio-call">🎤 Audio Call</option>
              <option value="chat">💬 1-to-1 Chat</option>
              <option value="answer-card">🎯 Answer Card (Reusable)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Video Call - 30 min"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included..."
              required
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="999"
                required
                min={0}
              />
            </div>

            {(formData.type === 'video-call' || formData.type === 'audio-call') && (
              <div className="form-group">
                <label>Duration (minutes)</label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
            )}
          </div>

          {formData.type === 'answer-card' && (
            <div className="form-group audio-recording-section">
              <label>Record Audio Answer (Optional)</label>
              <button 
                type="button" 
                className="record-btn"
                onClick={handleRecord}
              >
                {recording ? '⏹️ Stop Recording' : '🎤 Record Audio'}
              </button>
              {audioBlob && (
                <div className="audio-preview">
                  <audio controls src={URL.createObjectURL(audioBlob)} />
                  <button 
                    type="button" 
                    className="delete-audio-btn"
                    onClick={() => setAudioBlob(null)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
              <p className="help-text">Record a sample answer that can be reused for similar questions</p>
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isRecommended}
                onChange={e => setFormData({ ...formData, isRecommended: e.target.checked })}
              />
              <span>Mark as Recommended</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active (visible to students)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Saving...' : service ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorMonetization;
