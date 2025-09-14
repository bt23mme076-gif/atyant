import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '',
    feedback: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Thank you for your valuable feedback!');
        setFormData({ name: '', email: '', rating: '', feedback: '' }); // Clear form
      } else {
        setMessage(data.message || 'Failed to submit feedback.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="feedback" className="feedback-section">
      <div className="feedback-container">
        <div className="feedback-header">
            <h2>We Value Your Feedback</h2>
            <p>Your thoughts help us improve Atyant and serve you better.</p>
        </div>
        
        <div className="feedback-card">
            <form className="feedback-form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name (optional)" 
                value={formData.name}
                onChange={handleChange}
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email (optional)" 
                value={formData.email}
                onChange={handleChange}
              />
              <select 
                name="rating" 
                value={formData.rating}
                onChange={handleChange}
                required
              >
                <option value="">Rate Your Experience (1-5)</option>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Poor</option>
                <option value="1">⭐ Very Poor</option>
              </select>
              <textarea 
                name="feedback"
                placeholder="What can we improve? Your suggestions matter..."
                rows="5" 
                value={formData.feedback}
                onChange={handleChange}
                required
              ></textarea>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              {message && <p className="form-message">{message}</p>}
            </form>
        </div>
      </div>
    </section>
  );
};

export default FeedbackForm;