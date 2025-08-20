import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, } from "react-router-dom";

import api from "./api";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Logout from './components/Logout'

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  //Check session on first load (refresh, new tab)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  //Auto logout when token expires
  useEffect(() => {
    if (user?.exp) {
      const now = Date.now();
      const timeLeft = user.exp - now;

      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setUser(null);
          navigate("/signin");
        }, timeLeft);

        return () => clearTimeout(timer);
      } else {
        setUser(null);
        navigate("/signin");
      }
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/"
        element={user ? <Navigate to="/profile" /> : <Navigate to="/signin" replace />}
      />
      {/* Auth Routes */}
      <Route
        path="/signin"
        element={user ? <Navigate to="/profile" /> : <SignIn setUser={setUser} />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/profile" /> : <SignUp />}
      />
      <Route
        path="/forgotpassword"
        element={user ? <Navigate to="/profile" /> : <ForgotPassword />}
      />
      <Route
        path="/resetpassword"
        element={user ? <Navigate to="/profile" /> : <ResetPassword />}
      />
      {/* Protected Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user}>
            <Profile user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />
      <Route path="/logout" element={<Logout setUser={setUser} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}