// src/pages/PublicProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PublicProfilePage.css';

const PublicProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { username } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/profile/${username}`);

        if (!response.ok) {
          const errorData = await response.json(); // Try to get JSON error
          const errorMessage = errorData.message || response.statusText; // Use message if available
          console.error(`Failed to load profile: ${response.status} - ${errorMessage}`);
          setError(`Failed to load profile: ${errorMessage}`);
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
  if (error) return <div className="status-message error">{error}</div>;
  if (!profile) return <div className="status-message">User not found.</div>;

  return (
    <div className="public-profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePicture || '/default-profile-image.jpg'} // Local default
          alt={profile.username}
          className="profile-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-profile-image.jpg'; // Local default on error
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