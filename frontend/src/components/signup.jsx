import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext"; // AuthContext import
import "./AuthForm.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, user } = useAuth(); // context se login function aur user state

  // Agar user already login hai to dashboard par redirect karo
  useEffect(() => {
    if (user) {
      if (user.role === "mentor") {
        navigate("/mentor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    }
  }, [user, navigate]);

  // ✅ Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and a number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ✅ Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const { confirmPassword, ...submitData } = formData;
      
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
  setMessage("Signup successful! Redirecting...");
       // ✅ Defensive check
  if (data.token) {
    login(data.token);
  } else {
    console.error("No token received:", data);
  } 
        
        setTimeout(() => {
    const role = data.role || (data.user && data.user.role) || "user";
            if (role === "mentor") {
            navigate("/mentor-dashboard");      
          } else {
            navigate("/student-dashboard");
          }
        }, 1500);
      } else {
        // Handle specific server-side errors
        if (response.status === 409) { // Conflict (user exists)
          setErrors({ general: "Username or email already exists." });
        } else {
          setMessage(data.message || "Signup failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // JSX for the form
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>
        {message && <p className="success-message">{message}</p>}
        {errors.general && <p className="error-message">{errors.general}</p>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className="error-text">{errors.username}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
        </div>

        <div className="form-group">
          <label>Sign up as:</label>
          <div className="role-selection">
            <label>
              <input
                type="radio"
                name="role"
                value="user"
                checked={formData.role === "user"}
                onChange={handleChange}
              />
              Student
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="mentor"
                checked={formData.role === "mentor"}
                onChange={handleChange}
              />
              Mentor
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        
        <p className="switch-auth">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
