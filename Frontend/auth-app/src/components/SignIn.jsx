import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function SignIn({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/signin", { email, password });
      const data = res.data;
      setMessage({ text: data.message || "Signed in successfully!", error: false });
      setUser({
        ...data.user,
        token: data.token,
        exp: data.exp,
      });
      navigate('/profile');
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Sign in failed", error: true });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Enter your credentials</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <div className="auth-row">
              <label className="auth-label">Password</label>
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate('/forgotpassword')}>Forgot?
              </button>
            </div>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Sign in</button>
        </form>

        <div className="auth-footer">Don’t have an account?
          <button className="auth-link" onClick={() => navigate('/signup')}>Sign up</button>
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
export default SignIn;