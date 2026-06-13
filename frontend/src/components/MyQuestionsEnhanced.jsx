// src/components/MyQuestionsEnhanced.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './MyQuestions.css';
import { API_URL } from '../services/api.js';

const REFRESH_INTERVAL = 10_000;

const STATUS_BADGES = {
  // Question statuses
  draft              : { label: 'Draft',             color: '#9ca3af', icon: '📝' },
  submitted          : { label: 'Submitted',          color: '#3b82f6', icon: '📨' },
  pending            : { label: 'Pending',            color: '#f59e0b', icon: '⏳' },
  mentor_assigned    : { label: 'Assigned to Mentor', color: '#8b5cf6', icon: '👤' },
  awaiting_experience: { label: 'Awaiting Response',  color: '#f59e0b', icon: '⏳' },
  experience_submitted:{ label: 'Processing Answer',  color: '#10b981', icon: '⚙️' },
  answer_generated   : { label: 'Answer Ready',       color: '#059669', icon: '✅' },
  delivered          : { label: 'Delivered',          color: '#059669', icon: '✓'  },
  answered_instantly : { label: 'Instant Answer',     color: '#10b981', icon: '⚡' },
  // Booking statuses
  confirmed          : { label: 'Confirmed',          color: '#10b981', icon: '✅' },
  completed          : { label: 'Completed',          color: '#059669', icon: '✓'  },
  cancelled          : { label: 'Cancelled',          color: '#ef4444', icon: '❌' },
  refunded           : { label: 'Refunded',           color: '#f59e0b', icon: '💰' },
};

const SERVICE_TYPE_BADGES = {
  'video-call': { label: 'Video Call', icon: '📹', color: '#3b82f6' },
  'audio-call': { label: 'Audio Call', icon: '🎤', color: '#8b5cf6' },
  'chat':       { label: 'Chat',       icon: '💬', color: '#10b981' },
  'answer-card':{ label: 'Answer Card',icon: '🎯', color: '#f59e0b' },
};

function getStatusBadge(status) {
  const badge = STATUS_BADGES[status] || { label: status || 'Unknown', color: '#6b7280', icon: '•' };
  return (
    <span className="status-badge" style={{ background: badge.color }}>
      {badge.icon} {badge.label}
    </span>
  );
}

function getServiceTypeBadge(type) {
  const badge = SERVICE_TYPE_BADGES[type] || { label: type, icon: '📦', color: '#6b7280' };
  return (
    <span className="service-type-badge" style={{ background: badge.color }}>
      {badge.icon} {badge.label}
    </span>
  );
}

