import React, { useState, useEffect, useRef, useContext, memo } from 'react';
import { AuthContext } from '../AuthContext';
import { Send, Users, Smile, X, UserX } from 'lucide-react';
import './CommunityChat.css';
import UserAvatar from './UserAvatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CommunityChat = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isFetchingRef = useRef(false);
  const isOnlineCheckRef = useRef(false);
  const mountedRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isNearBottom = () => {
    const messagesList = messagesEndRef.current?.parentElement;
    if (!messagesList) return true;
    
    const threshold = 150;
    const position = messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight;
    return position < threshold;
  };

  // Only auto-scroll if user is near the bottom
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  // Fetch messages
  const fetchMessages = async () => {
    // Prevent duplicate simultaneous calls
    if (isFetchingRef.current || !mountedRef.current) return;
    
    isFetchingRef.current = true;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      const response = await fetch(`${API_URL}/api/community-chat/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok && mountedRef.current) {
        const data = await response.json();
        setMessages(data);
      } else if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to fetch messages:', error);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }
  };

  // Fetch online users
  const fetchOnlineUsers = async () => {
    // Prevent duplicate simultaneous calls
    if (isOnlineCheckRef.current || !mountedRef.current) return;
    
    isOnlineCheckRef.current = true;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      const response = await fetch(`${API_URL}/api/community-chat/online-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok && mountedRef.current) {
        const data = await response.json();
        setOnlineUsers(data);
      } else if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to fetch online users:', error);
      }
    } catch (error) {
      console.error('❌ Error fetching online users:', error);
    } finally {
      if (mountedRef.current) {
        isOnlineCheckRef.current = false;
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchMessages();
    fetchOnlineUsers();

    // Poll for new messages every 10 seconds (reduced frequency)
    const messageInterval = setInterval(() => {
      if (mountedRef.current) {
        fetchMessages();
      }
    }, 10000);
    
    // Poll for online users every 60 seconds (reduced frequency)
    const usersInterval = setInterval(() => {
      if (mountedRef.current) {
        fetchOnlineUsers();
      }
    }, 60000);

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      clearInterval(messageInterval);
      clearInterval(usersInterval);
      isFetchingRef.current = false;
      isOnlineCheckRef.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        alert('Please login to send messages');
        setNewMessage(messageText); // Restore message on error
        return;
      }

      const response = await fetch(`${API_URL}/api/community-chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: messageText, 
          isAnonymous: isAnonymous 
        })
      });

      if (response.ok && mountedRef.current) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        inputRef.current?.focus();
        // Always scroll to bottom when user sends a message
        setTimeout(() => scrollToBottom(), 100);
      } else {
        const error = await response.json();
        console.error('❌ Failed to send message:', error);
        alert(error.error || 'Failed to send message');
        setNewMessage(messageText); // Restore message on error
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message on error
    } finally {
      if (mountedRef.current) {
        setSending(false);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="community-chat-modal" onClick={onClose}>
      <div className="community-chat-container" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="community-chat-loading">
            <div className="spinner"></div>
            <p>Loading chat...</p>
          </div>
        ) : (
          <>
            <div className="community-chat-header">
              <div className="header-left">
                <h1>Community Chat</h1>
                <p className="online-count">
                  <Users size={16} />
                  {onlineUsers.length} online
                </p>
              </div>
              <div className="header-right">
                <button 
                  className={`anonymous-toggle ${isAnonymous ? 'active' : ''}`}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  title={isAnonymous ? "Switch to public mode" : "Switch to anonymous mode"}
                >
                  <UserX size={20} />
                  {isAnonymous ? 'Anonymous Mode' : 'Public Mode'}
                </button>
                <button className="close-button" onClick={onClose}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="community-chat-content">
              {/* Messages Area */}
              <div className="messages-section">
                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <Smile size={48} />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`message-item ${msg.sender?._id === user?._id ? 'own-message' : ''} ${msg.isAnonymous ? 'anonymous-message' : ''}`}
                      >
                        <div className="message-avatar">
                          {msg.isAnonymous ? (
                            <div className="anonymous-avatar">
                              <UserX size={20} />
                            </div>
                          ) : (
                            <UserAvatar 
                              user={msg.sender} 
                              size={36}
                            />
                          )}
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="sender-name">
                              {msg.isAnonymous ? 'Anonymous' : (msg.sender?.name || msg.sender?.username || 'Unknown User')}
                            </span>
                            <span className="message-time">{formatTime(msg.createdAt)}</span>
                          </div>
                          <div className="message-text">{msg.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form className="message-input-form" onSubmit={sendMessage}>
                  {isAnonymous && (
                    <div className="anonymous-indicator">
                      <UserX size={14} />
                      <span>Anonymous mode</span>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isAnonymous ? "Send anonymous message..." : "Type your message..."}
                    maxLength={1000}
                    disabled={sending}
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim() || sending}
                    className="send-button"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>

              {/* Online Users Sidebar */}
              <div className="online-users-sidebar">
                <h3>Online Users ({onlineUsers.length})</h3>
                <div className="online-users-list">
                  {onlineUsers.map((onlineUser) => (
                    <div key={onlineUser._id} className="online-user-item">
                      <UserAvatar user={onlineUser} size={32} />
                      <div className="online-user-info">
                        <span className="online-user-name">
                          {onlineUser.name || onlineUser.username}
                        </span>
                        {onlineUser.role === 'mentor' && (
                          <span className="mentor-badge">Mentor</span>
                        )}
                      </div>
                      <div className="online-indicator"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(CommunityChat);
