// src/components/MentorDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './MentorDashboard.css';
import { API_URL } from '../services/api.js';

const REFRESH_MS     = 10_000;
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB

const EMPTY_EXPERIENCE = {
  situation: '', firstAttempt: '', failures: '',
  whatWorked: '', actionableSteps: '', timeline: '',
  differentApproach: '', additionalNotes: ''
};

const MentorDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [activeTab,          setActiveTab]          = useState('pending');
  const [pendingQuestions,   setPendingQuestions]   = useState([]);
  const [answeredQuestions,  setAnsweredQuestions]  = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [selectedQuestion,   setSelectedQuestion]   = useState(null);
  const [experience,         setExperience]         = useState(EMPTY_EXPERIENCE);
  const [submitting,         setSubmitting]         = useState(false);
  const [recording,          setRecording]          = useState(false);
  const [audioURL,           setAudioURL]           = useState(null);
  const [audioBlob,          setAudioBlob]          = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);

  const token = user?.token || localStorage.getItem('token');

  const fetchPendingQuestions = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/engine/mentor/pending-questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPendingQuestions(data.questions);
    } catch (err) {
      console.error('fetchPending error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAnsweredQuestions = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/engine/mentor/answered-questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnsweredQuestions(data.questions);
    } catch (err) {
      console.error('fetchAnswered error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role !== 'mentor') { navigate('/'); return; }
    fetchPendingQuestions();
    fetchAnsweredQuestions();
    const id = setInterval(() => { fetchPendingQuestions(); fetchAnsweredQuestions(); }, REFRESH_MS);
    return () => clearInterval(id);
  }, [token, user?.role, fetchPendingQuestions, fetchAnsweredQuestions, navigate]);

  // ── Audio recording ────────────────────────────────────────────────────────
  const handleRecord = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const mr = new window.MediaRecorder(stream);
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          setAudioURL(URL.createObjectURL(blob));
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

  const handleDeleteAudio = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setAudioBlob(null);
  };

  // ── Question selection ─────────────────────────────────────────────────────
  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setExperience(EMPTY_EXPERIENCE);
    handleDeleteAudio();
  };

  const handleExperienceChange = (field, value) => {
    setExperience(prev => ({ ...prev, [field]: value }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmitExperience = async (e) => {
    e.preventDefault();

    const required = selectedQuestion.isFollowUp
      ? ['situation']
      : ['situation', 'firstAttempt', 'failures', 'whatWorked', 'actionableSteps', 'timeline', 'differentApproach'];

    for (const field of required) {
      if (!experience[field].trim()) {
        alert(`Please fill in: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    if (audioBlob && audioBlob.size > MAX_AUDIO_SIZE) {
      alert('Audio file too large (max 10 MB). Please re-record a shorter message.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('questionId',    selectedQuestion._id || selectedQuestion.id);
      formData.append('mentorId',      user._id || user.id);
      formData.append('answerContent', JSON.stringify(experience));
      if (selectedQuestion.mentorExperienceId) {
        formData.append('mentorExperienceId', selectedQuestion.mentorExperienceId);
      }
      if (audioBlob?.size > 0) {
        formData.append('audio', audioBlob, 'answer.webm');
      }

      const res  = await fetch(`${API_URL}/api/ask/mentor/submit-audio-answer`, {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body   : formData
      });
      const data = await res.json();

      if (data.success) {
        alert(data.followUp ? '✅ Follow-up answer sent!' : '✅ Experience submitted! Answer card generated.');
        setSelectedQuestion(null);
        handleDeleteAudio();
        setTimeout(() => { fetchPendingQuestions(); fetchAnsweredQuestions(); }, 500);
        setTimeout(() => setActiveTab('answered'), 600);
      } else {
        alert('Error: ' + (data.error || 'Failed to submit'));
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit experience. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Experience form ────────────────────────────────────────────────────────
  if (selectedQuestion) return (
    <div className="mentor-dashboard-container">
      <div className="experience-form-container">
        <div className="experience-form-header">
          <h2>📝 Share Your Experience</h2>
          <div className="question-display-mentor">
            <h4>Question</h4>
            <p>{selectedQuestion.text || selectedQuestion.questionText}</p>
          </div>
        </div>

        <form className="experience-form" onSubmit={handleSubmitExperience}>
          {/* Audio section */}
          <div className="form-group mentor-audio-section">
            <label className="mentor-audio-label">
              Voice Message <span className="mentor-audio-optional">(optional)</span>
            </label>
            <button type="button" className="mentor-audio-btn" onClick={handleRecord}>
              {recording ? '⏹️ Stop Recording' : '🎤 Record Audio'}
            </button>
            {audioURL && (
              <div className="mentor-audio-controls">
                <audio controls src={audioURL} className="mentor-audio-preview" />
                <button type="button" className="mentor-audio-delete-btn" onClick={handleDeleteAudio}>
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>

          {selectedQuestion.isFollowUp ? (
            <div className="form-group simple-reply-mode">
              <label>Your Direct Answer <span className="hint">Clear text reply for follow-up</span></label>
              <textarea
                value={experience.situation}
                onChange={e => handleExperienceChange('situation', e.target.value)}
                maxLength={1500}
                placeholder="Type your follow-up reply here..."
                className="follow-up-textarea"
              />
              <div className="char-counter-mentor">{experience.situation.length}/1500</div>
            </div>
          ) : (
            <>
              {[
                { field: 'situation',        label: 'When I was in this situation', hint: 'Context', ph: 'I was working on a project where...' },
                { field: 'firstAttempt',     label: 'What I tried first',          hint: 'Initial approach', ph: 'My first approach was to...' },
                { field: 'failures',         label: 'What failed (be specific)',    hint: 'Mistakes & why', ph: 'I made the mistake of...' },
                { field: 'whatWorked',       label: 'What worked',                 hint: 'The solution', ph: 'What finally worked was...' },
                { field: 'actionableSteps',  label: 'Step-by-step actions',        hint: 'Detailed steps', ph: 'Step 1: ...\nStep 2: ...' },
                { field: 'timeline',         label: 'Timeline / Outcomes',         hint: 'How long? Results?', ph: 'It took me 2 weeks...' },
                { field: 'differentApproach',label: 'What I would do differently', hint: 'Lessons learned', ph: 'If I were doing this today...' },
                { field: 'additionalNotes',  label: 'Additional Notes (optional)', hint: 'Any other tips', ph: 'Also worth mentioning...' },
              ].map(({ field, label, hint, ph }) => (
                <div key={field} className="form-group">
                  <label>{label} <span className="hint">{hint}</span></label>
                  <textarea
                    value={experience[field]}
                    onChange={e => handleExperienceChange(field, e.target.value)}
                    maxLength={field === 'actionableSteps' ? 2000 : field === 'timeline' || field === 'additionalNotes' ? 500 : 1000}
                    placeholder={ph}
                  />
                </div>
              ))}
            </>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setSelectedQuestion(null)}>Cancel</button>
            <button type="submit" className="submit-experience-btn" disabled={submitting}>
              {submitting ? 'Sending...' : selectedQuestion.isFollowUp ? 'Send Reply' : 'Submit Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Main dashboard ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="mentor-dashboard-container">
      <div className="empty-state"><div className="loading-spinner" /><h3>Loading...</h3></div>
    </div>
  );

  return (
    <div className="mentor-dashboard-container">
      <div className="mentor-dashboard-header">
        <div className="header-content">
          <h1>🎯 Mentor Dashboard</h1>
          <p>Share your real experience to help students</p>
        </div>
        <div className="stats-row">
          <div className="stat-card"><div className="stat-number">{pendingQuestions.length}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><div className="stat-number">{answeredQuestions.length}</div><div className="stat-label">Answered</div></div>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'pending'  ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          ⏳ Pending ({pendingQuestions.length})
        </button>
        <button className={`tab-button ${activeTab === 'answered' ? 'active' : ''}`} onClick={() => setActiveTab('answered')}>
          ✅ Answered ({answeredQuestions.length})
        </button>
      </div>

      {activeTab === 'pending' ? (
        pendingQuestions.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No pending questions</h3><p>You'll be notified when students ask matching questions</p><p className="auto-refresh-note">✨ Auto-refreshing every 10 seconds</p></div>
          : <div className="questions-grid">
              {pendingQuestions.map(q => (
                <div key={q.id || q._id} className="question-card pending" onClick={() => handleQuestionClick(q)}>
                  <div className="question-header">
                    <span className="question-badge pending">⏳ Pending</span>
                    <span className="question-date">📅 {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="question-text">{q.text || q.questionText}</h3>
                  <div className="question-footer">
                    <div className="keywords">{(q.keywords || []).slice(0, 3).map((kw, i) => <span key={i} className="keyword-tag">{kw}</span>)}</div>
                    <button className="answer-btn">Answer →</button>
                  </div>
                </div>
              ))}
            </div>
      ) : (
        answeredQuestions.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📝</div><h3>No answered questions yet</h3></div>
          : <div className="questions-grid">
              {answeredQuestions.map(q => (
                <div key={q.id || q._id} className="question-card answered">
                  <div className="question-header">
                    <span className={`question-badge ${q.status === 'delivered' ? 'delivered' : 'processing'}`}>
                      {q.status === 'delivered' ? '✅ Delivered' : '⚙️ Processing'}
                    </span>
                    <span className="question-date">📅 {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="question-text">{q.text || q.questionText}</h3>
                  <div className="question-footer">
                    <div className="keywords">{(q.keywords || []).slice(0, 3).map((kw, i) => <span key={i} className="keyword-tag">{kw}</span>)}</div>
                    <div className="answered-indicator">{q.isFollowUp ? '🔁 Follow-up' : '✨ Original'}</div>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
};

export default MentorDashboard;
