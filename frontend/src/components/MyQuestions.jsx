// src/components/MyQuestions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './MyQuestions.css';

const REFRESH_INTERVAL = 10_000;

const STATUS_BADGES = {
  draft              : { label: 'Draft',             color: '#9ca3af', icon: '📝' },
  submitted          : { label: 'Submitted',          color: '#3b82f6', icon: '📨' },
  pending            : { label: 'Pending',            color: '#f59e0b', icon: '⏳' },
  mentor_assigned    : { label: 'Assigned to Mentor', color: '#8b5cf6', icon: '👤' },
  awaiting_experience: { label: 'Awaiting Response',  color: '#f59e0b', icon: '⏳' },
  experience_submitted:{ label: 'Processing Answer',  color: '#10b981', icon: '⚙️' },
  answer_generated   : { label: 'Answer Ready',       color: '#059669', icon: '✅' },
  delivered          : { label: 'Delivered',          color: '#059669', icon: '✓'  },
  answered_instantly : { label: 'Instant Answer',     color: '#10b981', icon: '⚡' },
};

function getStatusBadge(status) {
  const badge = STATUS_BADGES[status] || { label: status || 'Unknown', color: '#6b7280', icon: '•' };
  return (
    <span className="status-badge" style={{ background: badge.color }}>
      {badge.icon} {badge.label}
    </span>
  );
}

function getTimeRemaining(createdAt) {
  if (!createdAt) return null;
  const diff    = (Date.now() - new Date(createdAt).getTime()) / 1000 / 60;
  const remaining = 5 - diff;
  return remaining > 0 ? Math.ceil(remaining) : null;
}

// 🔴 FIX: Safe text — prevents `.substring` crash on undefined
function safeText(q) {
  return q?.text || q?.questionText || q?.title || '';
}

const MyQuestions = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchMyQuestions = useCallback(async () => {
    try {
      const token = user?.token || localStorage.getItem('token');
      if (!token) return;

      const res  = await fetch(`${API_URL}/api/questions/my-questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setError(null);
      }
    } catch (err) {
      console.error('fetchMyQuestions error:', err);
      setError('Failed to load questions. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) { navigate('/login'); return; }
    fetchMyQuestions();
    const id = setInterval(fetchMyQuestions, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [user?.token, fetchMyQuestions, navigate]);

  if (loading) return <LoadingSpinner fullScreen message="Loading your questions..." />;

  return (
    <div className="my-questions-container">
      <div className="page-header">
        <h1>📝 My Questions</h1>
        <p>Track all your questions and their status</p>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💭</div>
          <h2>No questions yet</h2>
          <p>Ask your first question to get personalized answers from expert mentors!</p>
          <Link to="/ask" className="ask-button">Ask a Question</Link>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((q) => {
            // 🔴 FIX: Use safe helpers — no more undefined.substring crash
            const text          = safeText(q);
            const timeRemaining = q.isEditable ? getTimeRemaining(q.createdAt) : null;

            return (
              <div key={q._id || q.id} className="question-item">
                <div className="question-item-header">
                  {getStatusBadge(q.status)}
                  {q.category && <span className="category-badge">{q.category}</span>}
                </div>

                <h3 className="question-title">
                  {q.title || text.substring(0, 80) || 'Untitled Question'}
                </h3>

                {/* 🔴 FIX: Guard against empty text before substring */}
                <p className="question-description">
                  {text.length > 150 ? `${text.substring(0, 150)}...` : text || '—'}
                </p>

                {q.selectedMentorId && typeof q.selectedMentorId === 'object' && (
                  <div className="mentor-assigned">
                    <span className="mentor-label">Assigned to:</span>
                    <strong>{q.selectedMentorId.name || q.selectedMentorId.username || 'Mentor'}</strong>
                    {q.matchPercentage > 0 && (
                      <span className="match-badge">{q.matchPercentage}% match</span>
                    )}
                  </div>
                )}

                <div className="question-meta">
                  <span className="question-date">
                    {q.createdAt && !isNaN(new Date(q.createdAt))
                      ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                  {q.followUpCount > 0 && (
                    <span className="meta-item">
                      💬 {q.followUpCount} follow-up{q.followUpCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="question-action">
                  {timeRemaining && (
                    <button
                      className="edit-btn-small"
                      onClick={() => navigate(`/edit-question/${q._id || q.id}`)}
                    >
                      ✏️ Edit ({timeRemaining}m left)
                    </button>
                  )}
                  <Link to={`/engine/${q._id || q.id}`} className="view-link">
                    {q.hasAnswer ? 'View Answer' : 'Track Status'} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="auto-refresh-info">⚡ Auto-refreshing every 10 seconds</div>
    </div>
  );
};

export default MyQuestions;
