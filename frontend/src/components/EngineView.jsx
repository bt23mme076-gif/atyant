// src/components/EngineView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AnswerCard from './AnswerCard';
import './EngineView.css';

const EngineView = () => {
  const { questionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [answerCard, setAnswerCard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    
    fetchQuestionStatus();
    
    // Poll for updates every 5 seconds if answer not ready
    const interval = setInterval(() => {
      if (!answerCard) {
        fetchQuestionStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [questionId, user]);

  const fetchQuestionStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/engine/question-status/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch question status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // ⚠️ IMPORTANT: If backend says this is a follow-up, redirect to parent question
        if (data.redirect && data.parentQuestionId) {
          console.log('🔁 Follow-up question detected');
          console.log('🔀 Redirecting to parent question:', data.parentQuestionId);
          navigate(`/engine/${data.parentQuestionId}`, { replace: true });
          return;
        }
        
        setQuestion(data.question);
        if (data.answerCard) {
          console.log('📦 Answer card received:', data.answerCard);
          console.log('👤 Mentor ID in answer card:', data.answerCard.mentorId);
          setAnswerCard(data.answerCard);
        }
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching question status:', err);
      setError('Failed to load question status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      'pending': 1,
      'mentor_assigned': 2,
      'awaiting_experience': 2,
      'experience_submitted': 3,
      'answer_generated': 4,
      'delivered': 4
    };
    return steps[status] || 1;
  };

  if (loading) {
    return (
      <div className="engine-view-container">
        <div className="status-card">
          <div className="loading-spinner"></div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="engine-view-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
        <button className="refresh-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  const currentStep = getStatusStep(question?.status);

  return (
    <div className="engine-view-container">
      <div className="engine-header">
        <h1>🔮 Atyant Engine</h1>
        <p>Processing your question with real mentor experience</p>
      </div>

      {question && (
        <div className="question-display">
          <h3>Your Question</h3>
          <p>{question.text}</p>
        </div>
      )}

      {!answerCard ? (
        <div className="status-card">
          <div className="status-icon">⚙️</div>
          <h2>Processing Your Question</h2>
          <p className="current-status">Current Status: <strong>{question?.status?.replace(/_/g, ' ').toUpperCase()}</strong></p>
          <p>Atyant Engine is selecting the best mentor who has already solved this exact problem...</p>
          
          <div className="status-steps">
            <div className={`status-step ${currentStep >= 1 ? 'completed' : ''}`}>
              <div className="step-icon">1</div>
              <div className="step-label">Question Received</div>
            </div>
            
            <div className={`status-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-icon">2</div>
              <div className="step-label">Mentor Selected</div>
            </div>
            
            <div className={`status-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-icon">3</div>
              <div className="step-label">Experience Collected</div>
            </div>
            
            <div className={`status-step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-icon">4</div>
              <div className="step-label">Answer Ready</div>
            </div>
          </div>
          
          <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#6b7280' }}>
            This usually takes 1-2 hours. You'll be notified when your answer is ready.
          </p>
          
          <button className="refresh-button" onClick={fetchQuestionStatus}>
            Refresh Status
          </button>
        </div>
      ) : (
        <AnswerCard 
          answerCard={answerCard} 
          questionId={questionId}
          onRefresh={fetchQuestionStatus}
        />
      )}
    </div>
  );
};

export default EngineView;
