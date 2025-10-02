// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import './ChatPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ChatPage = () => {
  // State definitions
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
  const { user } = useAuth();
  const authCtx = useContext(AuthContext) || {};
  const ctxUser = authCtx?.user || {};

  const [highlightedContactId, setHighlightedContactId] = useState(null);
  const [socket, setSocket] = useState(null);

  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  // Credits state
  const [credits, setCredits] = useState(null);

  // Mobile sidebar state
  const isMobile = window.innerWidth <= 768;
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(isMobile && !selectedContact);

  useEffect(() => {
    if (isMobile && !selectedContact) setShowSidebarOnMobile(true);
    if (isMobile && selectedContact) setShowSidebarOnMobile(false);
  }, [selectedContact]);

  // Auth and socket initialization
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = { id: decoded.userId || decoded.id, role: decoded.role };
        setCurrentUser(userData);

        const newSocket = io(API_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
          setSocketStatus('connected');
          newSocket.emit('join_user_room', userData.id);
        });
        newSocket.on('disconnect', () => setSocketStatus('disconnected'));
        newSocket.on('connect_error', () => {
          setError('Failed to connect to chat server');
          setSocketStatus('error');
        });
        newSocket.on('reconnect', () => {
          setSocketStatus('connected');
          if (currentUser && currentUser.id) newSocket.emit('join_user_room', currentUser.id);
        });
        newSocket.on('reconnect_error', () => setSocketStatus('error'));
        newSocket.on('reconnect_failed', () => {
          setSocketStatus('error');
          setError('Failed to reconnect to chat server. Please refresh the page.');
        });

        // --- Insufficient credits notification ---
        newSocket.on('insufficient_credits', (data) => {
          toast.error(data.message || "You are out of credits. Please purchase more.");
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        setError('Authentication error');
      }
    } else {
      setError('No authentication token found');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Read/unread status
    if (!socket || !selectedContact || !currentUser) return;
    const unreadMsgIds = messages.filter(
      msg =>
        msg.receiver === currentUser.id &&
        !msg.seen
    ).map(msg => msg._id);
    if (unreadMsgIds.length) {
      unreadMsgIds.forEach(messageId => {
        const message = messages.find(msg => msg._id === messageId);
        if (!message.seen) {
          socket.emit('message_read', {
            messageId: messageId,
            sender: selectedContact._id,
            receiver: currentUser.id,
          });
        }
      });
    }
  }, [messages, selectedContact, socket, currentUser]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message_status', (statusUpdate) => {
      setMessages(prevMsgs =>
        prevMsgs.map(msg =>
          msg._id === statusUpdate.messageId && statusUpdate.status === 'seen'
            ? { ...msg, seen: true }
            : msg
        )
      );
    });
    return () => socket.off('message_status');
  }, [socket]);

  // Fetch user profile/credits
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.role === 'user') {
        const response = await fetch(`${API_URL}/api/profile/me`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (response.ok) setCredits(data.messageCredits);
      }
    };
    fetchUserProfile();
  }, [user, messages]); // refetch credits after message

  // Listen messages and notifications
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleReceiveMessage = (newMessage) => {
      if (
        selectedContact &&
        (
          (newMessage.sender === currentUser?.id && newMessage.receiver === selectedContact._id) ||
          (newMessage.receiver === currentUser?.id && newMessage.sender === selectedContact._id)
        )
      ) {
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(msg => msg._id === newMessage._id);
          if (!isDuplicate) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
      let chatPartnerId = newMessage.sender === currentUser?.id ? newMessage.receiver : newMessage.sender;
      let chatPartnerName = newMessage.sender === currentUser?.id ? newMessage.receiverName || newMessage.receiver : newMessage.senderName || newMessage.sender;
      let isOwnMsg = newMessage.sender === currentUser?.id;

      setContactList(prevContacts => {
        const idx = prevContacts.findIndex(c => c._id === chatPartnerId);
        if (idx === -1) return prevContacts;
        const updatedContact = { ...prevContacts[idx] };
        const newContacts = prevContacts.filter((_, i) => i !== idx);
        newContacts.unshift(updatedContact);
        return newContacts;
      });
      setHighlightedContactId(chatPartnerId);
      setTimeout(() => setHighlightedContactId(null), 2000);

      if (!isOwnMsg) {
        toast.info(`New message from ${chatPartnerName}: ${newMessage.text || newMessage.message}`);
      }
    };

    const handleNotification = (notif) => {
      setContactList(prevContacts => {
        const idx = prevContacts.findIndex(c => c._id === notif.from);
        if (idx === -1) return prevContacts;
        const updatedContact = { ...prevContacts[idx] };
        const newContacts = prevContacts.filter((_, i) => i !== idx);
        newContacts.unshift(updatedContact);
        return newContacts;
      });
      setHighlightedContactId(notif.from);
      setTimeout(() => setHighlightedContactId(null), 2000);
      toast.info(`New message from ${notif.fromName}: ${notif.message}`);
    };

    socket.on('receive_private_message', handleReceiveMessage);
    socket.on('new_message', handleReceiveMessage);
    socket.on('chat_notification', handleNotification);

    // credits notification for out-of-credits
    socket.on('insufficient_credits', (data) => {
      toast.error(data.message || "You are out of credits. Please purchase more.");
    });

    return () => {
      socket.off('receive_private_message', handleReceiveMessage);
      socket.off('new_message', handleReceiveMessage);
      socket.off('chat_notification', handleNotification);
      socket.off('insufficient_credits');
    };
  }, [socket, currentUser, selectedContact]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      try {
        setLoading(true);
        let url = '';
        if (currentUser.role === 'user') {
          url = `${API_URL}/api/conversations/user/${currentUser.id}`;
        } else if (currentUser.role === 'mentor') {
          url = `${API_URL}/api/conversations/mentor/${currentUser.id}`;
        }
        if (url) {
          const token = localStorage.getItem('token');
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setContactList(data);
          if (location.state?.selectedContact) {
            handleSelectContact(location.state.selectedContact);
          }
        }
      } catch {
        setError('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [currentUser, location.state]);

  const handleSelectContact = async (contact) => {
    if (!contact || !contact._id) {
      setError('Invalid contact selected!');
      return;
    }
    try {
      setSelectedContact(contact);
      setShowSidebarOnMobile(false);
      setMessages([]);
      setError('');
      setSkip(0);
      setAllMessagesLoaded(false);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/messages/${currentUser.id}/${contact._id}?skip=0&limit=${limit}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);

      const messageData = await response.json();
      setMessages(messageData);
      if (messageData.length < limit) setAllMessagesLoaded(true);
    } catch {
      setError('Failed to load messages');
    }
  };

  // --- Block sending when credits are out ---
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
      setError("Not connected to chat. Please check your connection and try again.");
      return;
    }
    // block if no credits left for user
    if (currentUser?.role === 'user' && (credits === 0 || credits < 0)) {
      toast.error("You are out of credits. Please purchase more to continue.");
      return;
    }
    try {
      const messageData = {
        sender: currentUser.id,
        receiver: selectedContact._id,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      socket.emit("private_message", messageData);
      setNewMessage("");
      setError("");
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (socket && socketStatus === 'connected' && currentUser) {
      socket.emit('join_user_room', currentUser.id);
    }
  }, [socket, socketStatus, currentUser]);

  const loadMoreMessages = async () => {
    if (loadingMoreMessages || allMessagesLoaded || !selectedContact) return;
    setLoadingMoreMessages(true);
    const newSkip = skip + limit;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/messages/${currentUser.id}/${selectedContact._id}?skip=${newSkip}&limit=${limit}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      if (!response.ok) throw new Error(`Failed to load more messages: ${response.status}`);
      const newMessages = await response.json();

      if (newMessages.length === 0) {
        setAllMessagesLoaded(true);
      } else {
        setMessages(prevMessages => [...newMessages, ...prevMessages]);
        setSkip(newSkip);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Razorpay payment handler
  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Create Order from backend
      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!orderResponse.ok) {
        const t = await orderResponse.text();
        throw new Error(`Create order failed: ${orderResponse.status} ${t}`);
      }
      const order = await orderResponse.json();

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Atyant",
        description: "Mentor Chat Credits",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on backend
          const verificationResponse = await fetch(`${API_URL}/api/payment/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          });
          const result = await verificationResponse.json();
          if (result.success) {
            toast.success("Payment successful! Credits added.");
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: ctxUser?.username || user?.username || '',
          email: ctxUser?.email || user?.email || '',
        },
        theme: { color: "#4f46e5" }
      };

      // Ensure Razorpay script is available
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
      console.error("Payment error:", error);
      toast.error("An error occurred while initiating payment.");
    }
  };

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
      <ToastContainer position="top-right" autoClose={2500} />

      {(window.innerWidth > 768 || showSidebarOnMobile) && (
        <div className={`sidebar${showSidebarOnMobile ? ' active' : ''}`}>
          <h3>{currentUser?.role === 'user' ? 'Mentors' : 'My Chats'}</h3>
          <div className="connection-status">
            Status: <span className={socketStatus}>{socketStatus}</span>
          </div>
          {currentUser && currentUser.role === 'user' && (
            <div className="credits-section">
              <p>Credits Remaining: {credits !== null ? credits : 'Loading...'}</p>
              <button onClick={handlePayment} className="buy-credits-btn">Buy More Credits</button>
            </div>
          )}
          {contactList.length === 0 ? (
            <p className="no-contacts">No contacts available</p>
          ) : (
            <ul>
              {contactList.map((contact) => (
                <li
                  key={contact._id}
                  onClick={() => handleSelectContact(contact)}
                  className={[
                    selectedContact?._id === contact._id ? 'selected' : '',
                    highlightedContactId === contact._id ? 'highlighted' : ''
                  ].join(' ').trim()}
                >
                  <div className="contact-name">{contact.username || contact.name}</div>
                  <div className="contact-role">{contact.role}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="chat-window">
        {selectedContact ? (
          <>
            <div className="chat-header">
              {/* Mobile back button */}
              {isMobile && (
                <span
                  className="back-btn"
                  onClick={() => {
                    setSelectedContact(null);
                    setShowSidebarOnMobile(true);
                  }}
                >
                  &lt;
                </span>
              )}
              <div className="chat-header-info">
                <div className="chat-header-name">
                  {selectedContact.username || selectedContact.name}
                </div>
                <div className="chat-header-status">
                  <span className={`status-indicator status-online`}></span>
                  Online
                </div>
              </div>
            </div>
            <div
              className="messages-area"
              onScroll={(e) => {
                if (e.target.scrollTop === 0) {
                  loadMoreMessages();
                }
              }}
            >
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
                      {msg.sender === currentUser.id || msg.senderId === currentUser.id
                        ? msg.seen ? 'Seen' : 'Sent'
                        : ''}
                    </span>
                  </div>
                ))
              )}

              {loadingMoreMessages && <div>Loading more messages...</div>}
              <div ref={messagesEndRef} />
            </div>
            {/* Out-of-credits overlay/disable input */}
            {currentUser?.role === 'user' && (credits === 0 || credits < 0) ? (
              <div className="limit-reached-overlay">
                <p>Your free limit is over.</p>
                <button onClick={handlePayment} className="buy-credits-btn">Buy Credits to Continue</button>
              </div>
            ) : (
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
            )}
          </>
        ) : (
          // If mobile & sidebar not shown, give a way to open sidebar (mentor list)
          isMobile && !showSidebarOnMobile ? (
            <button onClick={() => setShowSidebarOnMobile(true)}>Show Mentors</button>
          ) : (
            <div className="no-chat-selected">
              <h4>Select a {currentUser?.role === 'user' ? 'mentor' : 'user'} to start chatting</h4>
              <div className="connection-info">
                <p>Socket status: <span className={socketStatus}>{socketStatus}</span></p>
                <p>Your ID: {currentUser?.id}</p>
                <p>Your role: {currentUser?.role}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChatPage;
