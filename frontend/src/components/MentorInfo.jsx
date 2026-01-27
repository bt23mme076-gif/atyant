
import React from 'react';
import './MentorInfo.css';


// Only show summary, never allow edit (admin view)
export default function MentorInfo({ mentor }) {


  // Loading guard: don't render until mentor data is loaded
  if (!mentor || !mentor.email) {
    return <div>Loading Mentoring DNA...</div>;
  }


  // Show summary if DNA exists (tone filled)
  const hasStrategy = !!(mentor?.strategy?.tone);
  if (hasStrategy) {
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
      </div>
    );
  }

  // If no DNA, show message
  return (
    <div className="mentor-dna-summary-card" style={{textAlign:'center', color:'#888', fontSize:'1.1rem', padding:'2rem'}}>
      No DNA available for this mentor.
    </div>
  );
}
