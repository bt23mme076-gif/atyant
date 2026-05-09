import React, { useState, useEffect } from 'react';

const messages = ["Collaboration", "Feedback", "Help", "Connect us"];

const FloatingWhatsAppPopup = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initial delay before showing popup
    const initialDelay = setTimeout(() => {
      setVisible(true);
    }, 1500);

    // Cycle through messages every 3.5 seconds
    const interval = setInterval(() => {
      setVisible(false); // trigger fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true); // trigger fade in
      }, 500); // Wait 500ms for fade out
    }, 3500);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '26px',
        right: '95px', // Next to the WhatsApp icon
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '10px 18px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(37, 211, 102, 0.1)',
        color: '#ffffff',
        zIndex: 994448, // Just below the widget's button z-index
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.92)',
        transition: 'opacity 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'none', // Don't block underlying clicks
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {/* Online pulsing dot */}
      <div style={{ position: 'relative', width: '8px', height: '8px' }}>
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backgroundColor: '#25D366', borderRadius: '50%',
          animation: 'ping-whatsapp 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          opacity: 0.75
        }} />
        <div style={{
          position: 'relative', width: '8px', height: '8px',
          backgroundColor: '#25D366', borderRadius: '50%',
          boxShadow: '0 0 6px rgba(37, 211, 102, 0.8)'
        }} />
      </div>

      <span style={{ 
        fontSize: '14px', 
        fontWeight: '500', 
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
        textShadow: '0 2px 4px rgba(0,0,0,0.4)',
        fontFamily: "'Inter', 'Outfit', sans-serif"
      }}>
        {messages[index]}
      </span>

      {/* Styled right pointer */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '-7px',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderLeft: '7px solid rgba(15, 23, 42, 0.98)',
        }}
      />
      
      {/* Ping animation styles */}
      <style>{`
        @keyframes ping-whatsapp {
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingWhatsAppPopup;