function formatScheduledTime(scheduledAt) {
  if (!scheduledAt) return null;
  const date = new Date(scheduledAt);
  return date.toLocaleString('en-IN', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTimeUntilCall(scheduledAt) {
  if (!scheduledAt) return null;
  const now = new Date();
  const callTime = new Date(scheduledAt);
  const diffMs = callTime - now;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 0) return 'Past';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
}

function canJoinCall(scheduledAt, status) {
  if (status !== 'confirmed') return false;
  if (!scheduledAt) return false;
  
  const now = new Date();
  const callTime = new Date(scheduledAt);
  const diffMins = Math.floor((callTime - now) / 60000);
  
  // Can join 15 minutes before until 30 minutes after
  return diffMins >= -30 && diffMins <= 15;
}

const MyQuestionsEnhanced = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const token = user?.token || localStorage.getItem('token');
      if (!token) return;

      const res  = await fetch(`${API_URL}/api/questions/my-dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
        setStats(data.stats);
        setError(null);
      }
    } catch (err) {
      console.error('fetchDashboard error:', err);
      setError('Failed to load dashboard. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) { navigate('/login'); return; }
    fetchDashboard();
    const id = setInterval(fetchDashboard, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [user?.token, fetchDashboard, navigate]);

  if (loading) return <LoadingSpinner fullScreen message="Loading your dashboard..." />;

  return (
    <div className="my-questions-container">
      <div className="page-header">
        <h1>📝 My Questions & Bookings</h1>
        <p>Track all your questions, services, and call schedules</p>
      </div>

      {/* Answer Card Info Section */}
      <div className="premium-info-section">
        <div className="info-content">
          <h3>🚀 Atyant Premium: Answer Cards</h3>
          <p>
            An <strong>Answer Card</strong> is a high-value, experience-backed document created by expert mentors. 
            It includes step-by-step guidance, industry secrets, and a personalized roadmap for your career.
          </p>
          <div className="info-footer">
            <span className="info-tip">💡 Need more clarity or have follow-ups?</span>
            <button className="book-session-link" onClick={() => navigate('/mentors')}>
              Book a 1:1 Session →
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalQuestions}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalBookings}</div>
            <div className="stat-label">Bookings</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{stats.upcomingCalls}</div>
            <div className="stat-label">Upcoming Calls</div>
          </div>
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💭</div>
          <h2>No questions or bookings yet</h2>
          <p>Ask your first question or book a service to get started!</p>
          <div className="empty-actions">
            <Link to="/ask" className="ask-button">Ask a Question</Link>
            <Link to="/mentors" className="browse-button">Browse Mentors</Link>
          </div>
        </div>
      ) : (
        <div className="questions-grid">
          {items.map((item) => {
            if (item.type === 'booking') {
              // Render booking card
              const timeUntil = getTimeUntilCall(item.scheduledAt);
              const canJoin = canJoinCall(item.scheduledAt, item.status);
              
              return (
                <div key={`booking-${item._id}`} className="question-item booking-item">
                  <div className="question-item-header">
                    {getServiceTypeBadge(item.service.type)}
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="question-title">{item.title}</h3>

                  {item.mentor && (
                    <div className="mentor-assigned">
                      <span className="mentor-label">Mentor:</span>
                      <strong>{item.mentor.name}</strong>
                    </div>
                  )}

                  {item.scheduledAt && (
                    <div className="scheduling-info">
                      <div className="schedule-row">
                        <span className="schedule-icon">📅</span>
                        <span className="schedule-text">{formatScheduledTime(item.scheduledAt)}</span>
                        {timeUntil && timeUntil !== 'Past' && (
                          <span className="time-until">in {timeUntil}</span>
                        )}
                      </div>
                      {item.service.duration && (
                        <div className="schedule-row">
                          <span className="schedule-icon">⏱️</span>
                          <span className="schedule-text">{item.service.duration} minutes</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="question-meta">
                    <span className="question-date">
                      Booked: {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      })}
                    </span>
                    <span className="amount-paid">₹{item.amount}</span>
                  </div>

                  <div className="question-action">
                    {canJoin && item.meetingLink && (
                      <a 
                        href={item.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="join-call-btn"
                      >
                        🎥 Join Call
                      </a>
                    )}
                    {item.mentor && (
                      <Link to={`/chat/${item.mentor._id}`} className="chat-btn">
                        💬 Chat
                      </Link>
                    )}
                    <Link to={`/my-bookings`} className="view-link">
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            } else {
              // Render question card
              const text = item.description || item.title || '';
              
              return (
                <div key={`question-${item._id}`} className="question-item">
                  <div className="question-item-header">
                    {getStatusBadge(item.status)}
                    {item.category && <span className="category-badge">{item.category}</span>}
                  </div>

                  <h3 className="question-title">{item.title || 'Untitled Question'}</h3>

                  <p className="question-description">
                    {text.length > 150 ? `${text.substring(0, 150)}...` : text || '—'}
                  </p>

                  {item.mentor && (
                    <div className="mentor-assigned">
                      <span className="mentor-label">Assigned to:</span>
                      <strong>{item.mentor.name}</strong>
                      {item.matchPercentage > 0 && (
                        <span className="match-badge">{item.matchPercentage}% match</span>
                      )}
                    </div>
                  )}

                  {item.booking && (
                    <div className="linked-booking">
                      <div className="linked-booking-header">
                        {getServiceTypeBadge(item.booking.serviceType)}
                        <span className="linked-label">Booked Service</span>
                      </div>
                      {item.booking.scheduledAt && (
                        <div className="linked-schedule">
                          📅 {formatScheduledTime(item.booking.scheduledAt)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="question-meta">
                    <span className="question-date">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      })}
                    </span>
                    {item.followUpCount > 0 && (
                      <span className="meta-item">
                        💬 {item.followUpCount} follow-up{item.followUpCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="question-action">
                    {item.booking?.meetingLink && canJoinCall(item.booking.scheduledAt, item.booking.status) && (
                      <a 
                        href={item.booking.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="join-call-btn"
                      >
                        🎥 Join Call
                      </a>
                    )}
                    {item.mentor && (
                      <Link to={`/chat/${item.mentor._id}`} className="chat-btn">
                        💬 Chat
                      </Link>
                    )}
                    <Link to={`/engine/${item._id}`} className="view-link">
                      {item.hasAnswer ? 'View Answer' : 'Track Status'} →
                    </Link>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      <div className="auto-refresh-info">⚡ Auto-refreshing every 10 seconds</div>
    </div>
  );
};

export default MyQuestionsEnhanced;
