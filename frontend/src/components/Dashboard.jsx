// src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { MessageSquare, Users, TrendingUp, MapPin, Calendar, BookOpen } from 'lucide-react';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    profileViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    if (user?.role === 'mentor' && user?.token) {
      fetchMentorStats(isMounted);
    }
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency - only run once

  const fetchMentorStats = async (isMounted = true) => {
    try {
      const res = await fetch(`${API_URL}/api/mentor/stats`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (res.ok && isMounted) {
        const data = await res.json();
        setStats({
          totalChats: data.totalChats || 0,
          activeChats: data.activeChats || 0,
          profileViews: data.profileViews || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  // Redirect students to home
  if (user?.role !== 'mentor') {
    return <Navigate to="/" replace />;
  }

  if (user?.role === 'mentor') {
    return (
      <div className="mentor-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user?.username || 'Mentor'}! 👋</h1>
            <p className="subtitle">Here's what's happening with your mentorship today</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon messages">
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalChats}</h3>
              <p>Total Conversations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.activeChats}</h3>
              <p>Active This Week</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon views">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.profileViews}</h3>
              <p>Profile Views</p>
            </div>
          </div>
        </div>

        <div className="action-cards">
          <Link to="/chat" className="action-card primary">
            <MessageSquare size={28} />
            <h3>Student Chats</h3>
            <p>Reply to student messages and provide guidance</p>
            <span className="arrow">→</span>
          </Link>

          <Link to="/profile" className="action-card secondary">
            <Users size={28} />
            <h3>My Profile</h3>
            <p>Update your expertise and availability</p>
            <span className="arrow">→</span>
          </Link>

          <Link to="/internships" className="action-card tertiary">
            <BookOpen size={28} />
            <h3>Internship Resources</h3>
            <p>Share knowledge about opportunities</p>
            <span className="arrow">→</span>
          </Link>
        </div>

        <div className="tips-section">
          <div className="tips-header">
            <Calendar size={20} />
            <h2>Mentor Tips</h2>
          </div>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-emoji">💡</span>
              <h4>Respond Quickly</h4>
              <p>Students appreciate fast responses. Try to reply within 24 hours.</p>
            </div>
            <div className="tip-card">
              <span className="tip-emoji">🎯</span>
              <h4>Be Specific</h4>
              <p>Give concrete examples and actionable advice based on your experience.</p>
            </div>
            <div className="tip-card">
              <span className="tip-emoji">🤝</span>
              <h4>Stay Engaged</h4>
              <p>Follow up with students to see how they're implementing your guidance.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;