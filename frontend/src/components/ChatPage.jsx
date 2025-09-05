// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import './ChatPage.css';

// Use environment variable for socket URL, fallback to backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const socket = io(API_URL);

const ChatPage = () => {
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Use the API URL from the environment variable

  // 1. Set up the current user once
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser({ id: decoded.userId, role: decoded.role });
      socket.emit('join_user_room', decoded.userId); // Always join room
    }
  }, []);

  // 2. Set up the socket listener for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      // Only add the message if it's part of the conversation you're currently looking at
      if (selectedContact && (newMessage.senderId === selectedContact._id)) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on('receive_private_message', handleReceiveMessage);

    // Cleanup: remove the listener when the component is no longer on screen
    return () => {
      socket.off('receive_private_message', handleReceiveMessage);
    };
  }, [selectedContact]); // IMPORTANT: This hook depends on 'selectedContact'

  // 3. Fetch the contact list when the user is set
  useEffect(() => {
    if (!currentUser) return;

    // When mentor logs in, fetch users they have chatted with
    const fetchContacts = async () => {
      let url = '';
      if (currentUser.role === 'user') {
        url = `${API_URL}/api/mentors`;
      } else if (currentUser.role === 'mentor') {
        url = `${API_URL}/api/conversations/mentor/${currentUser.id}`;
      }
      if (url) {
        const response = await fetch(url);
        const data = await response.json();
        // Debug: log contacts
        console.log('Fetched contacts:', data);
        setContactList(data);
      }
    };
    fetchContacts();

    // Check if a mentor was passed from the previous page
    if (location.state?.selectedMentor) {
      handleSelectContact(location.state.selectedMentor);
    }

  }, [currentUser]);

  // Helper function to fetch messages for a selected chat
  const handleSelectContact = async (contact) => {
    if (!contact || !contact._id) {
      alert('Invalid contact selected!');
      return;
    }
    setSelectedContact(contact);

    // Fetch messages for this conversation
    try {
      const response = await fetch(`${API_URL}/api/messages/${currentUser.id}/${contact._id}`);
      setMessages(await response.json());
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Function to send a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedContact && currentUser) {
      if (!selectedContact._id) {
        alert('No receiver selected!');
        return;
      }
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedContact._id,
        message: newMessage
      };
      socket.emit('sendMessage', messageData); // aligned with backend
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');
    }
  };
  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-page">
      <div className="sidebar">
        <h3>{currentUser?.role === 'user' ? 'Mentors' : 'My Chats'}</h3>
        <ul>
          {contactList.map((contact) => (
            <li key={contact._id} onClick={() => handleSelectContact(contact)}>
              {contact.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-window">
        <div className="messages-area">
          {selectedContact ? (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}>
                <p>{msg.message}</p>
              </div>
            ))
          ) : (
            <div className="no-chat-selected">
              Select a {currentUser?.role === 'user' ? 'mentor' : 'user'} to start chatting.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {selectedContact && (
          <form onSubmit={handleSendMessage} className="message-form">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." />
            <button type="submit">Send</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
