import React, { useState } from "react";
import { API_URL } from '../services/api.js';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./AuthForm.css";
import { Eye, EyeOff, GraduationCap, Users } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    // Role validation - most important
    if (!formData.role) {
      newErrors.role = "Please select whether you're a Student or Mentor";
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Full name is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Name must be at least 3 characters";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Phone validation - Indian mobile numbers
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = "Mobile number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear general message when user makes changes
    if (message) {
      setMessage("");
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    // Clear role error when user selects a role
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const safeParseJson = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return {};
      }
    }
    try {
      return { message: await response.text() };
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setMessage("");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const { confirmPassword, ...submitData } = formData;

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await safeParseJson(res);

      if (res.ok) {
        setMessage("Account created successfully! Redirecting...");
        
        if (data?.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem(
            "role",
            data.role || (data.user && data.user.role) || formData.role
          );
          login(data.token);

          const role = data.role || (data.user && data.user.role) || formData.role;

          // Navigate based on role
          setTimeout(() => {
            if (role?.trim() === "mentor") {
              navigate("/");
            } else {
              navigate("/profile");
            }
          }, 1000);
        } else {
          setMessage("Signup completed but no authentication token received.");
        }
      } else if (res.status === 409) {
        setErrors({ general: "This email or username is already registered. Please login instead." });
      } else if (res.status === 400) {
        setErrors({ general: data?.message || "Invalid request. Please check your inputs." });
      } else {
        setErrors({ general: data?.message || "Signup failed. Please try again." });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h2>Create an Account</h2>

        {errors.general && (
          <p className="form-message error">{errors.general}</p>
        )}
        {message && (
          <p
            className={`form-message ${
              message.toLowerCase().includes("successful") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}

        {/* Role Selection */}
        <div className="form-group role-selection-group">
          <label className="role-main-label">I want to join as:</label>
          <p className="role-helper-text">Choose the option that best describes you</p>
          
          <div className="role-cards">
            {/* Student Card */}
            <div
              className={`role-card ${formData.role === "user" ? "selected" : ""} ${
                errors.role && !formData.role ? "error-border" : ""
              }`}
              onClick={() => handleRoleSelect("user")}
              role="button"
              tabIndex={0}
              aria-label="Select Student role"
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRoleSelect("user");
                }
              }}
            >
              <div className="role-card-icon student-icon">
                <GraduationCap size={32} strokeWidth={2.5} />
              </div>
              <h3 className="role-card-title">Student</h3>
              <p className="role-card-description">
                I want to learn and connect with mentors for guidance
              </p>
              <div className="role-card-check">
                {formData.role === "user" && (
                  <div className="check-circle">✓</div>
                )}
              </div>
            </div>

            {/* Mentor Card */}
            <div
              className={`role-card ${formData.role === "mentor" ? "selected" : ""} ${
                errors.role && !formData.role ? "error-border" : ""
              }`}
              onClick={() => handleRoleSelect("mentor")}
              role="button"
              tabIndex={0}
              aria-label="Select Mentor role"
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRoleSelect("mentor");
                }
              }}
            >
              <div className="role-card-icon mentor-icon">
                <Users size={32} strokeWidth={2.5} />
              </div>
              <h3 className="role-card-title">Mentor</h3>
              <p className="role-card-description">
                I want to guide and help students achieve their goals
              </p>
              <div className="role-card-check">
                {formData.role === "mentor" && (
                  <div className="check-circle">✓</div>
                )}
              </div>
            </div>
          </div>
          
          {errors.role && <p className="error-text role-error">{errors.role}</p>}
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="username">Full Name</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your full name"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="name"
          />
          {errors.username && <p className="error-text">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label htmlFor="phone">Mobile Number</label>
          <div className="phone-input-row">
            <span className="phone-prefix">🇮🇳 +91</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              required
              autoComplete="tel"
            />
          </div>
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="form-group password-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Login Link */}
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;