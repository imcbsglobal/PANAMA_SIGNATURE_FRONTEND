// panama-signature/src/components/sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";
import "./sidebar.scss";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // Close the drawer automatically if the route changes some other way
  // (e.g. browser back/forward) so it never gets stuck open.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const navItems = [
    { path: "/admin-team", label: "Team" },
    { path: "/admin-buy", label: "Buy Properties" },
    { path: "/admin-rent", label: "Rent properties" },
    { path: "/admin-project", label: "Projects" },
    // { path: "/admin-team", label: "Team" },
  ];

  return (
    <>
      <button
        className={
          "sidebar__mobile-toggle" +
          (isMobileOpen ? " sidebar__mobile-toggle--open" : "")
        }
        onClick={toggleMobileMenu}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isMobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={
          "sidebar" + (isMobileOpen ? " sidebar--open" : "")
        }
      >
        <div className="sidebar__brand">
          <span className="sidebar__eyebrow">Panama</span>
          <span className="sidebar__title">
            Signature<span className="script"> Admin</span>
          </span>
        </div>

        <div className="sidebar__divider" />

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={
                "sidebar__link" +
                (location.pathname === item.path
                  ? " sidebar__link--active"
                  : "")
              }
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar__logout" onClick={handleLogoutClick}>
          Logout
        </button>
      </aside>

      {/*
        Rendered OUTSIDE <aside>, which is intentional and load-bearing:
        .sidebar uses position: sticky, and a sticky (or transform)
        ancestor creates its own stacking context. Any position: fixed
        element nested inside it gets its z-index confined to that
        ancestor's stacking context instead of the page's root context —
        so elements elsewhere on the page (e.g. property card images
        rendered later in the DOM) can paint on top of this modal even
        though it has a higher z-index. Keeping it as a sibling of
        <aside>, at the top level of this component's Fragment, lets
        it stack against the whole page correctly.
      */}
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
    </>
  );
}

export default Sidebar;