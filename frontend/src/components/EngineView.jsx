// src/components/EngineView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AnswerCard from './AnswerCard';
import LoadingSpinner from './LoadingSpinner';
import './EngineView.css';
import { API_URL } from '../services/api.js';

const EngineView = ({ isAnswerView }) => {
  const { questionId, answerCardId } = useParams();
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
    
    if (isAnswerView && answerCardId) {
      fetchAnswerCard();
    } else {
      fetchQuestionStatus();
      
      // Poll for updates every 5 seconds if answer not ready
      const interval = setInterval(() => {
        if (!answerCard) {
          fetchQuestionStatus();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [questionId, answerCardId, user]);

  const fetchAnswerCard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/engine/answer-card/${answerCardId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch answer card');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setQuestion(data.question);
        setAnswerCard(data.answerCard);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching answer card:', err);
      setError('Failed to load answer card');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionStatus = async () => {
    try {
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
    return <LoadingSpinner />;
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
          
          <div className="status-steps-premium">
            {/* Step 1: Received */}
            <div className="premium-step completed animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="premium-step-dot">
                <span className="dot-inner">✓</span>
              </div>
              <div className="premium-step-content">
                <span className="step-title">Question Received</span>
                <span className="step-desc">Atyant engine has your data</span>
              </div>
            </div>
            
            {/* Step 2: Mentor Selected */}
            <div className={`premium-step ${currentStep >= 2 ? 'completed' : 'active'} animate-in`} style={{ animationDelay: '0.2s' }}>
              <div className="premium-step-dot">
                <span className="dot-inner">{currentStep >= 2 ? '✓' : '2'}</span>
              </div>
              <div className="premium-step-content">
                <span className="step-title">Mentor Selected</span>
                <span className="step-desc">{currentStep >= 2 ? 'The best mentor has been found' : 'Identifying the best profile...'}</span>
              </div>
            </div>
            
            {/* Step 3: Experience Collected */}
            <div className={`premium-step ${currentStep >= 3 ? 'completed' : currentStep === 2 ? 'active' : ''} animate-in`} style={{ animationDelay: '0.3s' }}>
              <div className="premium-step-dot">
                <span className="dot-inner">{currentStep >= 3 ? '✓' : '3'}</span>
              </div>
              <div className="premium-step-content">
                <span className="step-title">Experience Collected</span>
                <span className="step-desc">Processing mentor's real-world DNA</span>
              </div>
            </div>
            
            {/* Step 4: Answer Ready */}
            <div className={`premium-step ${currentStep >= 4 ? 'completed' : currentStep === 3 ? 'active' : ''} animate-in`} style={{ animationDelay: '0.4s' }}>
              <div className="premium-step-dot">
                <span className="dot-inner">{currentStep >= 4 ? '✨' : '4'}</span>
              </div>
              <div className="premium-step-content">
                <span className="step-title">Answer Ready</span>
                <span className="step-desc">Your premium card is being finalized</span>
              </div>
            </div>
            
            {/* Animated Connector Line */}
            <div className="step-connector-line">
              <div className="line-fill" style={{ height: `${Math.min((currentStep) * 33.33, 100)}%` }}></div>
            </div>
          </div>
          
          <p style={{ marginTop: '32px', fontSize: '0.95rem', color: '#6b7280', fontStyle: 'italic' }}>
            This usually takes 1-2 hours. You'll be notified when your answer card is finalized.
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
