import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage({ text: "Invalid reset link", error: true });
      return;
    }

    const verifyToken = async () => {
      try {
        await api.post("/auth/verify-reset-token", { token });
        // token valid , do nothing, user can reset password
      } catch (err) {
        setMessage({ text: "Invalid or expired link", error: true });
        setTimeout(() => navigate("/forgotpassword"), 2000);
      }
    };
    verifyToken();
  }, [token, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match", error: true });
      return;
    }

    try {
      const res = await api.post("/auth/reset", { token, password });
      const data = res.data;
      setMessage({
        text: data.message || "Password reset successfully!",
        error: false,
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Error resetting password",
        error: true,
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Enter your new password</p>
        <form onSubmit={handleReset}>
          <div className="auth-form-group">
            <label className="auth-label">New password</label>
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
            <label className="auth-label">Confirm password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Reset password</button>
        </form>

        <div className="auth-footer">Back to
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
export default ResetPassword;