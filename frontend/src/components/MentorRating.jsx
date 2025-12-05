import React, { useState, useEffect } from 'react';
import './MentorRating.css';

const MentorRating = ({ mentorId, showDetails = false }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ GET API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (mentorId) {
      fetchRating();
    }
  }, [mentorId]);

  const fetchRating = async () => {
    try {
      setLoading(true);
      
      // ✅ USE DYNAMIC API URL
      const response = await fetch(
        `${API_URL}/api/ratings/mentor/${mentorId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRatingData(data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching rating:', err);
      setError('Failed to load rating');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Stars render karne ka function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star filled">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">★</span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty">☆</span>
        );
      }
    }

    return stars;
  };

  // ✅ Rating breakdown bars (5-star breakdown)
  const renderRatingBreakdown = () => {
    if (!ratingData || ratingData.totalRatings === 0) return null;

    const breakdown = [
      { stars: 5, count: ratingData.fiveStars || 0 },
      { stars: 4, count: ratingData.fourStars || 0 },
      { stars: 3, count: ratingData.threeStars || 0 },
      { stars: 2, count: ratingData.twoStars || 0 },
      { stars: 1, count: ratingData.oneStar || 0 }
    ];

    return (
      <div className="rating-breakdown">
        {breakdown.map(({ stars, count }) => {
          const percentage = (count / ratingData.totalRatings) * 100;
          
          return (
            <div key={stars} className="breakdown-row">
              <span className="stars-label">{stars}★</span>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="breakdown-count">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rating-skeleton">
        <div className="skeleton-stars">
          <span className="skeleton-star"></span>
          <span className="skeleton-star"></span>
          <span className="skeleton-star"></span>
          <span className="skeleton-star"></span>
          <span className="skeleton-star"></span>
        </div>
        <span className="skeleton-text-rating"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentor-rating error">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!ratingData || ratingData.totalRatings === 0) {
    return (
      <div className="mentor-rating no-ratings">
        <span className="star-icon">⭐</span>
        <span className="no-rating-text">No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="mentor-rating">
      <div className="rating-summary">
        <div className="stars-display">
          {renderStars(ratingData.averageRating)}
        </div>
        <div className="rating-info">
          <span className="rating-number">{ratingData.averageRating}</span>
          <span className="rating-divider">|</span>
          <span className="rating-count">
            {ratingData.totalRatings} {ratingData.totalRatings === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
      </div>

      {showDetails && renderRatingBreakdown()}
    </div>
  );
};

export default MentorRating;