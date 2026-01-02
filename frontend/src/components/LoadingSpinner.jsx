import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-container">
          <div className="spinner-wrapper">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-logo">
              <span className="logo-text">अत्यant</span>
            </div>
          </div>
          <p className="loading-message">{message}</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="spinner-small"></div>
      <span>{message}</span>
    </div>
  );
};

export default LoadingSpinner;