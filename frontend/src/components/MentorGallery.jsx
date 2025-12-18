// src/components/MentorGallery.jsx
import React, { useState, useEffect } from 'react';
import './MentorGallery.css';
import defaultAvatar from '../assets/default-avatar.svg';

// ✅ CACHE CONSTANTS
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'mentors_gallery_cache';

const MentorGallery = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      // Check cache first
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TIME) {
            setMentors(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Cache read error:', err);
      }

      // Fetch from API
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/mentor/mentors?limit=8`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const mentorData = Array.isArray(data) ? data.slice(0, 8) : [];
        setMentors(mentorData);
        
        // Cache the data
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: mentorData,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Failed to fetch mentors:', error);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const getAvatarPlaceholder = (mentor, idx) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)'
    ];
    const nameStr = (mentor?.name || mentor?.username || 'M');
    const hash = nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientIndex = hash % gradients.length;
    
    return (
      <div 
        className="mentor-image-placeholder" 
        style={{ 
          background: gradients[gradientIndex],
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(255, 255, 255, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <div style={{ 
          fontSize: '3.5rem',
          lineHeight: '1',
          color: 'white',
          textShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>👤</div>
      </div>
    );
  };

  // Don't show anything until mentors are loaded
  if (loading || mentors.length === 0) {
    return null;
  }

  // Duplicate mentors array for seamless scrolling
  const scrollingMentors = [...mentors, ...mentors];

  return (
    <section className="gallery-section">
      <h2>Meet Our Mentors</h2>
      <div className="scrolling-wrapper">
        <div className="scrolling-content">
          {scrollingMentors.map((mentor, idx) => (
            <div className="mentor-gallery-card" key={idx}>
              <div className="mentor-image-container">
                {mentor.profilePicture ? (
                  <img
                    src={mentor.profilePicture}
                    alt={mentor.username}
                    onError={e => { e.target.src = defaultAvatar }}
                  />
                ) : (
                  getAvatarPlaceholder(mentor, idx)
                )}
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
