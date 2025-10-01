// src/pages/PublicProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PublicProfilePage.css';

const PublicProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const { username } = useParams(); // Get username from the URL

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // CORRECTED: Use the correct API route
        const response = await fetch(`${API_URL}/api/profile/${username}`);

        if (!response.ok) {
          // Handle non-200 responses (e.g., 404, 500)
          console.error(`Failed to load profile: ${response.status}`);
          setError(`Failed to load profile: ${response.statusText}`); // Or, use the JSON message
          return;
        }

        const data = await response.json();
        setProfile(data);

      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div className="status-message">Loading Profile...</div>;
  if (error) return <div className="status-message error">{error}</div>; // Display error message
  if (!profile) return <div className="status-message">User not found.</div>;

  return (
    <div className="public-profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePicture || `https://api.pravatar.cc/150?u=${profile._id}`}
          alt={profile.username}
          className="profile-avatar"
          onError={(e) => {
            // Handle image loading errors
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = 'default-profile-image.jpg'; // Use a default image
          }}
        />
        <h1>{profile.username}</h1>
        <p className="profile-role">{profile.role}</p>
        <p className="profile-bio">{profile.bio}</p>

        {profile.role === 'mentor' && profile.expertise?.length > 0 && (
          <div className="expertise-section">
            <h4>Expertise</h4>
            <div className="tags">
              {profile.expertise.map((skill, index) => (
                <span key={index} className="tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        <Link to="/chat" state={{ selectedContact: profile }} className="chat-now-btn">
          Chat with {profile.username}
        </Link>
      </div>
    </div>
  );
};

export default PublicProfilePage;