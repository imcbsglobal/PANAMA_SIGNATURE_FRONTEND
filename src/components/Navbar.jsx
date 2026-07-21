// panama-signature/src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaEnvelope, FaUser, FaBars, FaTimes } from "react-icons/fa";
import AdminLoginModal from "../pages/AdminLogin";
import logo from "../assets/images/logo.png";
import "./Navbar.scss";

// routes that have a hero/banner behind the navbar (dark navbar over image)
const TRANSPARENT_ROUTES = ["/", "/about", "/contact"];
// routes that use the full-width light (white bg, black text) navbar
const LIGHT_ROUTES = ["/buy", "/rent", "/projects"];

function Navbar() {
  const location = useLocation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTransparent = TRANSPARENT_ROUTES.includes(location.pathname);
  const isLight = LIGHT_ROUTES.includes(location.pathname);
  const isHome = location.pathname === "/";

  const navClass = [
    "navbar",
    isTransparent ? "navbar--transparent" : "",
    isLight ? "navbar--light" : "",
    isHome ? "navbar--home" : "",
    mobileMenuOpen ? "navbar--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={navClass}>
        <div className="navbar__inner">
          <div className="navbar__left">
            <img src={logo} alt="Panama Signature" className="navbar__logo-img" />
            <ul className="navbar__links">
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/" onClick={closeMobileMenu}>Home</Link>
              </li>
              <li className={location.pathname === "/about" ? "active" : ""}>
                <Link to="/about" onClick={closeMobileMenu}>About</Link>
              </li>
              <li className={location.pathname === "/buy" ? "active" : ""}>
                <Link to="/buy" onClick={closeMobileMenu}>Buy</Link>
              </li>
              <li className={location.pathname === "/projects" ? "active" : ""}>
                <Link to="/projects" onClick={closeMobileMenu}>Projects</Link>
              </li>
              <li className={location.pathname === "/rent" ? "active" : ""}>
                <Link to="/rent" onClick={closeMobileMenu}>Rent</Link>
              </li>
              <li className={location.pathname === "/contact" ? "active" : ""}>
                <Link to="/contact" onClick={closeMobileMenu}>Contact</Link>
              </li>
            </ul>
          </div>

          <div className="navbar__right">
            <span className="navbar__email">
              <FaEnvelope /> info@panamasignature.com
            </span>
            <button className="navbar__login" onClick={() => setShowAdminLogin(true)}>
              <FaUser /> Login
            </button>
          </div>

          <button
            className="navbar__burger"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {showAdminLogin && (
        <AdminLoginModal onClose={() => setShowAdminLogin(false)} />
      )}
    </>
  );
}

export default Navbar;