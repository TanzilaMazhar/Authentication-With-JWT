import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });

  const navigate = useNavigate()

  //Email and password validation function
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address", error: true });
      return;
    }

    if (!validatePassword(password)) {
      setMessage({
        text: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
        error: true
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match", error: true });
      return;
    }

    try {
      const res = await api.post("/auth/signup", { email, password });
      const data = res.data;
      setMessage({ text: data.message || "Account created successfully!", error: false });
      setTimeout(() => navigate('/signin'), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Server error", error: true });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Sign up</h1>
        <p className="auth-subtitle">Create your account</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Create account</button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <button className="auth-link" onClick={() => navigate('/')}>Sign in</button>
        </div>

        {message.text && (
          <p className={`auth-message ${message.error ? "error" : "success"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
export default SignUp;