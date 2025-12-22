// src/components/AnswerCard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './AnswerCard.css';

const AnswerCard = ({ answerCard, questionId, onRefresh }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [feedbackHelpful, setFeedbackHelpful] = useState(answerCard.userFeedback?.helpful);
  const [rating, setRating] = useState(answerCard.userFeedback?.rating || 0);
  const [comment, setComment] = useState(answerCard.userFeedback?.comment || '');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const [followUpText, setFollowUpText] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  
  const [mentorData, setMentorData] = useState(null);
  const [loadingMentor, setLoadingMentor] = useState(true);

  // Mentorship options with Razorpay links
  const mentorshipOptions = {
    chat: {
      title: '1-on-1 Chat Session',
      description: 'Direct messaging with your mentor',
      price: 1,
      icon: '💬',
      razorpayLink: 'https://pages.razorpay.com/pl_PGkwA9wDG2mjU8/view',
      popular: false
    },
    video: {
      title: 'Video Call Session',
      description: '30-min personalized video guidance',
      price: 599,
      icon: '🎥',
      razorpayLink: 'https://pages.razorpay.com/pl_PGkwA9wDG2mjU8/view',
      popular: true
    },
    roadmap: {
      title: 'Complete Roadmap',
      description: 'Detailed career guidance & action plan',
      price: 1499,
      icon: '📚',
      razorpayLink: 'https://pages.razorpay.com/pl_PGkwA9wDG2mjU8/view',
      popular: false
    }
  };

  // Fetch payment status on component mount
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${API_URL}/api/payments/status/${questionId || answerCard.questionId}`,
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        );
        const data = await response.json();
        setPaymentStatus(data);
      } catch (error) {
        console.error('Failed to check payment:', error);
      } finally {
        setLoadingPayment(false);
      }
    };
    
    checkPaymentStatus();
  }, [questionId, answerCard.questionId, user.token]);

  // Fetch mentor data
  useEffect(() => {
    const fetchMentorData = async () => {
      console.log('🔍 Checking answerCard for mentor data:', {
        mentorId: answerCard.mentorId,
        selectedMentorId: answerCard.selectedMentorId,
        mentorIncluded: answerCard.mentor,
        fullAnswerCard: answerCard
      });

      // ✅ First check if mentor data is already included in answerCard
      if (answerCard.mentor) {
        console.log('✅ Using mentor data from answerCard:', answerCard.mentor);
        setMentorData(answerCard.mentor);
        setLoadingMentor(false);
        return;
      }

      // ✅ If not included, fetch it using mentor ID
      if (!answerCard.mentorId && !answerCard.selectedMentorId) {
        console.warn('⚠️ No mentor ID found in answerCard');
        setLoadingMentor(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const mentorId = answerCard.mentorId || answerCard.selectedMentorId;
        console.log('📡 Fetching mentor data for ID:', mentorId);
        
        const response = await fetch(`${API_URL}/api/users/${mentorId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        console.log('📥 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          setMentorData(data);
          console.log('✅ Mentor data loaded:', data);
        } else {
          console.error('❌ Failed to fetch mentor:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching mentor:', error);
      } finally {
        setLoadingMentor(false);
      }
    };

    fetchMentorData();
  }, [answerCard.mentorId, answerCard.selectedMentorId, answerCard.mentor, user.token]);

  const handleBookNow = async (type) => {
    const option = mentorshipOptions[type];
    const qId = questionId || answerCard.questionId;
    
    console.log('🚀 Starting payment for:', { type, price: option.price, questionId: qId });
    
    try {
      // Create Razorpay order from backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('📡 API URL:', API_URL);
      
      const orderResponse = await fetch(`${API_URL}/api/payments/create-mentorship-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          amount: option.price,
          mentorshipType: type,
          questionId: qId
        })
      });
      
      const orderData = await orderResponse.json();
      console.log('📦 Order response:', orderData);
      
      if (!orderData.success) {
        console.error('❌ Order creation failed:', orderData);
        alert(`Failed to create order: ${orderData.error || 'Please try again'}`);
        return;
      }
      
      console.log('✅ Order created:', orderData.order.id);
      
      // Razorpay Checkout options
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Atyant',
        description: option.title,
        order_id: orderData.order.id,
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  },
                  {
                    method: 'card'
                  },
                  {
                    method: 'netbanking'
                  }
                ]
              }
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: async function (response) {
          console.log('💳 Payment response received:', response);
          
          // Payment successful - verify on backend
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payments/verify-mentorship`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                questionId: qId,
                mentorshipType: type
              })
            });
            
            const verifyData = await verifyResponse.json();
            console.log('✅ Verification response:', verifyData);
            console.log('🔍 Mentor IDs available:', {
              fromBackend: verifyData.mentorId,
              fromAnswerCard: answerCard.mentorId,
              selectedMentorId: answerCard.selectedMentorId
            });
            
            if (verifyData.success) {
              // Payment verified - Use mentor ID from backend (this is the correct one from question.selectedMentorId)
              const mentorIdToUse = verifyData.mentorId;
              
              if (!mentorIdToUse) {
                console.error('❌ No mentor ID received from backend!');
                alert('Payment successful but unable to redirect. Please go to chat page manually.');
                return;
              }
              
              console.log('🎯 Redirecting to mentor:', mentorIdToUse);
              
              if (type === 'chat') {
                // Redirect to chat page with correct mentor ID
                alert('💬 Payment successful! Opening chat with your mentor...');
                navigate(`/chat/${mentorIdToUse}`);
              } else if (type === 'video') {
                // Redirect to video call scheduling/page
                alert('🎥 Payment successful! Redirecting to video session...');
                navigate(`/video-session/${qId}`);
              } else if (type === 'roadmap') {
                // Redirect to roadmap page
                alert('📚 Payment successful! Redirecting to roadmap...');
                navigate(`/roadmap/${qId}`);
              }
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('❌ Verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || user?.name || '',
          email: localStorage.getItem('userEmail') || user?.email || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        notes: {
          questionId: qId,
          mentorshipType: type,
          userId: user?.userId || localStorage.getItem('userId')
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ Payment cancelled by user');
          },
          escape: true,
          backdropclose: false,
          confirm_close: false
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const submitFeedback = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/engine/answer-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          answerCardId: answerCard.id,
          helpful: feedbackHelpful,
          rating,
          comment
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbackSubmitted(true);
        setTimeout(() => setFeedbackSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const submitFollowUp = async () => {
    if (!followUpText.trim() || followUpText.length < 5) {
      alert('Please enter a valid follow-up question');
      return;
    }
    
    if (answerCard.followUpCount >= 2) {
      alert('Maximum 2 follow-up questions allowed');
      return;
    }
    
    setFollowUpLoading(true);
    
    const answerCardIdToUse = answerCard._id || answerCard.id;
    console.log('🔁 Submitting follow-up question');
    console.log('🎴 Answer Card ID:', answerCardIdToUse);
    console.log('📝 Follow-up text:', followUpText);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/engine/submit-follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          answerCardId: answerCardIdToUse,
          followUpText
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFollowUpSubmitted(true);
        setFollowUpText('');
        
        console.log('✅ Follow-up submitted successfully');
        console.log('📝 Answer Card ID:', data.answerCardId);
        console.log('🔁 Staying on same page (no navigation)');
        
        // ⚠️ IMPORTANT: Stay on same page, just refresh to show pending follow-up
        // Do NOT navigate to new question page
        if (onRefresh) {
          setTimeout(() => {
            onRefresh(); // Refresh to show new follow-up in list
            setFollowUpSubmitted(false);
          }, 1500);
        }
      } else {
        alert(data.error || 'Failed to submit follow-up');
      }
    } catch (error) {
      console.error('Error submitting follow-up:', error);
      alert('Failed to submit follow-up question');
    } finally {
      setFollowUpLoading(false);
    }
  };

  // Helper function to calculate preparation time
  const calculatePrepTime = (createdAt, updatedAt) => {
    if (!createdAt || !updatedAt) return 'a few hours';
    
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);
    const diffMs = updated - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return diffMins < 5 ? 'a few minutes' : `${diffMins} minutes`;
    } else if (diffHours === 1) {
      return '1 hour';
    } else if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      const days = Math.floor(diffHours / 24);
      return days === 1 ? '1 day' : `${days} days`;
    }
  };

  const content = answerCard.answerContent || answerCard.content || {};
  
  console.log('📋 Answer content:', content);
  console.log('📦 Full answerCard:', answerCard);

  return (
    <div className="answer-card-container">
      <div className="answer-card-header">
        <h2>✨ Your Answer is Ready</h2>
        <div className="trust-badge">
          <span>✓</span>
          <span>{answerCard.trustMessage}</span>
        </div>
      </div>

      {/* Mentor Card Section */}
      {loadingMentor ? (
        <div className="mentor-card-embed">
          <div className="mentor-card-loading">
            <p>Loading mentor information...</p>
          </div>
        </div>
      ) : mentorData ? (
        <div className="mentor-card-embed">
          <div className="mentor-card-header">
            <h3>👤 Mentor Behind This Answer</h3>
            <span className="verified-badge">✓ Verified</span>
          </div>
          <div className="mentor-card-body">
            <div className="mentor-avatar">
              {mentorData.profilePicture ? (
                <img 
                  src={mentorData.profilePicture} 
                  alt={mentorData.name || mentorData.username}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-placeholder"
                style={{ 
                  display: mentorData.profilePicture ? 'none' : 'flex',
                  background: (() => {
                    const gradients = [
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
                    ];
                    const nameStr = mentorData.name || mentorData.username || 'M';
                    const hash = nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    return gradients[hash % gradients.length];
                  })()
                }}
              >
                <svg 
                  style={{ width: '60%', height: '60%' }} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="7" r="4" fill="white" fillOpacity="0.95"/>
                  <path d="M5 21C5 16.5817 8.13401 13 12 13C15.866 13 19 16.5817 19 21H5Z" fill="white" fillOpacity="0.95"/>
                </svg>
              </div>
            </div>
            <div className="mentor-info">
              <h4 className="mentor-name">{mentorData.name || mentorData.username}</h4>
              {mentorData.bio && (
                <p className="mentor-bio">{mentorData.bio}</p>
              )}
              {mentorData.expertise && mentorData.expertise.length > 0 && (
                <div className="mentor-expertise">
                  {mentorData.expertise.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="expertise-tag">{skill}</span>
                  ))}
                </div>
              )}
              {mentorData.yearsOfExperience > 0 && (
                <div className="mentor-experience">
                  <span className="experience-badge">
                    🎯 {mentorData.yearsOfExperience} years experience
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mentor-card-footer">
            <p className="mentor-trust-text">
              💡 This guidance is based on the mentor's real journey. Structured by Atyant.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '10px 30px' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
            ℹ️ Mentor information not available
          </p>
        </div>
      )}

      <div className="answer-card-content">
        {/* Preparation Time Metadata */}
        {answerCard.createdAt && answerCard.updatedAt && (
          <div className="answer-metadata">
            <span className="prep-time">
              ⏱️ Prepared in {calculatePrepTime(answerCard.createdAt, answerCard.updatedAt)}
            </span>
          </div>
        )}

        <div className="main-answer">
          {content.mainAnswer}
        </div>

        {/* What Didn't Work For Me Section */}
        {content.keyMistakes && content.keyMistakes.length > 0 && (
          <>
            <h3 className="section-title">❌ What Didn't Work For Me</h3>
            <ul className="mistakes-list">
              {content.keyMistakes.map((mistake, idx) => (
                <li key={idx}>{mistake}</li>
              ))}
            </ul>
          </>
        )}

        {content.actionableSteps && content.actionableSteps.length > 0 && (
          <>
            <h3 className="section-title">✅ Actionable Steps</h3>
            <ul className="steps-list">
              {content.actionableSteps.map((step, idx) => (
                <li key={idx}>
                  <div className="step-title">{step.step}</div>
                  <div className="step-description">{step.description}</div>
                </li>
              ))}
            </ul>
          </>
        )}

        {content.timeline && (
          <>
            <h3 className="section-title">⏳ Timeline & Expectations</h3>
            <div className="timeline-box">
              <p>{content.timeline}</p>
            </div>
          </>
        )}

        {content.realContext && (
          <>
            <h3 className="section-title">💭 Mentor's Real Experience</h3>
            <div className="real-context-box">
              <p>{content.realContext}</p>
            </div>
          </>
        )}
      </div>

      <div className="answer-card-footer">
        <p className="signature">{answerCard.signature}</p>
        <div className="trust-footer">
          <p>
            🤝 This answer was crafted by a real mentor who's walked this path. 
            Not generic advice — real insights from real experience.
          </p>
          <p className="atyant-tag">Powered by Atyant</p>
        </div>
      </div>

      {/* Follow-up Answers Section */}
      {answerCard.followUpAnswers && answerCard.followUpAnswers.length > 0 && (
        <div className="follow-up-answers-section">
          <h3 className="follow-up-title">📚 Follow-up Questions & Answers</h3>
          {answerCard.followUpAnswers.map((followUp, index) => (
            <div key={index} className="follow-up-item">
              <div className="follow-up-question">
                <strong>Q{index + 2}:</strong> {followUp.questionText}
                <span className="follow-up-date">
                  {new Date(followUp.askedAt).toLocaleDateString()}
                </span>
              </div>
              
              {followUp.answerContent ? (
                <div className="follow-up-answer">
                  {followUp.answerContent.mainAnswer && (
                    <div className="main-answer">
                      <p>{followUp.answerContent.mainAnswer}</p>
                    </div>
                  )}

                  {followUp.answerContent.keyMistakes && followUp.answerContent.keyMistakes.length > 0 && (
                    <>
                      <h4 className="section-subtitle">Key Mistakes to Avoid</h4>
                      <ul className="mistakes-list">
                        {followUp.answerContent.keyMistakes.map((mistake, idx) => (
                          <li key={idx}>❌ {mistake}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {followUp.answerContent.actionableSteps && followUp.answerContent.actionableSteps.length > 0 && (
                    <>
                      <h4 className="section-subtitle">Actionable Steps</h4>
                      <ul className="steps-list">
                        {followUp.answerContent.actionableSteps.map((step, idx) => (
                          <li key={idx}>
                            <div className="step-title">{step.step}</div>
                            <div className="step-description">{step.description}</div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {followUp.answerContent.timeline && (
                    <div className="timeline-box">
                      <p>⏱️ {followUp.answerContent.timeline}</p>
                    </div>
                  )}

                  {followUp.answerContent.realContext && (
                    <div className="real-context-box">
                      <p>💡 {followUp.answerContent.realContext}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="follow-up-pending">
                  <p>⏳ Waiting for mentor's response...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paid Mentorship Section */}
      {!loadingPayment && paymentStatus?.isPaid ? (
        <div className="payment-success-banner">
          <div className="success-icon">✅</div>
          <div className="success-content">
            <h4>Payment Confirmed!</h4>
            <p>
              You've unlocked <strong>{paymentStatus.mentorshipType}</strong> mentorship.
              Our team will contact you within 24 hours to schedule your session.
            </p>
            <div className="payment-details">
              <span>Amount Paid: ₹{paymentStatus.amount}</span>
              <span>Payment Date: {new Date(paymentStatus.paidAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="paid-mentorship-section">
          <div className="mentorship-header">
            <h3>💎 Want Deeper Guidance?</h3>
            <p>Talk one-to-one with the expert mentor who crafted this answer</p>
          </div>
          
          <div className="mentorship-options">
            {Object.entries(mentorshipOptions).map(([key, option]) => (
              <div key={key} className={`mentorship-card ${option.popular ? 'featured' : ''}`}>
                {option.popular && <div className="badge">Most Popular</div>}
                <div className="card-icon">{option.icon}</div>
                <h4>{option.title}</h4>
                <p>{option.description}</p>
                <div className="price">₹{option.price.toLocaleString()}</div>
                <button className="book-btn" onClick={() => handleBookNow(key)}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="feedback-section">
        <h3>Was this answer helpful?</h3>
        
        <div className="feedback-buttons">
          <button 
            className={`feedback-btn ${feedbackHelpful === true ? 'helpful' : ''}`}
            onClick={() => setFeedbackHelpful(true)}
          >
            👍 Yes, very helpful
          </button>
          <button 
            className={`feedback-btn ${feedbackHelpful === false ? 'not-helpful' : ''}`}
            onClick={() => setFeedbackHelpful(false)}
          >
            👎 Not helpful
          </button>
        </div>

        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${rating >= star ? 'selected' : ''}`}
              onClick={() => setRating(star)}
            >
              {rating >= star ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        <textarea
          className="feedback-comment"
          placeholder="Any additional feedback? (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />

        <button 
          className="submit-feedback-btn"
          onClick={submitFeedback}
          disabled={feedbackHelpful === null}
        >
          Submit Feedback
        </button>

        {feedbackSubmitted && (
          <div className="success-message">
            ✓ Thank you for your feedback!
          </div>
        )}
      </div>

      {/* Follow-up Section */}
      {answerCard.followUpCount < 2 && (
        <div className="follow-up-section">
          <h3>Have a follow-up question?</h3>
          <p className="follow-up-count">
            You can ask {2 - answerCard.followUpCount} more follow-up question{2 - answerCard.followUpCount !== 1 ? 's' : ''}
          </p>

          <textarea
            className="follow-up-input"
            placeholder="Ask a follow-up question related to this answer..."
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            maxLength={500}
          />

          <button 
            className="submit-follow-up-btn"
            onClick={submitFollowUp}
            disabled={followUpLoading || !followUpText.trim()}
          >
            {followUpLoading ? 'Submitting...' : 'Submit Follow-up Question'}
          </button>

          {followUpSubmitted && (
            <div className="success-message">
              ✓ Follow-up submitted! Redirecting to new question...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnswerCard;
