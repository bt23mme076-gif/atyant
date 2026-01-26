import React, { useState } from 'react';
import MentorDNAForm from './MentorDNAForm';
import './MentorInfo.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MentorInfo({ mentor, onDnaUpdate }) {
  const [editing, setEditing] = useState(false);

  // Loading guard: don't render until mentor data is loaded
  if (!mentor || !mentor.email) {
    return <div>Loading Mentoring DNA...</div>;
  }

  // Show summary if DNA exists (tone filled) and not editing
  const hasStrategy = !!(mentor?.strategy?.tone);
  if (hasStrategy && !editing) {
    return (
      <div className="mentor-dna-summary-card">
        <h2 className="mentor-dna-summary-title">{mentor.name || mentor.username}</h2>
        <div className="mentor-dna-summary-email"><b>Email:</b> {mentor.email}</div>
        <div className="mentor-dna-summary-section">
          <div className="mentor-dna-summary-heading">Mentoring DNA</div>
          <hr style={{ border: 'none', borderBottom: '1.5px solid #e0e7ef', margin: '0.5rem 0 1.2rem 0' }} />
          <ul className="mentor-dna-summary-list">
            <li><b>Tone:</b> {mentor.strategy.tone}</li>
            <li><b>Language:</b> {mentor.strategy.language}</li>
            <li><b>Hard Truth:</b> {mentor.strategy.hardTruth}</li>
            <li><b>Time Waste:</b> {mentor.strategy.timeWaste}</li>
            <li><b>Roadmap:</b> {mentor.strategy.roadmap}</li>
            <li><b>Resume Tip:</b> {mentor.strategy.resumeTip}</li>
            <li><b>Never Recommend:</b> {mentor.strategy.neverRecommend}</li>
            <li><b>Permission:</b> <span className="mentor-dna-summary-permission">{mentor.strategy.permission ? 'Yes' : 'No'}</span></li>
          </ul>
        </div>
        <button className="mentor-dna-summary-btn" onClick={() => setEditing(true)}>Edit DNA</button>
      </div>
    );
  }

  // Show form if not filled or editing
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <MentorDNAForm
        strategy={mentor.strategy || {}}
        onSuccess={async (newStrategy) => {
          // Directly update context/local user with new strategy, no refetch
          if (onDnaUpdate) onDnaUpdate({ ...mentor, strategy: { ...mentor.strategy, ...newStrategy } });
          setEditing(false);
        }}
      />
    </div>
  );
}
