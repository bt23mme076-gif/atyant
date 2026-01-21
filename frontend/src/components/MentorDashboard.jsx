// src/components/MentorDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './MentorDashboard.css';

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'answered'
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [experience, setExperience] = useState({
    situation: '',
    firstAttempt: '',
    failures: '',
    whatWorked: '',
    actionableSteps: '',
    timeline: '',
    differentApproach: '',
    additionalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  // Audio recording state
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  // Audio recording handlers
  const handleRecord = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    
    // Check if user is a mentor
    if (user.role !== 'mentor') {
      alert('Only mentors can access this page');
      navigate('/');
      return;
    }
    
    fetchPendingQuestions();
    fetchAnsweredQuestions();
    
    // Auto-refresh every 10 seconds to check for new questions
    const interval = setInterval(() => {
      fetchPendingQuestions();
      fetchAnsweredQuestions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchPendingQuestions = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/engine/mentor/pending-questions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingQuestions(data.questions);
      }
    } catch (error) {
      console.error('❌ Error fetching pending questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnsweredQuestions = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🔍 Fetching answered questions from:', `${API_URL}/api/engine/mentor/answered-questions`);
      
      const response = await fetch(`${API_URL}/api/engine/mentor/answered-questions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      console.log('📊 Answered questions response:', data);
      
      if (data.success) {
        console.log('✅ Setting answered questions:', data.questions.length);
        setAnsweredQuestions(data.questions);
      } else {
        console.error('❌ Failed to fetch answered questions:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching answered questions:', error);
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    // Reset form
    setExperience({
      situation: '',
      firstAttempt: '',
      failures: '',
      whatWorked: '',
      actionableSteps: '',
      timeline: '',
      differentApproach: '',
      additionalNotes: ''
    });
  };

  const handleExperienceChange = (field, value) => {
    setExperience(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    // 🚀 THE FIX: Agar follow-up hai toh sirf 'situation' validate karein
    const required = selectedQuestion.isFollowUp
      ? ['situation']
      : ['situation', 'firstAttempt', 'failures', 'whatWorked', 'actionableSteps', 'timeline', 'differentApproach'];
    for (const field of required) {
      if (!experience[field].trim()) {
        alert(`Please fill in: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // Use FormData for audio upload
      const formData = new FormData();
      formData.append('questionId', selectedQuestion.id);
      if (selectedQuestion.mentorExperienceId && selectedQuestion.mentorExperienceId !== '') {
        formData.append('mentorExperienceId', selectedQuestion.mentorExperienceId);
      }
      formData.append('mentorId', user.id);
      formData.append('answerContent', JSON.stringify(experience));
      if (audioBlob) {
        if (audioBlob.size > 0) {
          formData.append('audio', audioBlob, 'answer.webm');
        } else {
          alert('Audio recording failed or is empty. Please re-record.');
          setSubmitting(false);
          return;
        }
      }
      const response = await fetch(`${API_URL}/api/ask/mentor/submit-audio-answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Experience submitted successfully! Answer card has been generated.');
        setSelectedQuestion(null);
        setAudioBlob(null);
        setAudioURL(null);
        // Refresh both lists with a small delay to allow backend processing
        setTimeout(() => {
          fetchPendingQuestions();
          fetchAnsweredQuestions();
        }, 500);
        setTimeout(() => {
          setActiveTab('answered');
        }, 600);
      } else {
        alert('Error: ' + (data.error || 'Failed to submit experience'));
      }
    } catch (error) {
      console.error('Error submitting experience:', error);
      alert('Failed to submit experience');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mentor-dashboard-container">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  if (selectedQuestion) {
    return (
      <div className="mentor-dashboard-container">
        <div className="experience-form-container">
          <div className="experience-form-header">
            <h2>📝 Share Your Experience</h2>
            <div className="question-display-mentor">
              <h4>Question</h4>
              <p>{selectedQuestion.text}</p>
            </div>
          </div>
          <form className="experience-form" onSubmit={handleSubmitExperience}>
            {/* Audio recording section */}
            <div className="form-group mentor-audio-section">
              <label className="mentor-audio-label">Mentor Voice Message <span className="mentor-audio-optional">(optional: Anything you want to say)</span></label>
              <button type="button" className="mentor-audio-btn" onClick={handleRecord}>
                {recording ? '⏹️ Stop Recording' : '🎤 Record Audio'}
              </button>
              {audioURL && (
                <audio controls src={audioURL} className="mentor-audio-preview" />
              )}
            </div>
            {selectedQuestion.isFollowUp ? (
              /* 🟢 SIMPLE VIEW: Only for Follow-ups */
              <div className="form-group simple-reply-mode">
                <label>
                  Your Direct Answer
                  <span className="hint">Since this is a follow-up, just provide a clear text answer.</span>
                </label>
                <textarea
                  value={experience.situation}
                  onChange={(e) => handleExperienceChange('situation', e.target.value)}
                  maxLength={1500}
                  placeholder="Type your follow-up reply here..."
                  className="follow-up-textarea"
                />
                <div className="char-counter-mentor">{experience.situation.length}/1500</div>
              </div>
            ) : (
              /* 🔵 FULL VIEW: Only for Original Questions */
              <>
                <div className="form-group">
                  <label>When I was in this situation <span className="hint">Context</span></label>
                  <textarea
                    value={experience.situation}
                    onChange={(e) => handleExperienceChange('situation', e.target.value)}
                    maxLength={1000}
                    placeholder="I was working on a project where..."
                  />
                </div>
                <div className="form-group">
                  <label>What I tried first <span className="hint">Your initial approach</span></label>
                  <textarea
                    value={experience.firstAttempt}
                    onChange={(e) => handleExperienceChange('firstAttempt', e.target.value)}
                    maxLength={1000}
                    placeholder="My first approach was to..."
                  />
                </div>
                <div className="form-group">
                  <label>What failed (be specific) <span className="hint">Mistakes and why they didn't work</span></label>
                  <textarea
                    value={experience.failures}
                    onChange={(e) => handleExperienceChange('failures', e.target.value)}
                    maxLength={1000}
                    placeholder="I made the mistake of... This failed because..."
                  />
                </div>
                <div className="form-group">
                  <label>What worked <span className="hint">The solution that actually solved the problem</span></label>
                  <textarea
                    value={experience.whatWorked}
                    onChange={(e) => handleExperienceChange('whatWorked', e.target.value)}
                    maxLength={1000}
                    placeholder="What finally worked was..."
                  />
                </div>
                <div className="form-group">
                  <label>Step-by-step actions <span className="hint">Detailed steps</span></label>
                  <textarea
                    value={experience.actionableSteps}
                    onChange={(e) => handleExperienceChange('actionableSteps', e.target.value)}
                    maxLength={2000}
                    placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..."
                  />
                </div>
                <div className="form-group">
                  <label>Timeline / Outcomes <span className="hint">How long did it take? What were the results?</span></label>
                  <textarea
                    value={experience.timeline}
                    onChange={(e) => handleExperienceChange('timeline', e.target.value)}
                    maxLength={500}
                    placeholder="It took me 2 weeks, and the result was..."
                  />
                </div>
                <div className="form-group">
                  <label>What I would do differently today <span className="hint">Lessons learned and improvements</span></label>
                  <textarea
                    value={experience.differentApproach}
                    onChange={(e) => handleExperienceChange('differentApproach', e.target.value)}
                    maxLength={1000}
                    placeholder="If I were doing this today, I would..."
                  />
                </div>
                <div className="form-group">
                  <label>Additional Notes (optional) <span className="hint">Any other context or tips</span></label>
                  <textarea
                    value={experience.additionalNotes}
                    onChange={(e) => handleExperienceChange('additionalNotes', e.target.value)}
                    maxLength={500}
                    placeholder="Also worth mentioning..."
                  />
                </div>
              </>
            )}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setSelectedQuestion(null)}>Cancel</button>
              <button type="submit" className="submit-experience-btn" disabled={submitting}>
                {submitting ? 'Sending...' : (selectedQuestion.isFollowUp ? 'Send Reply' : 'Submit Experience')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-dashboard-container">
      <div className="mentor-dashboard-header">
        <div className="header-content">
          <h1>🎯 Mentor Dashboard</h1>
          <p>Share your real experience to help students</p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{pendingQuestions.length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{answeredQuestions.length}</div>
            <div className="stat-label">Answered</div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending ({pendingQuestions.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'answered' ? 'active' : ''}`}
          onClick={() => setActiveTab('answered')}
        >
          ✅ Answered ({answeredQuestions.length})
        </button>
      </div>

      {activeTab === 'pending' ? (
        pendingQuestions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No pending questions</h3>
            <p>You'll be notified when students ask questions matching your expertise</p>
            <p className="auto-refresh-note">✨ Auto-refreshing every 10 seconds</p>
          </div>
        ) : (
          <div className="questions-grid">
            {pendingQuestions.map(question => (
              <div
                key={question.id}
                className="question-card pending"
                onClick={() => handleQuestionClick(question)}
              >
                <div className="question-header">
                  <span className="question-badge pending">⏳ Pending</span>
                  <span className="question-date">
                    📅 {new Date(question.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="question-text">{question.text}</h3>
                <div className="question-footer">
                  <div className="keywords">
                    {question.keywords?.slice(0, 3).map((kw, i) => (
                      <span key={i} className="keyword-tag">{kw}</span>
                    ))}
                  </div>
                  <button className="answer-btn">Answer →</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        answeredQuestions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No answered questions yet</h3>
            <p>Your answered questions will appear here</p>
          </div>
        ) : (
          <div className="questions-grid">
            {answeredQuestions.map(question => (
              <div
                key={question.id}
                className="question-card answered"
              >
                <div className="question-header">
                  <span className={`question-badge ${question.status === 'delivered' ? 'delivered' : 'processing'}`}>
                    {question.status === 'delivered' ? '✅ Delivered' : '⚙️ Processing'}
                  </span>
                  <span className="question-date">
                    📅 {new Date(question.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="question-text">{question.text}</h3>
                <div className="question-footer">
                  <div className="keywords">
                    {question.keywords?.slice(0, 3).map((kw, i) => (
                      <span key={i} className="keyword-tag">{kw}</span>
                    ))}
                  </div>
                  <div className="answered-indicator">
                    {question.isFollowUp ? '🔁 Follow-up' : '✨ Original'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MentorDashboard;
