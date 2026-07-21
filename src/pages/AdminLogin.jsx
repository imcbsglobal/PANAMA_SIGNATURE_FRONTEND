import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/AdminLogin.scss";

function AdminLoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(email, password);
      onClose();
      navigate("/admin-team");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="admin-login-overlay" onClick={handleOverlayClick}>
      <div className="admin-login__card">
        <button className="admin-login__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="admin-login__eyebrow">Panama Signature</span>
        <h1 className="admin-login__title">
          Admin <span className="script">Access</span>
        </h1>
        <p className="admin-login__subtitle">Sign in to manage your portfolio</p>
        <div className="admin-login__divider" />

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@panamasignature.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button className="admin-login__submit" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        {error && <p className="admin-login__status">{error}</p>}
      </div>
    </div>
  );
}

export default AdminLoginModal;