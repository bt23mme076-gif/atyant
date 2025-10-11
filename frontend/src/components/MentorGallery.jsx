// src/components/MentorGallery.jsx
import React, { useState, useEffect } from 'react';
import './MentorGallery.css';
import defaultAvatar from '../assets/default-avatar.svg';

const MentorGallery = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/users/mentors`);
        const data = await response.json();
        setMentors(data || []);
      } catch (error) {
        setMentors([]);
      }
    };
    fetchMentors();
  }, []);

  // Duplicate mentors array for seamless scrolling
  const scrollingMentors = [...mentors, ...mentors];

  return (
    <section className="gallery-section">
      <h2>Problem Solvers</h2>
      <div className="scrolling-wrapper">
        <div className="scrolling-content">
          {scrollingMentors.map((mentor, idx) => (
            <div className="mentor-gallery-card" key={idx}>
              <div className="mentor-image-container">
                <img
                  src={mentor.profilePicture || defaultAvatar}
                  alt={mentor.username}
                  onError={e => { e.target.src = defaultAvatar }}
                />
              </div>
              <div className="mentor-info">
                <h3>{mentor.name || mentor.username}</h3>
                <p className="mentor-bio">
                  {mentor.bio ? (mentor.bio.length > 100 ? `${mentor.bio.substring(0, 100)}...` : mentor.bio) : "No bio available"}
                </p>
                <div className="mentor-specialties">
                  {mentor.specialties?.map((specialty, i) =>
                    <span key={i} className="specialty-tag">{specialty}</span>
                  ) || <span className="specialty-tag">Get Guidence</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorGallery;
