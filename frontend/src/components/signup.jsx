import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./AuthForm.css";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Purane code ke mutabik trailing space. Agar backend ko yehi chahiye to isko rakho.
    role: "user ",
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
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
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
      newErrors.password =
        "Password must contain uppercase, lowercase, and a number";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Radios ke liye as-is value rakho (purane jaisa)
    const next = type === "radio" ? value : value;
    setFormData((prev) => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const safeParseJson = async (response) => {
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try { return await response.json(); } catch { return {}; }
    }
    try { return { message: await response.text() }; } catch { return {}; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      // Purane waale pattern ke hisaab se default 3000 rakha tha. Aap VITE_API_URL ko 5000 set kar lo.
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      // Payload ko purane jaisa hi bhejo (confirmPassword hatao, role as-is)
      const { confirmPassword, ...submitData } = formData;

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await safeParseJson(res);

      if (res.ok) {
        setMessage("Signup successful! Redirecting...");
        if (data?.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem(
            "role",
            data.role || (data.user && data.user.role) || formData.role
          );
          // Auth update
          login(data.token);

          const role =
            data.role || (data.user && data.user.role) || formData.role;

          setTimeout(() => {
            if (role?.trim() === "mentor") {
              navigate("/");
            } else {
              navigate("/profile");
            }
          }, 100);
        } else {
          setMessage("Signup completed but no authentication token received.");
        }
      } else if (res.status === 409) {
        setErrors({ general: "Username or email already exists." });
      } else if (res.status === 400) {
        setMessage(data?.message || "Invalid request. Please check inputs.");
      } else {
        setMessage(data?.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Role selection (labels Student/Mentor, values purane jaise) */}
        <div className="form-group">
          <label>Sign up as:</label>
          <div className="role-selector" role="radiogroup" aria-label="Select role">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="user"
                checked={formData.role === "user"}
                onChange={handleChange}
              />
              <div className="role-button" tabIndex={0} aria-pressed={formData.role === "user"}>
                Student
              </div>
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="mentor"
                checked={formData.role === "mentor"}
                onChange={handleChange}
              />
              <div className="role-button" tabIndex={0} aria-pressed={formData.role === "mentor"}>
                Mentor
              </div>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter full name or handle"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className="error-text">{errors.username}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label="Toggle password visibility"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="form-group password-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label="Toggle confirm password visibility"
            onClick={() => setShowConfirmPassword((s) => !s)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;