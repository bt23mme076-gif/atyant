// src/components/MyQuestions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './MyQuestions.css';

const MyQuestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    
    fetchMyQuestions();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchMyQuestions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchMyQuestions = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/questions/my-questions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'draft': { label: 'Draft', color: '#9ca3af', icon: '📝' },
      'submitted': { label: 'Submitted', color: '#3b82f6', icon: '📨' },
      'pending': { label: 'Pending', color: '#f59e0b', icon: '⏳' },
      'mentor_assigned': { label: 'Assigned to Mentor', color: '#8b5cf6', icon: '👤' },
      'awaiting_experience': { label: 'Awaiting Response', color: '#f59e0b', icon: '⏳' },
      'experience_submitted': { label: 'Processing Answer', color: '#10b981', icon: '⚙️' },
      'answer_generated': { label: 'Answer Ready', color: '#059669', icon: '✅' },
      'delivered': { label: 'Delivered', color: '#059669', icon: '✓' },
      'answered_instantly': { label: 'Instant Answer', color: '#10b981', icon: '⚡' }
    };
    
    const badge = badges[status] || { label: status, color: '#6b7280', icon: '•' };
    
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.icon} {badge.label}
      </span>
    );
  };
  
  const getTimeRemaining = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = (now - created) / 1000 / 60; // minutes
    const remaining = 5 - diff;
    
    if (remaining <= 0) return null;
    
    return Math.ceil(remaining);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Processing your question..." />;
  }

  return (
    <div className="my-questions-container">
      <div className="page-header">
        <h1>📝 My Questions</h1>
        <p>Track all your questions and their status</p>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💭</div>
          <h2>No questions yet</h2>
          <p>Ask your first question to get personalized answers from expert mentors!</p>
          <Link to="/ask" className="ask-button">
            Ask a Question
          </Link>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((q) => {
            const timeRemaining = q.isEditable ? getTimeRemaining(q.createdAt) : null;
            
            return (
              <div key={q._id} className="question-item">
                <div className="question-item-header">
                  {getStatusBadge(q.status)}
                  {q.category && (
                    <span className="category-badge">{q.category}</span>
                  )}
                </div>
                
                <h3 className="question-title">
                  {q.title || q.questionText}
                </h3>
                
                <p className="question-description">
                  {(q.description || q.questionText).substring(0, 150)}
                  {(q.description || q.questionText).length > 150 ? '...' : ''}
                </p>
                
                {q.selectedMentorId && (
                  <div className="mentor-assigned">
                    <span className="mentor-label">Assigned to:</span>
                    <strong>
                      {q.selectedMentorId.name || q.selectedMentorId.username}
                    </strong>
                    {q.matchPercentage && (
                      <span className="match-badge">
                        {q.matchPercentage}% match
                      </span>
                    )}
                  </div>
                )}
                
                <div className="question-meta">
                  <span className="question-date">
                    {q.createdAt && !isNaN(new Date(q.createdAt)) ? (
                      new Date(q.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    ) : (
                      <span style={{ color: '#aaa' }}>No Date</span>
                    )}
                  </span>
                  
                  {q.followUpQuestions && q.followUpQuestions.length > 0 && (
                    <span className="meta-item">
                      💬 {q.followUpQuestions.length} follow-up{q.followUpQuestions.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="question-action">
                  {timeRemaining && q.isEditable && (
                    <button 
                      className="edit-btn-small"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/edit-question/${q._id}`);
                      }}
                    >
                      ✏️ Edit ({timeRemaining}m left)
                    </button>
                  )}
                  
                  <Link 
                    to={`/engine/${q._id}`}
                    className="view-link"
                  >
                    {q.answerCardId ? 'View Answer' : 'Track Status'} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="auto-refresh-info">
        ⚡ Auto-refreshing every 10 seconds
      </div>
    </div>
  );
};

export default MyQuestions;
