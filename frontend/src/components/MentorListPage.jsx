// src/components/MentorListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MentorListPage.css';

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch('http://https://atyant-backend.onrender.com/api/mentors');
        const data = await response.json();
        setMentors(data);
      } catch (error) {
        console.error('Failed to fetch mentors:', error);
      }
    };
    fetchMentors();
  }, []);

  const startChatWithMentor = (mentor) => {
    // Chat page par jao aur mentor ki details saath mein bhejo
    navigate('/chat', { state: { selectedMentor: mentor } });
  };

  return (
    <div className="mentor-list-container">
      <h1>Our Mentors</h1>
      <p>Select a mentor to start a conversation.</p>
      <div className="mentor-grid">
        {mentors.map((mentor) => (
          <div className="mentor-card" key={mentor._id}>
            <div className="mentor-avatar">👤</div>
            <h3>{mentor.username}</h3>
            <p>{mentor.email}</p>
            <button onClick={() => startChatWithMentor(mentor)}>Chat Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorListPage;