import React from "react";
import './career-guides.css';

const getInitials = (name = "M") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};


export default function MentorRecommendationBlock({ mentor, topicLabel }) {
  if (!mentor) return null;

  const avatarSrc = mentor.avatar || mentor.profilePicture || mentor.profileImage;

  // Show 'Coming Soon' alert
  const handleComingSoon = (e) => {
    e.preventDefault();
    window.alert('Coming Soon');
  };

  return (
    <div className="mentor-recommend-block">
      <div className="mentor-recommend-avatar">
        {avatarSrc ? (
          <img src={avatarSrc} alt={mentor.name} />
        ) : (
          <span>{getInitials(mentor.name)}</span>
        )}
      </div>
      <div className="mentor-recommend-info">
        <div className="mentor-recommend-name">{mentor.name}</div>
        {topicLabel ? <div className="mentor-recommend-topic">Relevant for {topicLabel}</div> : null}
        <div className="mentor-recommend-tag">{mentor.tag || 'Solved this'}</div>
      </div>
      <div className="mentor-recommend-actions">
        <span className="lockin-sticker" title="Lock in coming soon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="24" height="16" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2"/>
            <path d="M8 12V8a6 6 0 1 1 12 0v4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="14" cy="18" r="2.2" fill="#6366f1"/>
          </svg>
          <span className="lockin-label">Lock In</span>
        </span>
        <button className="learn-btn" type="button" onClick={handleComingSoon}>Learn from Mentor</button>
        <button className="ask-btn" type="button" onClick={handleComingSoon}>Ask Mentor</button>
      </div>
    </div>
  );
}
