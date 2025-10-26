import React, { useState, useEffect, useRef, useContext } from 'react';
import { Send, Bot, User, Sparkles, Trash2, X } from 'lucide-react';
import { AuthContext } from '../AuthContext'; // Import AuthContext
import './AIChat.css';

const AIChat = ({ onClose }) => {
  const { user } = useContext(AuthContext); // Get user from context
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      console.log('⚠️ User not logged in');
    }
  }, [user]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check authentication
    if (!user || !user.token) {
      alert('Please login to use AI Assistant');
      onClose();
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log('🔑 Sending request with token:', user.token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationId: conversationId
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationId(data.conversationId);

        if (data.suggestedMentors && data.suggestedMentors.length > 0) {
          setSuggestedMentors(data.suggestedMentors);
        }
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: error.message.includes('login') 
          ? 'Please login to continue using AI Assistant. 🔐'
          : 'Sorry, something went wrong. Please try again. 🙏',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear this conversation?')) {
      setMessages([]);
      setConversationId(null);
      setSuggestedMentors([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { icon: '📚', text: 'Help with studies', query: 'I need help with my studies' },
    { icon: '💼', text: 'Career advice', query: 'I need career guidance' },
    { icon: '💻', text: 'Learn coding', query: 'I want to learn programming' },
    { icon: '🎯', text: 'Find mentor', query: 'Help me find a mentor' },
  ];

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="ai-chat-modal" onClick={onClose}>
        <div className="ai-chat-container" onClick={(e) => e.stopPropagation()}>
          <div className="ai-chat-header">
            <div className="header-left">
              <Bot className="bot-icon" size={28} />
              <div>
                <h2>Atyant AI Assistant</h2>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="ai-chat-messages">
            <div className="welcome-screen">
              <Sparkles size={64} className="sparkles-icon" />
              <h3>Please Login to Continue 🔐</h3>
              <p>You need to be logged in to use the AI Assistant.</p>
              <button 
                className="login-btn"
                onClick={() => {
                  onClose();
                  window.location.href = '/login';
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chat-modal" onClick={onClose}>
      <div className="ai-chat-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="header-left">
            <Bot className="bot-icon" size={28} />
            <div>
              <h2>Atyant AI Assistant</h2>
              <p className="status-text">
                <span className="status-dot"></span>
                Always here to help
              </p>
            </div>
          </div>
          <div className="header-actions">
            {messages.length > 0 && (
              <button className="icon-btn" onClick={clearChat} title="Clear chat">
                <Trash2 size={18} />
              </button>
            )}
            <button className="icon-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <Sparkles size={64} className="sparkles-icon" />
              <h3>Hi {user.username || 'there'}! 👋</h3>
              <p>Ask me anything about academics, career, skills, or find the perfect mentor!</p>
              
              <div className="quick-questions">
                <p className="quick-label">Quick questions:</p>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="quick-btn"
                    onClick={() => setInputMessage(q.query)}
                  >
                    <span className="quick-icon">{q.icon}</span>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Bot size={18} />
                  </div>
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {suggestedMentors.length > 0 && (
                <div className="suggested-mentors-card">
                  <h4>🎯 Recommended Mentors</h4>
                  <div className="mentors-list">
                    {suggestedMentors.map(mentor => (
                      <div key={mentor._id} className="mentor-item">
                        <img 
                          src={mentor.profilePicture || '/default-avatar.png'} 
                          alt={mentor.username}
                          className="mentor-avatar"
                        />
                        <div className="mentor-info">
                          <strong>{mentor.username}</strong>
                          <p>{mentor.bio?.substring(0, 60)}...</p>
                          <div className="mentor-tags">
                            {mentor.expertise?.slice(0, 2).map((exp, i) => (
                              <span key={i} className="tag">{exp}</span>
                            ))}
                          </div>
                        </div>
                        <button 
                          className="connect-btn-small"
                          onClick={() => window.location.href = `/profile/${mentor.username}`}
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send)"
            rows={1}
            disabled={isLoading}
            maxLength={500}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            className="send-btn"
          >
            <Send size={20} />
          </button>
        </div>
        
        {inputMessage.length > 400 && (
          <div className="char-count">
            {inputMessage.length}/500
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;