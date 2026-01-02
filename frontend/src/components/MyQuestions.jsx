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
      const response = await fetch(`${API_URL}/api/engine/my-questions`, {
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
      'pending': { label: 'Pending', color: '#f59e0b' },
      'mentor_assigned': { label: 'Assigned to Mentor', color: '#3b82f6' },
      'awaiting_experience': { label: 'Awaiting Experience', color: '#8b5cf6' },
      'experience_submitted': { label: 'Processing Answer', color: '#10b981' },
      'answer_generated': { label: 'Answer Ready', color: '#059669' },
      'delivered': { label: 'Delivered', color: '#059669' }
    };
    
    const badge = badges[status] || { label: status, color: '#6b7280' };
    
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
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
          <Link to="/" className="ask-button">
            Ask a Question
          </Link>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((q) => (
            <Link 
              key={q.id} 
              to={`/engine/${q.id}`}
              className="question-item"
            >
              <div className="question-item-header">
                {getStatusBadge(q.status)}
                <span className="question-date">
                  {new Date(q.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <h3 className="question-title">{q.text}</h3>
              
              <div className="question-meta">
                {q.hasAnswer ? (
                  <span className="meta-item answer-ready">✅ Answer Ready</span>
                ) : (
                  <span className="meta-item processing">⏳ Processing</span>
                )}
                
                {q.followUpCount > 0 && (
                  <span className="meta-item">
                    💬 {q.followUpCount} follow-up{q.followUpCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="question-action">
                <span className="view-link">View Status →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      <div className="auto-refresh-info">
        ⚡ Auto-refreshing every 10 seconds
      </div>
    </div>
  );
};

export default MyQuestions;
