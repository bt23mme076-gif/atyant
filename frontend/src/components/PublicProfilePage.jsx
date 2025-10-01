import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PublicProfilePage.css'; // Import CSS file

const PublicProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
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
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const startChat = () => {
    if (profile) {
      navigate('/chat', { state: { selectedContact: profile } });
    }
  };

  if (loading) {
    return <div className="status-message">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="status-message error">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="status-message">Profile not found.</div>;
  }

  return (
    <div className="public-profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePicture || `https://api.pravatar.cc/150?u=${username}`}
          alt={profile.username}
          className="profile-avatar"
        />
        <h1>{profile.username}</h1>
        <p className="profile-role">{profile.role}</p>
        <p className="profile-bio">{profile.bio || 'No bio available.'}</p>

        {profile.expertise && profile.expertise.length > 0 && (
          <div className="expertise-section">
            <h4>Expertise</h4>
            <div className="tags">
              {profile.expertise.map((skill, index) => (
                <span className="tag" key={index}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        <button className="chat-now-btn" onClick={startChat}>Chat Now</button>
      </div>
    </div>
  );
};

export default PublicProfilePage;