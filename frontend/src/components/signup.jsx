import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only use the API URL from the environment variable
      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        setMessage('API URL is not set. Please check your .env file.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Signup successful! Welcome!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        // Redirect to homepage after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);

      } else {
        setMessage(data.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="role-selector">
          <label>
            <input 
              type="radio" 
              name="role" 
              value="user"
              checked={formData.role === 'user'} 
              onChange={handleChange}
            /> I am a User
          </label>
          <label>
            <input 
              type="radio" 
              name="role" 
              value="mentor"
              checked={formData.role === 'mentor'} 
              onChange={handleChange}
            /> I am a Mentor
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : `Sign Up as ${formData.role}`}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default Signup;