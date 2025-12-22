// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';
import './AuthForm.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false); // kept as in existing code
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Same base URL for normal and Google login
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Map backend errors to friendly messages
  const mapLoginError = (err) => {
    if (err?.code === 'ERR_NETWORK') {
      return 'Cannot connect to server. Please check your internet or API URL.';
    }
    const status = err?.response?.status;
    const msg = String(err?.response?.data?.message || '').toLowerCase();

    if (status === 404 || msg.includes('user not found') || msg.includes('no user')) {
      return 'No account found for this email. Please sign up.';
    }
    if (status === 401 || msg.includes('invalid credentials') || msg.includes('incorrect password') || msg.includes('wrong password')) {
      return 'Incorrect password. Please try again.';
    }
    if (status === 400 && msg.includes('email')) {
      return 'Please enter a valid email address.';
    }
    if (status === 429 || msg.includes('too many') || msg.includes('rate limit')) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    return err?.response?.data?.message || 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      // Pass token to AuthContext
      login(response.data.token);

      toast.success('Login successful! 🎉');
      
      // Check for pending question from home page
      const pendingQuestion = localStorage.getItem('pendingQuestion');
      if (pendingQuestion) {
        localStorage.removeItem('pendingQuestion');
        // Submit the question after a short delay to ensure auth is ready
        setTimeout(async () => {
          try {
            const submitResponse = await axios.post(
              `${API_URL}/api/engine/submit-question`,
              { questionText: pendingQuestion },
              { headers: { Authorization: `Bearer ${response.data.token}` } }
            );
            if (submitResponse.data.success) {
              navigate(`/engine/${submitResponse.data.questionId}`);
              return;
            }
          } catch (err) {
            console.error('Failed to submit pending question:', err);
          }
          // Fallback to normal navigation if question submission fails
          const userRole = response.data.user?.role || 'user';
          navigate(userRole === 'mentor' ? '/dashboard' : '/');
        }, 500);
      } else {
        // Normal redirect
        const userRole = response.data.user?.role || 'user';
        navigate(userRole === 'mentor' ? '/dashboard' : '/');
      }
    } catch (error) {
      const friendly = mapLoginError(error);
      setMessage(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        toast.success('Logged in with Google!');
        
        // Check for pending question from home page
        const pendingQuestion = localStorage.getItem('pendingQuestion');
        if (pendingQuestion) {
          localStorage.removeItem('pendingQuestion');
          // Submit the question after a short delay to ensure auth is ready
          setTimeout(async () => {
            try {
              const submitResponse = await fetch(
                `${API_URL}/api/engine/submit-question`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${data.token}`
                  },
                  body: JSON.stringify({ questionText: pendingQuestion })
                }
              );
              const submitData = await submitResponse.json();
              if (submitData.success) {
                navigate(`/engine/${submitData.questionId}`);
                return;
              }
            } catch (err) {
              console.error('Failed to submit pending question:', err);
            }
            // Fallback to normal navigation if question submission fails
            const userRole = data.user?.role || 'user';
            navigate(userRole === 'mentor' ? '/dashboard' : '/');
          }, 500);
        } else {
          // Normal redirect
          const userRole = data.user?.role || 'user';
          navigate(userRole === 'mentor' ? '/dashboard' : '/');
        }
      } else {
        const msg = data?.message || 'Google login failed.';
        setMessage(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'An error occurred during Google login.';
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to Your Account</h2>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="divider">OR</div>

        <div className="google-login-button-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setMessage('Google login failed.');
              toast.error('Google login failed.');
            }}
          />
        </div>

        {message && (
          <p className={`form-message ${message.toLowerCase().includes('successful') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;