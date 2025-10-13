// src/components/MentorGallery.jsx
import React, { useState, useEffect } from 'react';
import './MentorGallery.css';
import defaultAvatar from '../assets/default-avatar.svg';

const MentorGallery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        console.log('Fetching mentors from:', `${API_URL}/api/users/mentors`);
        const response = await fetch(`${API_URL}/api/users/mentors`);
        if (!response.ok) {
          throw new Error(`Failed to fetch mentors: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Mentors data received:', data);
        setMentors(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch mentors for gallery:', error);
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <section className="gallery-section">
      <h2>Our Mentors</h2>
      <div className="scrolling-wrapper">
        <div className="scrolling-content">
          {/* First set of mentors */}
          {mentors.map((mentor, index) => (
            <div className="mentor-gallery-card" key={`first-${index}`}>
              <div className="mentor-image-container">
                <img 
                  src={mentor.profilePicture || defaultAvatar} 
                  alt={mentor.username} 
                  onError={(e) => { e.target.src = defaultAvatar }}
                />
              </div>
              <div className="mentor-info">
                <h3>{mentor.name || mentor.username}</h3>
                <p className="mentor-bio">
                  {mentor.bio ? 
                    (mentor.bio.length > 100 ? 
                      `${mentor.bio.substring(0, 100)}...` : 
                      mentor.bio
                    ) : 
                    "No bio available"
                  }
                </p>
                <div className="mentor-specialties">
                  {mentor.specialties?.map((specialty, idx) => (
                    <span key={idx} className="specialty-tag">{specialty}</span>
                  )) || <span className="specialty-tag">Mentorship</span>}
                </div>
              </div>
            </div>
          ))}
          {/* Duplicate set for seamless scrolling */}
          {mentors.map((mentor, index) => (
            <div className="mentor-gallery-card" key={`second-${index}`}>
              <div className="mentor-image-container">
                <img 
                  src={mentor.profilePicture || defaultAvatar} 
                  alt={mentor.username} 
                  onError={(e) => { e.target.src = defaultAvatar }}
                />
              </div>
              <div className="mentor-info">
                <h3>{mentor.name || mentor.username}</h3>
                <p className="mentor-bio">
                  {mentor.bio ? 
                    (mentor.bio.length > 100 ? 
                      `${mentor.bio.substring(0, 100)}...` : 
                      mentor.bio
                    ) : 
                    "No bio available"
                  }
                </p>
                <div className="mentor-specialties">
                  {mentor.specialties?.map((specialty, idx) => (
                    <span key={idx} className="specialty-tag">{specialty}</span>
                  )) || <span className="specialty-tag">Mentorship</span>}
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