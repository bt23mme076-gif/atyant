import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', bio: '', expertise: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  console.log("User from context:", user);
  console.log("Token being sent:", user?.token);


  useEffect(() => {
    if (user && user.token) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${API_URL}/api/profile/me`, {
            headers: { 'Authorization': `Bearer ${user.token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setFormData({
              username: data.username,
              bio: data.bio || '',
              expertise: data.expertise || [],
            });
          } else { setMessage('Failed to load profile.'); }
        } catch (error) { setMessage('An error occurred while loading profile.');
        } finally { setLoading(false); }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      setMessage("You must be logged in to save.");
      return;
    }
    setLoading(true);
    setMessage('');
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/profile/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
            setMessage('Profile updated successfully!');
        } else { setMessage(data.message || 'Failed to update profile.'); }
    } catch (error) { setMessage('An error occurred.');
    } finally { setLoading(false); }
  };
  
  if (loading) return <div className="status-message">Loading Profile...</div>;
  if (!user) return <div className="status-message">Please log in to view your profile.</div>;

  return (
    <div className="profile-container">
      <form className="profile-form" onSubmit={handleSubmit}>
        <h2>Edit Your Profile</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows="4" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}></textarea>
        </div>
        {user?.role === 'mentor' && (
          <div className="form-group">
            <label htmlFor="expertise">Expertise (comma separated)</label>
            <input id="expertise" name="expertise" type="text" value={formData.expertise.join(', ')} onChange={(e) => setFormData({...formData, expertise: e.target.value.split(',').map(item => item.trim())})} />
          </div>
        )}
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        {message && <p className="form-message success">{message}</p>}
      </form>
    </div>
  );
};

export default ProfilePage;