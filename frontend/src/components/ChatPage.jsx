import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import './ChatPage.css';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Format timestamp helper
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const ChatPage = () => {
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const authCtx = useContext(AuthContext);
  const [credits, setCredits] = useState(null);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedContact) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { to: selectedContact._id });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { to: selectedContact._id });
    }, 2000);
  };

  // Enhanced send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (sending) return; // Prevent double-send
    
    const messageText = newMessage.trim();
    if (!messageText) {
      toast.warning("Please enter a message");
      return;
    }

    if (!selectedContact?._id) {
      toast.warning("Please select a contact to chat with");
      return;
    }

    if (!socket || socketStatus !== "connected") {
      toast.error("Connection lost. Trying to reconnect...");
      if (socket) socket.connect();
      return;
    }

    if (currentUser?.role === 'user' && (credits === 0 || credits < 0)) {
      toast.error("You are out of credits. Please purchase more to continue.");
      return;
    }

    setSending(true);
    try {
      // Create temporary message
      const tempId = Date.now().toString();
      const messageData = {
        _id: tempId,
        sender: currentUser.id,
        receiver: selectedContact._id,
        text: messageText,
        timestamp: new Date().toISOString(),
        pending: true
      };

      // Optimistic update
      setMessages(prev => [...prev, messageData]);
      setNewMessage("");
      
      // Stop typing indicator
      if (socket) {
        socket.emit('stop_typing', { to: selectedContact._id });
      }
      setIsTyping(false);

      // Send to server
      return new Promise((resolve) => {
        socket.emit('private_message', messageData, (response) => {
          if (response?.success) {
            // Update the temporary message with real one
            setMessages(prev => prev.map(msg => 
              msg._id === tempId 
                ? { ...msg, _id: response.messageId, pending: false } 
                : msg
            ));
            resolve(true);
          } else {
            // Remove failed message
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
            toast.error(response?.error || "Failed to send message");
            resolve(false);
          }
        });
      });
    } catch (err) {
      console.error('Send message error:', err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSendMessage();
      }
      // Escape to clear input
      if (e.key === 'Escape') {
        setNewMessage('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.addEventListener('keydown', handleKeyPress);
  }, [newMessage]);

  // Socket connection handling
  useEffect(() => {
    if (!currentUser?.id) return;

    const newSocket = io(API_URL, {
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setSocketStatus('connected');
      toast.success('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setSocketStatus('disconnected');
      toast.warning('Lost connection. Trying to reconnect...');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketStatus('error');
      toast.error('Connection error. Please refresh the page.');
    });

    // Message receipt handlers
    newSocket.on('receive_message', (data) => {
      // Play notification sound
      new Audio('/message.mp3').play().catch(() => {});
      
      if (data.sender === selectedContact?._id) {
        setMessages(prev => [...prev, data]);
      } else {
        toast.info(`New message from ${data.senderName}`);
      }
    });

    // Typing indicators
    newSocket.on('typing', ({ from }) => {
      if (selectedContact?._id === from) {
        setPartnerTyping(true);
      }
    });

    newSocket.on('stop_typing', ({ from }) => {
      if (selectedContact?._id === from) {
        setPartnerTyping(false);
      }
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [currentUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        {/* Contact list */}
        <div className="contacts-list">
          {contactList.map(contact => (
            <div 
              key={contact._id}
              className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
              onClick={() => handleSelectContact(contact)}
            >
              <img 
                src={contact.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.username)}`}
                alt={contact.username}
                className="contact-avatar"
              />
              <div className="contact-info">
                <span className="contact-name">{contact.username}</span>
                <span className="last-message">
                  {contact.lastMessage?.text || 'No messages yet'}
                </span>
              </div>
              <span className="timestamp">
                {contact.lastMessage && formatTimestamp(contact.lastMessage.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <img 
                src={selectedContact.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.username)}`}
                alt={selectedContact.username}
                className="contact-avatar"
              />
              <div className="contact-info">
                <h3>{selectedContact.username}</h3>
                {partnerTyping && (
                  <span className="typing-indicator">typing...</span>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message._id}
                  className={`message ${message.sender === currentUser?.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.text}
                    {message.pending && (
                      <span className="pending-indicator">sending...</span>
                    )}
                  </div>
                  <span className="message-time">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                className="message-input"
              />
              <button 
                type="submit" 
                className={`send-button ${sending ? 'sending' : ''}`}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Welcome to Chat</h3>
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ChatPage;