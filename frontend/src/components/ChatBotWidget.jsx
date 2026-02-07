import React, { useState, useEffect } from 'react';
import AIChat from './AIChat'; // ✅ Import AIChat component
import './ChatBotWidget.css';

const ChatBotWidget = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false); // ✅ State to control AIChat

  // Preview messages
  const previewMessages = [
    "👋 Hi! Need help finding a mentor?",
    "💡 Ask any career question!",
    "🚀 Connect with experts now!",
    "📚 Get personalized guidance",
    "✨ Start your journey today!"
  ];

  // Show first preview after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreview(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Cycle through messages and auto-hide
  useEffect(() => {
    if (showPreview) {
      // Hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setShowPreview(false);
      }, 4000);

      return () => clearTimeout(hideTimer);
    } else {
      // Show next message after 10 seconds
      const showTimer = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % previewMessages.length);
        setShowPreview(true);
      }, 10000);

      return () => clearTimeout(showTimer);
    }
  }, [showPreview]);

  // ✅ NEW: Open AIChat component when button is clicked
  const handleChatClick = (e) => {
    e.stopPropagation();
    setIsChatOpen(true);
    setShowPreview(false); // Hide preview when chat opens
  };

  // ✅ NEW: Close AIChat component
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleClosePreview = (e) => {
    e.stopPropagation();
    setShowPreview(false);
  };

  return (
    <>
      <div className="chatbot-widget-container">
        {/* ✅ Animated Message Preview */}
        {showPreview && !isChatOpen && (
          <div className="chatbot-preview-bubble">
            <button 
              className="preview-close-btn"
              onClick={handleClosePreview}
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="preview-content">
              <div className="preview-avatar">
                <span>🤖</span>
              </div>
              <div className="preview-text">
                {previewMessages[currentMessageIndex]}
              </div>
            </div>
            <div className="preview-arrow"></div>
          </div>
        )}

        {/* ✅ Chat Button - Opens AIChat */}
        <button 
          className={`chatbot-button ${showPreview ? 'has-notification' : ''}`}
          onClick={handleChatClick}
          aria-label="Open chat"
        >
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" 
              fill="white"
            />
            <path 
              d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" 
              fill="white"
            />
          </svg>
          
          {/* Notification dot when preview is showing */}
          {showPreview && <span className="notification-dot"></span>}
        </button>
      </div>

      {/* ✅ Render AIChat component when open */}
      {isChatOpen && <AIChat onClose={handleCloseChat} />}
    </>
  );
};

export default ChatBotWidget;