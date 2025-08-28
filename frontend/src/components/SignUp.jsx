// frontend/src/components/Signup.jsx
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
      const response = await fetch('http://localhost:3000/api/auth/signup', {
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
          navigate('/'); // Yahan par change kiya hai
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
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
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