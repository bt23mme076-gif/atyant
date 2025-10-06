import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import './ChatPage.css';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatWhen = (t) => {
  const d = new Date(t || Date.now());
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'Just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const ProToast = ({ avatarUrl, title, preview, when, onOpen, onClose }) => (
  <div className="protoast">
    <img
      className="protoast-avatar"
      src={avatarUrl}
      alt={title}
      onError={e => {
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=4f46e5&color=fff&size=44`;
      }}
    />
    <div className="protoast-body">
      <div className="protoast-title">{title}</div>
      <div className="protoast-preview">{preview}</div>
      <div className="protoast-meta">{when}</div>
    </div>
    <div className="protoast-actions">
      <button className="protoast-btn primary" onClick={onOpen}>Open</button>
      <button className="protoast-btn" onClick={onClose}>Dismiss</button>
    </div>
  </div>
);

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
  const { user } = useAuth();
  const authCtx = useContext(AuthContext) || {};
  const ctxUser = authCtx?.user || {};

  const [highlightedContactId, setHighlightedContactId] = useState(null);
  const [socket, setSocket] = useState(null);

  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const [credits, setCredits] = useState(null);

  const isMobile = window.innerWidth <= 768;
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(isMobile && !selectedContact);

  const activeToastsRef = useRef(new Map());
  
  // Only one instance!
  const [unreadMap, setUnreadMap] = useState({}); // { contactId: Set<msgId> }

  // Menu state (for 3-dot message actions)
  const [openMenuMsgId, setOpenMenuMsgId] = useState(null);
  const handleMenuOpen = (msgId) => setOpenMenuMsgId(msgId);
  const handleMenuClose = () => setOpenMenuMsgId(null);

  const handleDeleteMessage = async (msgId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Delete failed!');
      setMessages(msgs => msgs.filter(m => m._id !== msgId));
      toast.success('Deleted!');
    } catch (err) {
      toast.error('Delete failed!');
    }
    handleMenuClose(); // Hide menu after delete
  };

  // Reset unread set when thread opens
  const handleSelectContact = async (contact, extraMessage = null) => {
    if (!contact || !contact._id) {
      setError('Invalid contact selected!');
      return;
    }
    setUnreadMap(prev => ({ ...prev, [contact._id]: new Set() })); // reset Set
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
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);
      let messageData = await response.json();
      if (extraMessage) {
        const exists = messageData.some(msg => msg._id === extraMessage._id);
        if (!exists) messageData = [...messageData, extraMessage];
      }
      setMessages(messageData);
      if (messageData.length < limit) setAllMessagesLoaded(true);
    } catch {
      setError('Failed to load messages');
    }
  };

  const showMessageToast = useMemo(() => {
    return ({ partnerId, partnerName, avatar, preview, ts, messageData }) => {
      if (!partnerId) return;
      const id = activeToastsRef.current.get(partnerId) || `msg-${partnerId}`;
      const content = ({ closeToast }) => (
        <ProToast
          avatarUrl={
            avatar && avatar.startsWith('http')
              ? avatar
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName || 'User')}&background=4f46e5&color=fff&size=44`
          }
          title={`New message from ${partnerName || 'contact'}`}
          preview={preview || ''}
          when={formatWhen(ts)}
          onOpen={() => {
            const c = contactList.find(x => x._id === partnerId);
            if (c) {
              handleSelectContact(c, messageData);
            }
            closeToast();
          }}
          onClose={() => closeToast()}
        />
      );
      const opts = {
        toastId: id,
        icon: false,
        autoClose: 4000,
        pauseOnHover: true,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: false,
        theme: 'light',
        closeButton: false,
        onClose: () => activeToastsRef.current.delete(partnerId),
      };
      if (activeToastsRef.current.has(partnerId)) {
        toast.update(id, { render: content, ...opts });
      } else {
        activeToastsRef.current.set(partnerId, id);
        toast(content, opts);
      }
    };
  }, [contactList]);

  useEffect(() => {
    if (isMobile && !selectedContact) setShowSidebarOnMobile(true);
    if (isMobile && selectedContact) setShowSidebarOnMobile(false);
  }, [selectedContact]);

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
          if (userData && userData.id) newSocket.emit('join_user_room', userData.id);
        });
        newSocket.on('reconnect_error', () => setSocketStatus('error'));
        newSocket.on('reconnect_failed', () => {
          setSocketStatus('error');
          setError('Failed to reconnect to chat server. Please refresh the page.');
        });

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
    if (!socket || !selectedContact || !currentUser) return;
    const unreadMsgIds = messages
      .filter(msg => (String(msg.receiver?._id || msg.receiver) === String(currentUser.id)) && !msg.seen)
      .map(msg => msg._id);
    if (unreadMsgIds.length) {
      unreadMsgIds.forEach(messageId => {
        const message = messages.find(msg => msg._id === messageId);
        if (message && !message.seen) {
          socket.emit('message_read', {
            messageId,
            sender: selectedContact._id,
            receiver: currentUser.id,
          });
        }
      });
    }
  }, [messages, selectedContact, socket, currentUser]);

  useEffect(() => {
    if (!socket) return;
    const handler = (statusUpdate) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === statusUpdate.messageId && statusUpdate.status === 'seen'
            ? { ...msg, seen: true }
            : msg
        )
      );
    };
    socket.on('message_status', handler);
    return () => socket.off('message_status', handler);
  }, [socket]);

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
  }, [user, messages]);

  useEffect(() => {
    if (!socket || !currentUser) return;
    const handleReceiveMessage = (newMessage) => {
      const chatPartnerId = newMessage.sender === currentUser?.id ? newMessage.receiver : newMessage.sender;
      if (
        selectedContact &&
        (
          (newMessage.sender === currentUser?.id && newMessage.receiver === selectedContact._id) ||
          (newMessage.receiver === currentUser?.id && newMessage.sender === selectedContact._id)
        )
      ) {
        setMessages(prevMessages => {
          const isDuplicate = prevMessages.some(msg => msg._id === newMessage._id);
          return isDuplicate ? prevMessages : [...prevMessages, newMessage];
        });
      } else {
        setUnreadMap(prev => {
          const prevSet = prev[chatPartnerId] || new Set();
          if (prevSet.has(newMessage._id)) return prev;
          const nextSet = new Set(prevSet);
          nextSet.add(newMessage._id);
          return { ...prev, [chatPartnerId]: nextSet };
        });
      }
      // ...move to top, UI update logic
      const chatPartnerName = newMessage.sender === currentUser?.id
        ? newMessage.receiverName || newMessage.receiver
        : newMessage.senderName || newMessage.sender;
      const isOwnMsg = newMessage.sender === currentUser?.id;
      setContactList(prev => {
        const idx = prev.findIndex(c => c._id === chatPartnerId);
        if (idx === -1) return prev;
        const updated = { ...prev[idx] };
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
      setHighlightedContactId(chatPartnerId);
      setTimeout(() => setHighlightedContactId(null), 2000);
      if (!isOwnMsg) {
        showMessageToast({
          partnerId: chatPartnerId,
          partnerName: chatPartnerName,
          avatar: newMessage.senderAvatar || newMessage.receiverAvatar,
          preview: newMessage.text || newMessage.message,
          ts: newMessage.timestamp || newMessage.createdAt || Date.now(),
          messageData: newMessage
        });
      }
    };

    const handleNotification = (notif) => {
      setContactList(prev => {
        const idx = prev.findIndex(c => c._id === notif.from);
        if (idx === -1) return prev;
        const updated = { ...prev[idx] };
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
      setHighlightedContactId(notif.from);
      setTimeout(() => setHighlightedContactId(null), 2000);

      setUnreadMap(prev => {
        const prevSet = prev[notif.from] || new Set();
        if (prevSet.has(notif._id)) return prev;
        const nextSet = new Set(prevSet);
        nextSet.add(notif._id);
        return { ...prev, [notif.from]: nextSet };
      });

      showMessageToast({
        partnerId: notif.from,
        partnerName: notif.fromName,
        avatar: notif.fromAvatar,
        preview: notif.message,
        ts: notif.timestamp || Date.now(),
        messageData: notif
      });
    };

    socket.on('receive_private_message', handleReceiveMessage);
    socket.on('new_message', handleReceiveMessage);
    socket.on('chat_notification', handleNotification);

    const creditsHandler = (data) => {
      toast.error(data.message || "You are out of credits. Please purchase more.");
    };
    socket.on('insufficient_credits', creditsHandler);

    return () => {
      socket.off('receive_private_message', handleReceiveMessage);
      socket.off('new_message', handleReceiveMessage);
      socket.off('chat_notification', handleNotification);
      socket.off('insufficient_credits', creditsHandler);
    };
  }, [socket, currentUser, selectedContact, showMessageToast]);

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
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
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

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` },
      });
      if (!orderResponse.ok) {
        const t = await orderResponse.text();
        throw new Error(`Create order failed: ${orderResponse.status} ${t}`);
      }
      const order = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Atyant",
        description: "Mentor Chat Credits",
        order_id: order.id,
        handler: async function (response) {
          const verificationResponse = await fetch(`${API_URL}/api/payment/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` },
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
      <ToastContainer
        position="top-right"
        autoClose={4000}
        limit={3}
        newestOnTop
        pauseOnHover
        transition={Slide}
        style={{ zIndex: 9999 }}
      />
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
                  <div className="contact-name" style={{ position: "relative" }}>
                    {contact.username || contact.name}
                    {
                      unreadMap[contact._id] && unreadMap[contact._id].size > 0 && (
                        <span className="unread-badge">{unreadMap[contact._id].size}</span>
                      )
                    }
                  </div>
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
            <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Link
                to={`/profile/${selectedContact.username}`}
                className="chat-header-info"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <img
                  src={
                    selectedContact.profilePicture
                    || `https://api.pravatar.cc/150?u=${selectedContact.username || selectedContact._id}`
                  }
                  alt={selectedContact.username}
                  className="chat-header-avatar"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
                />
                <h4 style={{ margin: 0, color: '#222', fontWeight: 600 }}>
                  {selectedContact.username}
                </h4>
              </Link>
              <div className="chat-header-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status-indicator status-online`}></span>
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#4f46e5' }}>Online</span>
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
              {messages.length > 0 && messages.map((msg, index) => {
                const senderId = String(msg.sender?._id || msg.senderId || msg.sender);
                const isMine = senderId === String(currentUser.id);
                const messageId = msg._id;
                return (
                  <div key={index} className={`message ${isMine ? 'sent' : 'received'}`}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <p style={{ margin: 0, flex: 1 }}>{msg.text || msg.message}</p>
                      {isMine && messageId && (
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              cursor: "pointer",
                              fontSize: "20px",
                              marginLeft: "10px",
                              color: "#999"
                            }}
                            onClick={() =>
                              openMenuMsgId === messageId
                                ? handleMenuClose()
                                : handleMenuOpen(messageId)
                            }
                          >&#8230;</span>
                          {openMenuMsgId === messageId && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 24,
                                background: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px #0002",
                                zIndex: 99,
                                minWidth: "100px"
                              }}
                              onMouseLeave={handleMenuClose}
                            >
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(messageId)}
                                style={{
                                  width: "100%",
                                  padding: "7px 13px",
                                  color: "#e11d48",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  fontWeight: 500,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="message-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 4 }}>
                      <span className="message-time">
                        {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                      <span className="message-status">
                        {isMine ? (msg.seen ? 'Seen' : 'Sent') : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
              {loadingMoreMessages && <div>Loading more messages...</div>}
              <div ref={messagesEndRef} />
            </div>
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
