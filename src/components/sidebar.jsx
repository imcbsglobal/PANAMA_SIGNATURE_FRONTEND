// panama-signature/src/components/sidebar.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";
import "./sidebar.scss";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    api.logout();
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__eyebrow">Panama</span>
        <span className="sidebar__title">
          Signature<span className="script"> Admin</span>
        </span>
      </div>

      <div className="sidebar__divider" />

      <nav className="sidebar__nav">
        <button
          className={
            "sidebar__link" +
            (location.pathname === "/admin-buy" ? " sidebar__link--active" : "")
          }
          onClick={() => navigate("/admin-buy")}
        >
          Buy Properties
        </button>

        <button
          className={
            "sidebar__link" +
            (location.pathname === "/admin-rent" ? " sidebar__link--active" : "")
          }
          onClick={() => navigate("/admin-rent")}
        >
          Rent properties
        </button>

        <button
          className={
            "sidebar__link" +
            (location.pathname === "/admin-project" ? " sidebar__link--active" : "")
          }
          onClick={() => navigate("/admin-project")}
        >
          Projects
        </button>

        <button
          className={
            "sidebar__link" +
            (location.pathname === "/admin-team" ? " sidebar__link--active" : "")
          }
          onClick={() => navigate("/admin-team")}
        >
          Team
        </button>
      </nav>

      <button className="sidebar__logout" onClick={handleLogoutClick}>
        Logout
      </button>

      {showLogoutConfirm && (
        <div className="logout-modal__overlay" onClick={cancelLogout}>
          <div
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="logout-modal__eyebrow">Confirm</span>
            <h3 className="logout-modal__title">Log out of admin?</h3>
            <p className="logout-modal__text">
              You'll need to sign in again to access the dashboard.
            </p>

            <div className="logout-modal__actions">
              <button
                className="logout-modal__btn logout-modal__btn--cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                className="logout-modal__btn logout-modal__btn--confirm"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;