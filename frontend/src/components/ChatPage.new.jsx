import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ChatPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

const ChatPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Socket initialization
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(API_URL, {
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('connect', () => {
      setSocketStatus('connected');
      toast.success('Connected to chat');
    });

    newSocket.on('disconnect', () => {
      setSocketStatus('disconnected');
      toast.warning('Lost connection, trying to reconnect...');
    });

    newSocket.on('connect_error', () => {
      setSocketStatus('error');
      toast.error('Connection failed');
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/recent-chats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load contacts');
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError('Could not load your conversations');
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchContacts();
  }, [user]);

  // Handle receiving messages
  useEffect(() => {
    if (!socket || !selectedContact) return;

    const handleNewMessage = (data) => {
      setMessages(prev => [...prev, data]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    socket.on('receive_private_message', handleNewMessage);
    return () => socket.off('receive_private_message', handleNewMessage);
  }, [socket, selectedContact]);

  // Load chat messages when selecting contact
  const handleSelectContact = async (contact) => {
    try {
      setSelectedContact(contact);
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/${contact._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedContact || !socket) return;

    const messageData = {
      receiver: selectedContact._id,
      text: message.trim(),
      timestamp: new Date().toISOString()
    };

    socket.emit('private_message', messageData, (response) => {
      if (response?.error) {
        toast.error(response.error);
      }
    });

    setMessage('');
  };

  if (loading) {
    return (
      <div className="loading">
        Loading your chats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="sidebar">
        <h3>Conversations</h3>
        <div className="connection-status">
          Status: <span className={socketStatus}>{socketStatus}</span>
        </div>
        
        <div className="contacts-list">
          {contacts.map(contact => (
            <div
              key={contact._id}
              className={`contact-item ${selectedContact?._id === contact._id ? 'selected' : ''}`}
              onClick={() => handleSelectContact(contact)}
            >
              <img
                src={contact.profilePicture || `https://ui-avatars.com/api/?name=${contact.username}`}
                alt={contact.username}
                className="avatar"
              />
              <div className="contact-info">
                <div className="username">{contact.username}</div>
                <div className="last-message">
                  {contact.lastMessage?.text || 'No messages yet'}
                </div>
              </div>
              {contact.unreadCount > 0 && (
                <div className="unread-count">{contact.unreadCount}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <img
                src={selectedContact.profilePicture || `https://ui-avatars.com/api/?name=${selectedContact.username}`}
                alt={selectedContact.username}
                className="avatar"
              />
              <h3>{selectedContact.username}</h3>
            </div>

            <div className="messages-container">
              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{msg.text}</div>
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                autoFocus
              />
              <button type="submit" disabled={!message.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Welcome to Chat</h3>
            <p>Select a conversation to start messaging</p>
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
        draggable={false}
        pauseOnHover
      />
    </div>
  );
};

export default ChatPage;