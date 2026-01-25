
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answerForm, setAnswerForm] = useState({
    mainAnswer: '',
    situation: '',
    firstAttempt: '',
    keyMistakes: '',
    whatWorked: '',
    actionableSteps: '',
    timeline: '',
    differentApproach: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  const fetchPendingQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/pending-questions`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswerCards = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/answercards`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (data.success) setAnswerCards(data.answerCards);
    } catch (err) {
      console.error('Failed to fetch answer cards', err);
    }
  };

  const openQuestion = async (q) => {
    setSelectedQuestion(q);
    setAnswerForm({
      mainAnswer: '',
      situation: '',
      firstAttempt: '',
      keyMistakes: '',
      whatWorked: '',
      actionableSteps: '',
      timeline: '',
      differentApproach: '',
      additionalNotes: ''
    });
    try {
      const res = await fetch(`${API_URL}/api/mentor/mentors/${q.matchedMentorId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      setMentor(data);
    } catch (err) {
      console.error('Failed to load mentor');
    }
  };

  const submitMentorAnswerCard = async () => {
    if (!selectedQuestion || !mentor) return;
    setSubmitting(true);
    try {
      // Use the same endpoint as mentor answer submission for identical backend flow
      // Use the same endpoint and FormData as mentor dashboard
      const formData = new FormData();
      // Always use MongoDB _id if available
      formData.append('questionId', selectedQuestion._id || selectedQuestion.id);
      formData.append('mentorId', mentor._id || mentor.id);
      formData.append('answerContent', JSON.stringify(answerForm));
      // Always send mentorExperienceId (empty string if not used)
      formData.append('mentorExperienceId', '');
      // No audio for admin, but backend supports it optionally
      const res = await fetch(`${API_URL}/api/ask/mentor/submit-audio-answer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        body: formData
      });
      if (res.ok) {
        alert('✅ Answer sent and AnswerCard created');
        setSelectedQuestion(null);
        setMentor(null);
        setAnswerForm({
          mainAnswer: '',
          situation: '',
          firstAttempt: '',
          keyMistakes: '',
          whatWorked: '',
          actionableSteps: '',
          timeline: '',
          additionalNotes: ''
        });
        fetchPendingQuestions();
      } else {
        // Show error if backend returns error
        const errorData = await res.json();
        alert('❌ Failed to submit answer: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error submitting answer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Group questions and follow-ups for threading
  const groupedQuestions = React.useMemo(() => {
    const mainQuestions = {};
    const followUps = [];
    questions.forEach(q => {
      if (!q.isFollowUp) {
        mainQuestions[q.id] = { ...q, followUps: [] };
      } else {
        followUps.push(q);
      }
    });
    followUps.forEach(fu => {
      if (fu.parentQuestionId && mainQuestions[fu.parentQuestionId]) {
        mainQuestions[fu.parentQuestionId].followUps.push(fu);
      } else {
        // Orphan follow-up, treat as main
        mainQuestions[fu.id] = { ...fu, followUps: [] };
      }
    });
    // Sort by createdAt descending
    return Object.values(mainQuestions).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [questions]);

  return (
    <div className="admin-container">
      {/* LEFT PANEL: QUESTIONS LIST */}
      <div className="left-panel">
        <div className="left-header">Pending Questions</div>
        <div className="question-list">
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : groupedQuestions.length === 0 ? (
            <div className="empty-state">No pending questions</div>
          ) : (
            groupedQuestions.map(q => (
              <React.Fragment key={q.id}>
                <div
                  onClick={() => openQuestion(q)}
                  className={`question-card${selectedQuestion?.id === q.id ? ' active' : ''}`}
                >
                  <div className="question-text">
                    {q.isFollowUp && <span style={{color:'#7c3aed', fontWeight:600, marginRight:6}}>🔁 Follow-up</span>}
                    {q.text}
                  </div>
                  <div className="match-score">
                    Match: {q.matchConfidence}%
                    {q.matchedMentorName && (
                      <>
                        {' '}<span style={{color:'#2563eb'}}>|</span> Mentor: <span style={{color:'#2563eb', fontWeight:600}}>{q.matchedMentorName}</span>
                      </>
                    )}
                  </div>
                  <div className="match-score" style={{fontSize:'11px'}}>
                    {q.createdAt && (new Date(q.createdAt)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                {/* Render follow-ups, if any, indented */}
                {q.followUps && q.followUps.length > 0 && q.followUps.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(fu => (
                  <div
                    key={fu.id}
                    onClick={() => openQuestion(fu)}
                    className={`question-card followup-thread${selectedQuestion?.id === fu.id ? ' active' : ''}`}
                    style={{ marginLeft: 28, borderLeft: '3px solid #ede9fe', background: '#fafaff' }}
                  >
                    <div className="question-text">
                      <span style={{color:'#7c3aed', fontWeight:600, marginRight:6}}>🔁 Follow-up</span>
                      {fu.text}
                    </div>
                    <div className="match-score">
                      Match: {fu.matchConfidence}%
                      {fu.matchedMentorName && (
                        <>
                          {' '}<span style={{color:'#2563eb'}}>|</span> Mentor: <span style={{color:'#2563eb', fontWeight:600}}>{fu.matchedMentorName}</span>
                        </>
                      )}
                    </div>
                    <div className="match-score" style={{fontSize:'11px'}}>
                      {fu.createdAt && (new Date(fu.createdAt)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: DETAILS */}
      <div className="right-panel">
        {!selectedQuestion ? (
          <div className="empty-state">Select a question to continue</div>
        ) : (
          <>
            {/* QUESTION SECTION */}
            <div className="section">
              <div className="section-title">User Question</div>
              <div className="card">
                <div style={{fontWeight:600}}>{selectedQuestion.text}</div>
                <div style={{fontSize:'13px', color:'#6b7280', marginTop:4}}>
                  {selectedQuestion.createdAt && (new Date(selectedQuestion.createdAt)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                {selectedQuestion.matchedMentorName && (
                  <div style={{fontSize:'13px', color:'#2563eb', marginTop:4}}>
                    Matched Mentor: <span style={{fontWeight:600}}>{selectedQuestion.matchedMentorName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* MENTOR SECTION */}
            {mentor && (
              <div className="section">
                <div className="section-title">Matched Mentor</div>
                <div className="card">
                  <div className="mentor-name">{mentor.name || mentor.username || 'Unknown Mentor'}</div>
                  <div className="mentor-background">{mentor.background}</div>
                  <div className="match-confidence">Match Confidence: {selectedQuestion.matchConfidence}%</div>
                </div>
              </div>
            )}

            {/* ANSWER FORM SECTION */}
            <div className="section">
              <div className="section-title">Write Answer as Mentor</div>
              <div className="card">
                {selectedQuestion.isFollowUp ? (
                  <div className="form-group simple-reply-mode">
                    <label>
                      Your Direct Answer
                      <span className="hint">Since this is a follow-up, just provide a clear text answer.</span>
                    </label>
                    <textarea
                      value={answerForm.situation}
                      onChange={e => setAnswerForm({ ...answerForm, situation: e.target.value })}
                      maxLength={1500}
                      placeholder="Type your follow-up reply here..."
                      className="follow-up-textarea"
                    />
                    <div className="char-counter-mentor">{answerForm.situation.length}/1500</div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>When I was in this situation</label>
                      <textarea
                        placeholder="I was working on a project where..."
                        value={answerForm.situation}
                        onChange={e => setAnswerForm({ ...answerForm, situation: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>What I tried first</label>
                      <textarea
                        placeholder="My first approach was to..."
                        value={answerForm.firstAttempt}
                        onChange={e => setAnswerForm({ ...answerForm, firstAttempt: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>What failed (be specific)</label>
                      <textarea
                        placeholder="I made the mistake of... This failed because..."
                        value={answerForm.keyMistakes}
                        onChange={e => setAnswerForm({ ...answerForm, keyMistakes: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>What worked</label>
                      <textarea
                        placeholder="What finally worked was..."
                        value={answerForm.whatWorked}
                        onChange={e => setAnswerForm({ ...answerForm, whatWorked: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Step-by-step actions</label>
                      <textarea
                        placeholder="Step 1...\nStep 2...\nStep 3..."
                        value={answerForm.actionableSteps}
                        onChange={e => setAnswerForm({ ...answerForm, actionableSteps: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Timeline / Outcomes</label>
                      <textarea
                        placeholder="How long did it take? What were the results?"
                        value={answerForm.timeline}
                        onChange={e => setAnswerForm({ ...answerForm, timeline: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>What I would do differently today <span className="hint">Lessons learned and improvements</span></label>
                      <textarea
                        placeholder="If I were doing this today, I would..."
                        value={answerForm.differentApproach}
                        onChange={e => setAnswerForm({ ...answerForm, differentApproach: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea
                        placeholder="Anything else you want to add..."
                        value={answerForm.additionalNotes}
                        onChange={e => setAnswerForm({ ...answerForm, additionalNotes: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <button
                  className="primary-btn"
                  onClick={submitMentorAnswerCard}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (selectedQuestion.isFollowUp ? 'Send Reply' : 'Submit Answer')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

  );
}

export default AdminDashboard;
