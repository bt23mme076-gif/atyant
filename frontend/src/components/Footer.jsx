// src/components/Footer.jsx

import React from 'react';
import './Footer.css';

const Footer = () => {
  // Yeh automatically current saal le lega
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {currentYear} Atyant. All Rights Reserved.</p>
        <div className="footer-social-links">
          <a href="#" aria-label="LinkedIn">🔗</a>
          <a href="#" aria-label="Twitter">🐦</a>
          <a href="#" aria-label="Facebook">👤</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;