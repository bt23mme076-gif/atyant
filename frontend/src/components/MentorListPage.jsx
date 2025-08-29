// src/components/MentorListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MentorListPage.css'; // Your existing CSS file

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        // 1. CRITICAL BUG FIX: Corrected the API URL
        const response = await fetch('https://atyant-backend.onrender.com/api/mentors');
        if (!response.ok) {
          throw new Error('Data could not be fetched!');
        }
        const data = await response.json();
        setMentors(data);
      } catch (error) {
        setError('Could not load mentors. Please try again later.');
        console.error('Failed to fetch mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const startChatWithMentor = (mentor) => {
    navigate('/chat', { state: { selectedMentor: mentor } });
  };

  // 2. UI IMPROVEMENT: Show a loading message
  if (loading) {
    return <div className="status-message">Loading Mentors...</div>;
  }

  // 3. UI IMPROVEMENT: Show an error message
  if (error) {
    return <div className="status-message error">{error}</div>;
  }

  return (
    <div className="mentor-list-container">
      <h1>Meet Our Mentors</h1>
      <p>Select a mentor to start a conversation.</p>
      <div className="mentor-grid">
        {mentors.map((mentor) => (
          // 4. UI IMPROVEMENT: Upgraded card structure
          <div className="mentor-card" key={mentor._id}>
            <img 
              src={mentor.image || `https://i.pravatar.cc/150?u=${mentor._id}`} 
              alt={mentor.username} 
              className="mentor-image" 
            />
            <h3 className="mentor-name">{mentor.username}</h3>
            <p className="mentor-interest">{mentor.interest || 'Expert Mentor'}</p>
            <button onClick={() => startChatWithMentor(mentor)}>Chat Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorListPage;