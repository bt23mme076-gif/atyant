import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EnhancedAskQuestion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  'Academic & College Life',
  'Technical Skills',
  'Career Growth',
  'Personal Development',
  'Entrepreneurship'
];

const EnhancedAskQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // STEP 1: Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    reason: ''
  });
  
  // STEP 2: Eligibility State
  const [eligibility, setEligibility] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(true);
  
  // STEP 3: Mentor Preview State
  const [mentorPreview, setMentorPreview] = useState(null);
  const [showMentorPreview, setShowMentorPreview] = useState(false);
  
  // STEP 4: Quality Check State
  const [qualityCheck, setQualityCheck] = useState(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  
  // STEP 5: Preview State
  const [showPreview, setShowPreview] = useState(false);
  
  // STEP 7: Confirmation State
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [findingMentor, setFindingMentor] = useState(false);
  const [checkingQuality, setCheckingQuality] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // STEP 2: Check Eligibility on Load
  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    
    // Load draft question from homepage if available
    const draftQuestion = localStorage.getItem('draftQuestion');
    if (draftQuestion) {
      // Auto-generate title from first 50 chars of description
      const autoTitle = draftQuestion.length > 50 
        ? draftQuestion.substring(0, 50).trim() + '...' 
        : draftQuestion.trim();
      
      setFormData(prev => ({
        ...prev,
        title: autoTitle,
        description: draftQuestion
      }));
      // Clear the draft after loading
      localStorage.removeItem('draftQuestion');
    }
    
    checkEligibility();
  }, [user]);
  
  const checkEligibility = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questions/check-eligibility`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      console.log('📊 Eligibility data received:', data);
      
      if (data.success) {
        setEligibility(data);
        console.log('✅ Credits updated in state:', data.credits);
        
        // If profile incomplete, redirect
        if (!data.isProfileComplete) {
          alert(`Please complete your profile first. Missing: ${data.missingFields.join(', ')}`);
          navigate('/profile');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Eligibility check failed:', error);
    } finally {
      setLoadingEligibility(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // STEP 3: Find Mentor Match
  const handleGetAnswer = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check credits first
    if (eligibility.credits === 0) {
      alert('You have 0 credits remaining. Please upgrade to continue.');
      // TODO: Show upgrade modal
      return;
    }
    
    setFindingMentor(true);
    
    try {
      const response = await fetch(`${API_URL}/api/questions/preview-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMentorPreview(data);
        setShowMentorPreview(true);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('❌ Mentor match failed:', error);
      alert('Failed to find mentor match. Please try again.');
    } finally {
      setFindingMentor(false);
    }
  };
  
  // STEP 4: Quality Check
  const checkQuestionQuality = async () => {
    setCheckingQuality(true);
    
    try {
      const response = await fetch(`${API_URL}/api/questions/quality-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQualityCheck(data);
        
        if (data.needsImprovement) {
          setShowQualityWarning(true);
          setShowMentorPreview(false);
        } else {
          // Good quality, show preview
          setShowPreview(true);
          setShowMentorPreview(false);
        }
      }
    } catch (error) {
      console.error('❌ Quality check failed:', error);
    } finally {
      setCheckingQuality(false);
    }
  };
  
  const handleContinueFromMentor = () => {
    setShowMentorPreview(false);
    setCurrentStep(3);
    checkQuestionQuality();
  };
  
  const handleImproveQuestion = () => {
    setShowQualityWarning(false);
    // Focus on description field
    document.getElementById('description')?.focus();
  };
  
  const handleContinueAnyway = () => {
    setShowQualityWarning(false);
    setShowPreview(true);
  };
  
  // STEP 5: Show Preview
  const handleEditFromPreview = () => {
    setShowPreview(false);
    setCurrentStep(1);
  };
  
  const handleConfirmFromPreview = () => {
    setShowPreview(false);
    setShowConfirmation(true);
    setCurrentStep(4);
  };
  
  // Payment Handler for Credits
  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          amount: 1, // 1 for 5 credits
          credits: 5
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create order failed: ${response.status} ${errorText}`);
      }
      
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Atyant",
        description: "Question Credits - 5 Credits",
        order_id: order.id,
        handler: async function (paymentResponse) {
          try {
            const verificationResponse = await fetch(`${API_URL}/api/payment/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify(paymentResponse),
            });
            
            const result = await verificationResponse.json();
            
            if (result.success) {
              console.log('✅ Payment verified:', result);
              
              toast.success(`🎉 Payment successful! ${result.creditsAdded || 5} credits added to your account.`, {
                position: "top-center",
                autoClose: 4000,
              });
              
              // Force refresh eligibility to show updated credits
              await checkEligibility();
              
              // Additional force update after a small delay
              setTimeout(() => {
                checkEligibility();
              }, 500);
            } else {
              toast.error('Payment verification failed. Please contact support.', {
                position: "top-center",
                autoClose: 5000,
              });
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: { 
          color: "#6366f1" 
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled. You can try again anytime.', {
              position: "top-center",
              autoClose: 3000,
            });
          }
        }
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while initiating payment. Please try again.', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };
  
  // STEP 8: Final Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/questions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...formData,
          qualityScore: qualityCheck?.qualityScore || 0,
          mentorId: mentorPreview?.mentor?.id || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Question submitted successfully! You will receive an answer within 24 hours.');
        navigate('/my-questions');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };
  
  if (loadingEligibility) {
    return (
      <div className="enhanced-ask-loading">
        <div className="spinner"></div>
        <p>Checking your eligibility...</p>
      </div>
    );
  }
  
  return (
    <div className="enhanced-ask-container">
      <div className="enhanced-ask-header">
        <h1>Ask Your Question</h1>
        <p>Get personalized guidance from experienced mentors</p>
        
        {/* Profile Strength Bar */}
        <div className="profile-strength-bar">
          <div className="strength-label">
            Profile Strength: <strong>{eligibility?.profileStrength || 0}%</strong>
          </div>
          <div className="strength-bar">
            <div 
              className="strength-fill" 
              style={{ width: `${eligibility?.profileStrength || 0}%` }}
            ></div>
          </div>
          {eligibility && eligibility.profileStrength < 100 && (
            <button 
              className="complete-profile-btn"
              onClick={() => navigate('/profile')}
            >
              Complete Profile
            </button>
          )}
        </div>
        
        {/* Credits Display */}
        <div className="credits-display">
          <span className="credits-icon">🎫</span>
          <span className="credits-text">
            {eligibility?.credits || 0} {eligibility?.credits === 1 ? 'Credit' : 'Credits'} Remaining
          </span>
          {eligibility?.credits === 0 ? (
            <button className="upgrade-btn" onClick={handlePayment}>
              💳 Buy 5 Credits - 1
            </button>
          ) : (
            <button className="buy-more-btn" onClick={handlePayment}>
              ➕ Buy More
            </button>
          )}
        </div>
      </div>
      
      {/* STEP 1: Question Form */}
      <div className="step-indicator">
        <div className="step-header">
          <h3>Step 1 of {totalSteps} | Ask Your Question</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(1 / totalSteps) * 100}%` }}></div>
          </div>
        </div>
        <p className="next-step-hint">Next: Meet Your Matched Mentor 🎯</p>
      </div>
      
      <form className="question-form" onSubmit={handleGetAnswer}>
        <div className="form-group">
          <label htmlFor="title">
            Question Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., How do I prepare for a Product Manager interview?"
            maxLength={200}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="char-count">{formData.title.length}/200</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">
            Detailed Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide context: What's your background? What have you tried? What specific help do you need?"
            maxLength={1000}
            rows={8}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-count">{formData.description.length}/1000</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="reason">
            Why are you asking this? (Optional)
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="e.g., I have an interview next week and want to prepare effectively"
            maxLength={500}
            rows={3}
          />
          <span className="char-count">{formData.reason.length}/500</span>
        </div>
        
        <button 
          type="submit" 
          className="get-answer-btn"
          disabled={findingMentor || eligibility?.credits === 0}
        >
          {findingMentor ? 'Finding Best Mentor...' : 'Get My Answer 🚀'}
        </button>
      </form>
      
      {/* STEP 3: Mentor Match Preview Modal */}
      {showMentorPreview && mentorPreview && (
        <div className="modal-overlay" onClick={() => setShowMentorPreview(false)}>
          <div className="mentor-preview-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowMentorPreview(false)}>×</button>
            
            {/* Step Progress */}
            <div className="step-indicator">
              <div className="step-header">
                <h3>Step 2 of {totalSteps} | Meet Your Mentor</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(2 / totalSteps) * 100}%` }}></div>
                </div>
              </div>
              <p className="next-step-hint">Next: Quality Check & Review 📝</p>
            </div>
            
            {mentorPreview.mentorFound ? (
              <>
                <h2>✨ We found the best mentor for your question!</h2>
                
                <div className="mentor-card-preview">
                  <div className="mentor-avatar">
                    {mentorPreview.mentor.profileImage ? (
                      <img src={mentorPreview.mentor.profileImage} alt="Mentor" />
                    ) : (
                      <div className="avatar-placeholder">👤</div>
                    )}
                  </div>
                  
                  <div className="mentor-info">
                    <h3>{mentorPreview.mentor.name}</h3>
                    <p className="mentor-bio">{mentorPreview.mentor.bio}</p>
                    
                    <div className="mentor-expertise">
                      {mentorPreview.mentor.expertise?.slice(0, 3).map((exp, i) => (
                        <span key={i} className="expertise-tag">{exp}</span>
                      ))}
                    </div>
                    
                    <div className="match-percentage">
                      <div className="match-circle">{mentorPreview.mentor.matchPercentage}%</div>
                      <span>Match Score</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="continue-btn"
                  onClick={handleContinueFromMentor}
                  disabled={checkingQuality}
                >
                  {checkingQuality ? 'Analyzing...' : 'Continue'}
                </button>
              </>
            ) : (
              <>
                <h2>📋 Question Received</h2>
                <p>{mentorPreview.message}</p>
                <button 
                  className="continue-btn"
                  onClick={handleContinueFromMentor}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* STEP 4: Quality Warning Modal */}
      {showQualityWarning && qualityCheck && (
        <div className="modal-overlay" onClick={() => setShowQualityWarning(false)}>
          <div className="quality-warning-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowQualityWarning(false)}>×</button>
            
            {/* Quality Check Notice */}
            <div className="quality-notice">
              <p>💡 <strong>Quick Quality Check</strong> (before Step 3)</p>
              <p className="quality-subtitle">Improve your question for better mentor guidance</p>
            </div>
            
            <div className="warning-icon">⚠️</div>
            <h2>Your question needs more details for better guidance</h2>
            
            <div className="quality-score">
              <div className="score-circle">
                {qualityCheck.qualityScore}
              </div>
              <span>Quality Score</span>
            </div>
            
            <div className="quality-issues">
              <h3>Suggestions for improvement:</h3>
              <ul>
                {qualityCheck.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
            
            <div className="warning-actions">
              <button 
                className="improve-btn"
                onClick={handleImproveQuestion}
              >
                Improve Question
              </button>
              <button 
                className="continue-anyway-btn"
                onClick={handleContinueAnyway}
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* STEP 5: Question Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowPreview(false)}>×</button>
            
            {/* Step Progress */}
            <div className="step-indicator">
              <div className="step-header">
                <h3>Step 3 of {totalSteps} | Review Your Question</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(3 / totalSteps) * 100}%` }}></div>
                </div>
              </div>
              <p className="next-step-hint">Final Step: Confirm & Submit ✅</p>
            </div>
            
            <h2>📋 Review Your Question</h2>
            
            <div className="preview-content">
              <div className="preview-item">
                <label>Title</label>
                <p>{formData.title}</p>
              </div>
              
              <div className="preview-item">
                <label>Description</label>
                <p>{formData.description}</p>
              </div>
              
              <div className="preview-item">
                <label>Category</label>
                <p>{formData.category}</p>
              </div>
              
              {formData.reason && (
                <div className="preview-item">
                  <label>Reason</label>
                  <p>{formData.reason}</p>
                </div>
              )}
              
              {mentorPreview?.mentorFound && (
                <div className="preview-item">
                  <label>Matched Mentor</label>
                  <p>
                    <strong>{mentorPreview.mentor.name}</strong>
                    <span className="match-badge">{mentorPreview.mentor.matchPercentage}% match</span>
                  </p>
                </div>
              )}
              
              {qualityCheck && (
                <div className="preview-item">
                  <label>Quality Score</label>
                  <div className="quality-badge" data-score={qualityCheck.qualityScore}>
                    {qualityCheck.qualityScore}/100
                  </div>
                </div>
              )}
            </div>
            
            <div className="preview-actions">
              <button 
                className="edit-btn"
                onClick={handleEditFromPreview}
              >
                ✏️ Edit
              </button>
              <button 
                className="confirm-btn"
                onClick={handleConfirmFromPreview}
              >
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* STEP 7: Final Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowConfirmation(false)}>×</button>
            
            {/* Step Progress */}
            <div className="step-indicator">
              <div className="step-header">
                <h3>Step 4 of {totalSteps} | Final Step | Confirm & Submit</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
              </div>
              <p className="next-step-hint final-hint">🎉 Almost done! One click away from getting your answer</p>
            </div>
            
            <h2>Are you sure you want to submit this question?</h2>
            <p className="confirmation-text">
              Our mentors will respond within <strong>24 hours</strong>.
              <br />
              This will use <strong>1 credit</strong> from your account.
            </p>
            
            <div className="credits-info">
              <div className="credit-item">
                <span>Current Credits:</span>
                <strong>{eligibility?.credits}</strong>
              </div>
              <div className="credit-item">
                <span>After Submission:</span>
                <strong>{(eligibility?.credits || 0) - 1}</strong>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowConfirmation(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleFinalSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAskQuestion;
