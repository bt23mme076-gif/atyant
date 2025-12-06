// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';
import './AuthForm.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false); // ✅ ADD THIS LINE
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login response:', response.data);

      // ✅ Use context login function
      login(response.data.user, response.data.token);

      toast.success(`Welcome back, ${response.data.user.name}! 🎉`);

      // Redirect
      const from = location.state?.from || '/';
      navigate(from);

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage('');
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to Your Account</h2>
        <div className="form-group">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        </div>
        
        <div className="form-group password-group">
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <button 
            type="button" 
            className="password-toggle-btn" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        
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