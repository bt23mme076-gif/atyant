import React, { useState, useEffect } from 'react';
import './RatingModal.css';

const RatingModal = ({ isOpen, onClose, mentor, chatSessionId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ✅ ADD THIS - Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Rating Modal Data:', {
        mentor: mentor?.username,
        mentorId: mentor?._id,
        chatSessionId: chatSessionId,
        hasToken: !!localStorage.getItem('token')
      });
    }
  }, [isOpen, mentor, chatSessionId]);

  if (!isOpen) return null;

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validate rating
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    // ✅ Validate mentor and session ID
    if (!mentor || !mentor._id) {
      setError('Mentor information is missing');
      return;
    }

    if (!chatSessionId) {
      setError('Chat session ID is missing');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // ✅ Log the data being sent for debugging
      const requestData = {
        mentorId: mentor._id,
        chatSessionId: chatSessionId,
        rating: rating,
        feedbackText: feedbackText.trim()
      };
      
      console.log('📤 Sending rating data:', requestData);

      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      console.log('📥 Response:', data);

      if (response.ok && data.success) {
        if (onSubmitSuccess) {
          onSubmitSuccess(data.data);
        }
        // Reset form
        setRating(0);
        setFeedbackText('');
        onClose();
      } else {
        setError(data.message || 'Failed to submit rating');
      }
    } catch (err) {
      console.error('❌ Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="rating-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="rating-modal-header">
          <h2>Rate Your Experience</h2>
          <p>How was your session with {mentor.username}?</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rating-stars-section">
            <div className="rating-stars-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`rating-star ${
                    star <= (hoverRating || rating) ? 'filled' : 'empty'
                  }`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            {(hoverRating || rating) > 0 && (
              <p className="rating-label">
                {ratingLabels[hoverRating || rating]}
              </p>
            )}
          </div>

          <div className="rating-feedback-section">
            <label htmlFor="feedback">
              Share your feedback (optional)
            </label>
            <textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What did you like? What could be improved?"
              maxLength={500}
              rows={4}
            />
            <span className="char-count">{feedbackText.length}/500</span>
          </div>

          {error && (
            <div className="rating-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="rating-modal-actions">
            <button
              type="button"
              className="rating-btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rating-btn-submit"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;