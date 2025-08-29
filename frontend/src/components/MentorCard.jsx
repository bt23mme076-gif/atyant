// src/components/MentorCard.jsx
import React from 'react';

const MentorCard = ({ mentor }) => {
  return (
    <div className="mentor-card">
      <img src={mentor.image} alt={mentor.name} className="mentor-image" />
      <h3 className="mentor-name">{mentor.name}</h3>
      <p className="mentor-interest">{mentor.interest}</p>
      <button className="message-button">Message</button>
    </div>
  );
};

export default MentorCard;