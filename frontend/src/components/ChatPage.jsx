// src/components/CPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext'; // THIS IMPORT WAS MISSING
import { jwtDecode } from 'jwt-decode';
import './ChatPage.css';

// Use environment variable for socket URL, fallback to backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ChatPage = () => {
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from our custom hook

  // Initialize socket connection
  const [socket, setSocket] = useState(null);

  // 1. Set up the current user and socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = { 
          id: decoded.userId || decoded.id, 
          role: decoded.role 
        };
        setCurrentUser(userData);
        
        // Initialize socket connection
        const newSocket = io(API_URL, {
  auth: {
    token: token
  },
  transports: ['websocket', 'polling'] // Ensure this matches backend
});
        
        newSocket.on('connect', () => {
          console.log('Connected to server with ID:', newSocket.id);
          setSocketStatus('connected');
          // Join user's room after connection is established
          newSocket.emit('join_user_room', userData.id);
          console.log(`Joined room: ${userData.id}`);
        });
        
        newSocket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          setSocketStatus('disconnected');
        });
        
        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setError('Failed to connect to chat server');
          setSocketStatus('error');
        });
        
        newSocket.on('reconnect', (attemptNumber) => {
          console.log('Reconnected to server. Attempt:', attemptNumber);
          setSocketStatus('connected');
          // Rejoin user room after reconnection
          if (currentUser && currentUser.id) {
            newSocket.emit('join_user_room', currentUser.id);
          }
        });
        
        newSocket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
          setSocketStatus('error');
        });
        
        newSocket.on('reconnect_failed', () => {
          console.error('Reconnection failed');
          setSocketStatus('error');
          setError('Failed to reconnect to chat server. Please refresh the page.');
        });
        
        setSocket(newSocket);
        
        // Cleanup on component unmount
        return () => {
          if (newSocket) {
            newSocket.disconnect();
          }
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Authentication error');
      }
    } else {
      setError('No authentication token found');
      navigate('/login');
    }
  }, [navigate]);

  // 2. Set up the socket listener for incoming messages - CRITICAL FIX
useEffect(() => {
  if (!socket) return;

  const handleReceiveMessage = (newMessage) => {
    // Only add if message is for the currently selected chat
    if (
      selectedContact &&
      (
        (newMessage.sender === currentUser?.id && newMessage.receiver === selectedContact._id) ||
        (newMessage.receiver === currentUser?.id && newMessage.sender === selectedContact._id)
      )
    ) {
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(msg =>
          msg._id === newMessage._id
        );
        if (!isDuplicate) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    }
  };

  socket.on('receive_private_message', handleReceiveMessage);
  socket.on('new_message', handleReceiveMessage);

  return () => {
    socket.off('receive_private_message', handleReceiveMessage);
    socket.off('new_message', handleReceiveMessage);
  };
}, [socket, currentUser, selectedContact]); // Removed selectedContact dependency to receive all messages

  // 3. Fetch the contact list when the user is set
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);
        let url = '';
        if (currentUser.role === 'user') {
          url = `${API_URL}/api/mentors`;
        } else if (currentUser.role === 'mentor') {
          url = `${API_URL}/api/conversations/mentor/${currentUser.id}`;
        }
        
        if (url) {
          const token = localStorage.getItem('token');
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Fetched contacts:', data);
          setContactList(data);
          
          // Check if a mentor was passed from the previous page
          if (location.state?.selectedMentor) {
            handleSelectContact(location.state.selectedMentor);
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser, location.state]);

  // Helper function to fetch messages for a selected chat
  const handleSelectContact = async (contact) => {
    if (!contact || !contact._id) {
      setError('Invalid contact selected!');
      return;
    }
    
    try {
      setSelectedContact(contact);
      setMessages([]);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/messages/${currentUser.id}/${contact._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const messageData = await response.json();
      setMessages(messageData);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setError('Failed to load messages');
    }
  };

  // Function to send a message - ENHANCED
const handleSendMessage = async (e) => {
  e.preventDefault();

  if (!newMessage.trim()) {
    setError("Message cannot be empty");
    return;
  }

  if (!selectedContact || !selectedContact._id) {
    setError("No contact selected!");
    return;
  }

  if (!socket || !currentUser || socketStatus !== "connected") {
    setError(
      "Not connected to chat. Please check your connection and try again."
    );
    return;
  }

  try {
    const messageData = {
      sender: currentUser.id,
      receiver: selectedContact._id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Sending message:", messageData);

    // Emit the message
    socket.emit("private_message", messageData);

    // Do NOT optimistically add the message here!
    setNewMessage("");
    setError("");
  } catch (error) {
    console.error("Error sending message:", error);
    setError("Failed to send message. Please try again.");
  }
};
  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rejoin room if socket reconnects or user changes
  useEffect(() => {
    if (socket && socketStatus === 'connected' && currentUser) {
      socket.emit('join_user_room', currentUser.id);
      console.log(`Rejoined room: ${currentUser.id}`);
    }
  }, [socket, socketStatus, currentUser]);

  if (error && !loading) {
    return (
      <div className="chat-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={() => navigate('/mentors')}>Back to Mentors</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading chats...</div>;
  }

  return (
    <div className="chat-page">
      <div className="sidebar">
        <h3>{currentUser?.role === 'user' ? 'Mentors' : 'My Chats'}</h3>
        <div className="connection-status">
          Status: <span className={socketStatus}>{socketStatus}</span>
        </div>
        {contactList.length === 0 ? (
          <p className="no-contacts">No contacts available</p>
        ) : (
          <ul>
            {contactList.map((contact) => (
              <li 
                key={contact._id} 
                onClick={() => handleSelectContact(contact)}
                className={selectedContact?._id === contact._id ? 'selected' : ''}
              >
                <div className="contact-name">{contact.username || contact.name}</div>
                <div className="contact-role">{contact.role}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="chat-window">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <h4>Chat with {selectedContact.username || selectedContact.name}</h4>
              <div className="connection-info">
                <small>User ID: {currentUser?.id} | Status: {socketStatus}</small>
              </div>
            </div>
            
            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="no-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.sender === currentUser.id || msg.senderId === currentUser.id ? 'sent' : 'received'}`}
                  >
                    <p>{msg.text || msg.message}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString()}
                    </span>
                    <span className="message-status">
                      {msg.sender === currentUser.id || msg.senderId === currentUser.id ? 'Sent' : 'Received'}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="message-form">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type your message..." 
                disabled={!selectedContact || socketStatus !== 'connected'}
              />
              <button 
                type="submit" 
                disabled={!selectedContact || !newMessage.trim() || socketStatus !== 'connected'}
                className={socketStatus !== 'connected' ? 'disabled' : ''}
              >
                {socketStatus === 'connected' ? 'Send' : 'Connecting...'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h4>Select a {currentUser?.role === 'user' ? 'mentor' : 'user'} to start chatting</h4>
            <div className="connection-info">
              <p>Socket status: <span className={socketStatus}>{socketStatus}</span></p>
              <p>Your ID: {currentUser?.id}</p>
              <p>Your role: {currentUser?.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;