// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { GoogleLogin } from '@react-oauth/google'; // 1. Import GoogleLogin
import './AuthForm.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // This function for email/password login remains unchanged
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Login successful! Redirecting...');
        login(data.token);
        setTimeout(() => {
          if (data.role === 'mentor') navigate('/chat');
          else navigate('/');
        }, 1500);
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setMessage('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Add a new function to handle Google's response
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage('');
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: credentialResponse.credential }),
        });
        const data = await res.json();
        if (res.ok) {
            login(data.token);
            navigate('/');
        } else {
            setMessage('Google login failed.');
        }
    } catch (error) {
        setMessage('An error occurred during Google login.');
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to Your Account</h2>
        <div className="form-group">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        
        {/* 3. Add the divider and Google Login button */}
        <div className="divider">OR</div>
        <div className="google-login-button-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage('Google login failed.')}
          />
        </div>

        {message && <p className={`form-message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
        <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </form>
    </div>
  );
};
export default Login;