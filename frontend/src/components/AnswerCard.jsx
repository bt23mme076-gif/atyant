// TranscriptToggle component (show only if real transcript exists)
function TranscriptToggle({ transcript }) {
  const [show, setShow] = useState(false);
  if (!transcript || transcript === 'Transcript not implemented (add real speech-to-text integration)') {
    return null;
  }
  return (
    <div style={{ marginTop: 8, width: '100%' }}>
      <button
        style={{
          background: '#ede9fe',
          color: '#4f46e5',
          border: 'none',
          borderRadius: 8,
          padding: '6px 18px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 6
        }}
        onClick={() => setShow((s) => !s)}
      >
        {show ? 'Hide Transcript' : 'Show Transcript'}
      </button>
      {show && (
        <div style={{ background: '#f7f7f7', padding: 8, borderRadius: 4, marginTop: 4 }}>
          {transcript}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './AnswerCard.css';



const AnswerCard = ({ answerCard, questionId, onRefresh }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [feedbackHelpful, setFeedbackHelpful] = useState(answerCard.userFeedback?.helpful);
  const [followUpText, setFollowUpText] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [mentorData, setMentorData] = useState(answerCard.mentor || null);
  const [loadingMentor, setLoadingMentor] = useState(!answerCard.mentor);

  // 🚀 Step 1: Main Answer Content (Full Detail)
  let content = answerCard.answerContent || answerCard.content || {};

  // Robust: Auto-split actionableSteps if it's a string or an array with a single string
  let stepsToSplit = null;
  if (content.actionableSteps && typeof content.actionableSteps === 'string') {
    stepsToSplit = content.actionableSteps;
  } else if (Array.isArray(content.actionableSteps) && content.actionableSteps.length === 1 && typeof content.actionableSteps[0] === 'string') {
    stepsToSplit = content.actionableSteps[0];
  }
  if (stepsToSplit) {
    // Match 'stepX-' (or similar) and capture everything until the next 'stepX-' or end of string
    const stepRegex = /(step\s*\d+[a-zA-Z]*\s*[:.\-–_])([^]*?)(?=step\s*\d+[a-zA-Z]*\s*[:.\-–_]|$)/gi;
    const stepMatches = [...stepsToSplit.matchAll(stepRegex)];
    if (stepMatches.length > 0) {
      content = {
        ...content,
        actionableSteps: stepMatches.map((m, idx) => ({
          step: `Step ${idx + 1}`,
          description: m[2].trim()
        }))
      };
    } else {
      // fallback: treat as single step
      content = {
        ...content,
        actionableSteps: [
          { step: 'Step 1', description: stepsToSplit }
        ]
      };
    }
  }

  useEffect(() => {
    const fetchMentorData = async () => {
      if (answerCard.mentor) {
        setMentorData(answerCard.mentor);
        setLoadingMentor(false);
        return;
      }
      const mentorId = answerCard.mentorId || answerCard.selectedMentorId;
      if (!mentorId) return setLoadingMentor(false);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/users/${mentorId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMentorData(data);
        }
      } catch (e) { console.error(e); } finally { setLoadingMentor(false); }
    };
    fetchMentorData();
  }, [answerCard, user.token]);

  const submitFollowUp = async () => {
    if (!followUpText.trim() || followUpText.length < 5) return;
    setFollowUpLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/engine/submit-follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          answerCardId: answerCard._id || answerCard.id,
          followUpText
        })
      });
      if (response.ok) {
        setFollowUpText('');
        if (onRefresh) onRefresh(); // 🔁 Refresh current card only
      }
    } catch (e) { console.error(e); } finally { setFollowUpLoading(false); }
  };

  return (
    <div className="answer-card-container">
      {/* 🏆 Brand Confidence Badge */}
      <div className="match-confidence-banner">
        ✨ Atyant Match: <strong>{answerCard.matchScore || 94}% Personal Match</strong>
      </div>

      <div className="answer-card-header">
        <div className="trust-disclaimer">✓ Real experience-backed guidance.</div>
      </div>

      {/* 👤 Mentor Profile Section */}
      {!loadingMentor && mentorData && (
        <div className="mentor-mini-profile">
          <div className="mentor-avatar">
            {mentorData.profileImage ? <img src={mentorData.profileImage} alt="M" /> : <div className="placeholder">👤</div>}
          </div>
          <div className="mentor-details">
            <h4>{mentorData.name || mentorData.username}</h4>
            <p className="mentor-expertise-text">{mentorData.bio}</p>
          </div>
        </div>
      )}







      <div className="answer-body-main">
        {/* 📜 SECTION 1: THE BACKSTORY */}
        <section className="answer-section">
          <h3 className="section-label">📜 Senior's Journey</h3>
          <div className="main-narrative">
            {/* 🚀 THE FIX: Agar object hai toh .mainAnswer nikaalo, varna seedha text dikhao */}
            {typeof content === 'object' 
              ? (content.mainAnswer || content.situation || "Detailed roadmap shared below.") 
              : content}
          </div>
          {content.firstAttempt && (
            <div className="sub-box">
              <strong>Initially tried:</strong> {content.firstAttempt}
            </div>
          )}
        </section>

        {/* ⚠️ SECTION 2: FAILURES & SUCCESS */}
        <div className="experience-comparison-grid">
          {/* ⚠️ SECTION 2: FAILURES (Mistakes List) */}
          {content.keyMistakes?.length > 0 && (
            <div className="answer-section mistakes-alert">
              <h3 className="section-label">⚠️ Mistakes to Avoid</h3>
              <ul className="mistake-bullet-points">
                {content.keyMistakes.map((m, i) => (
                  <li key={i}>
                    {/* 🚀 THE FIX: Agar 'm' ek object hai toh uski description nikaalo */}
                    {typeof m === 'object' 
                      ? (m.description || m.mistake || "Avoid basic preparation errors.") 
                      : m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content.whatWorked && (
            <div className="answer-section success-box">
              <h3 className="section-label">✅ What Finally Worked</h3>
              <p className="success-text">{content.whatWorked}</p>
            </div>
          )}
        </div>

        {/* 🎯 SECTION 3: ROADMAP */}
{content.actionableSteps?.length > 0 && (
  <section className="answer-section roadmap-section">
    <h3 className="section-label">🎯 Actionable Steps</h3>
    <div className="roadmap-grid">
      {content.actionableSteps.map((item, idx) => (
        <div key={idx} className="roadmap-step">
          <div className="step-number">{idx + 1}</div>
          <div className="step-info">
            {/* 🚀 THE FIX: Check if item is an object or string */}
            <strong>
              {typeof item === 'object' ? (item.step || `Step ${idx + 1}`) : `Step ${idx + 1}`}
            </strong>
            <p>
              {typeof item === 'object' ? (item.description || item.text || JSON.stringify(item)) : item}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

        {/* ⏳ SECTION 4: OUTCOME & REFLECTIONS */}
        <div className="insight-grid">
          {content.timeline && (
            <div className="answer-section timeline-box">
              <h3 className="section-label">⏳ Expected Timeline</h3>
              <p>{content.timeline}</p>
            </div>
          )}
          {content.differentApproach && (
            <div className="answer-section mentor-voice-note">
              <h3 className="section-label">💡 If I did it today...</h3>
              <p>"{content.differentApproach}"</p>
            </div>
          )}
        </div>

        {/* 📝 SECTION 5: EXTRA CONTEXT */}
        {content.additionalNotes && (
          <section className="answer-section notes-box">
            <p className="additional-notes-text"><strong>Mentor's Final Note:</strong> {content.additionalNotes}</p>
          </section>
        )}
      </div>

      {/* 🔁 FOLLOW-UP THREAD: Clean & Simple Flow */}
      {answerCard.followUpAnswers && answerCard.followUpAnswers.length > 0 && (
        <div className="follow-up-thread">
          <h3 className="section-label">📚 Follow-up Chat</h3>
          {answerCard.followUpAnswers.map((fu, i) => (
            <div key={i} className="thread-item">
              {/* Student Question Bubble: Hamesha dikhega */}
              <div className="student-q"><strong>Q:</strong> {fu.questionText}</div>
              {/* Mentor Answer Bubble: Sirf tab dikhao jab content ho */}
              <div className="mentor-a">
                {fu.answerContent ? (
                  <p>
                    {/* 🚀 SAME FIX: Objects are not valid as children crash ko rokne ke liye */}
                    {typeof fu.answerContent === 'object' 
                      ? (fu.answerContent.mainAnswer || "Processing...") 
                      : fu.answerContent}
                  </p>
                ) : (
                  <div className="waiting-status-info">⏳ Senior is preparing a reply...</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =============================
          🎤 Mentor Audio Answer (BOTTOM)
          ============================= */}
      {(answerCard.audioUrl || answerCard.transcript) && (
        <div className="mentor-audio-answer">
          {/* DEBUG: Show user and audioUrl info for troubleshooting */}
          {process.env.NODE_ENV === 'development' && (
            <pre style={{background:'#f3f3f3',color:'#333',fontSize:12,padding:8,borderRadius:4,marginBottom:8}}>
              {JSON.stringify({ user, audioUrl: answerCard.audioUrl }, null, 2)}
            </pre>
          )}
          {answerCard.audioUrl && (
            <>
              <div className="mentor-audio-label-row-modern">
                <span className="mentor-audio-mic">🎤</span>
                <span className="mentor-audio-label-modern">Mentor's Voice Answer</span>
                {/* Mentor-only delete button */}
                {user?.role === 'mentor' && (
                  <button
                    style={{
                      marginLeft: 16,
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.95em'
                    }}
                    onClick={async () => {
                      if (!window.confirm('Are you sure you want to delete this voice answer?')) return;
                      try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        const response = await fetch(`${API_URL}/api/engine/delete-voice-answer`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                          },
                          body: JSON.stringify({ answerCardId: answerCard._id || answerCard.id })
                        });
                        if (response.ok && onRefresh) onRefresh();
                      } catch (e) { alert('Failed to delete voice answer.'); }
                    }}
                  >
                    Delete Voice
                  </button>
                )}
              </div>
              <div className="mentor-audio-bar-wrap">
                <audio
                  controls
                  src={
                    answerCard.audioUrl.startsWith('http')
                      ? answerCard.audioUrl
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${answerCard.audioUrl}`
                  }
                  className="mentor-audio-bar"
                />
              </div>
            </>
          )}
          {/* Show transcript toggle only if real transcript exists */}
          <TranscriptToggle transcript={answerCard.transcript} />
        </div>
      )}

      {/* ACTION FOOTER */}
      <div className="follow-up-input-container">
        {answerCard.followUpCount < 2 ? (
          <>
            <input 
              type="text" 
              placeholder="Ask a quick follow-up..." 
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
            />
            <button className="send-fu-btn" onClick={submitFollowUp} disabled={followUpLoading}>
              {followUpLoading ? '...' : '↗'}
            </button>
          </>
        ) : (
          <div className="text-center w-full text-gray-400 text-sm">Follow-up limit reached.</div>
        )}
      </div>
    </div>
  );
};

export default AnswerCard;