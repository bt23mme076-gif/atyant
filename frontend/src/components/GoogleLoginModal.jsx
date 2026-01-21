import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './AuthForm.css';

const GoogleLoginModal = ({ onSuccess, onError, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-popup auth-modal-topright">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h3 style={{marginBottom: 8, fontWeight: 600}}>Sign in to Atyant with Google</h3>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          width="300"
          size="large"
        />
      </div>
    </div>
  );
};

export default GoogleLoginModal;
