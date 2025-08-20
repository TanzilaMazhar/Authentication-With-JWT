import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Profile({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Profile</h1>
        <p className="auth-subtitle">Welcome, {user.email}</p>
        <p><strong>Token:</strong> {user?.token || "Not available"}</p>
        <p><strong>Expires:</strong> {user?.exp ? new Date(user.exp).toLocaleString() : "N/A"}</p>
        <button className="auth-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Profile;
