import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './MentorListPage.css';

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/mentors`);
        
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

  const validateAndStartChat = async (mentor) => {
    try {
      setError(null);
      
      if (!mentor || !mentor._id) {
        throw new Error("Invalid mentor data");
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
      
      // First validate the mentor
      const validationResponse = await fetch(`${API_URL}/api/validate-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mentorId: mentor._id,
          userId: user.id
        })
      });
      
      const validationResult = await validationResponse.json();
      
      if (!validationResult.valid) {
        throw new Error(validationResult.message || "Cannot start chat with this mentor");
      }
      
      // If validation passed, navigate to chat
      navigate('/chat', { 
        state: { 
          selectedMentor: {
            id: mentor._id,
            name: mentor.username || mentor.name,
            email: mentor.email,
            image: mentor.image || `https://i.pravatar.cc/150?u=${mentor._id}`
          }
        }
      });
      
    } catch (error) {
      console.error("Error starting chat:", error);
      setError(error.message || "Failed to start chat. Please try again.");
    }
  };

  if (loading) {
    return <div className="status-message">Loading Mentors...</div>;
  }

  if (error) {
    return (
      <div className="status-message error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="mentor-list-container">
      <h1>Meet Our Mentors</h1>
      <p>Select a mentor to start a conversation.</p>
      
      <div className="mentor-grid">
        {mentors.map((mentor) => (
          <div className="mentor-card" key={mentor._id}>
            <img 
              src={mentor.image || `https://i.pravatar.cc/150?u=${mentor._id}`} 
              alt={mentor.username} 
              className="mentor-image" 
            />
            <h3 className="mentor-name">{mentor.username}</h3>
            <p className="mentor-interest">{mentor.interest || 'Expert Mentor'}</p>
            <button 
              onClick={() => validateAndStartChat(mentor)}
              className="chat-button"
            >
              Start Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorListPage;