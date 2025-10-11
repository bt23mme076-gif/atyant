// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>ATYANT</h3>
          <p>"Your Journey from Confused to Confident Starts Here"</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i> {/* Font Awesome icon */}
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i> {/* Font Awesome icon */}
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i> {/* Font Awesome icon */}
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i> {/* Font Awesome icon */}
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/mentors">Problem Solver</Link></li>
            <li><Link to="/Signup">Become a Mentor</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/Signup">Sign Up</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Email: atyant.in@gmail.com</p>
          <p>Phone: +91 9753324876</p>
          <p>Nagpur, Maharashtra, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ATYANT. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;