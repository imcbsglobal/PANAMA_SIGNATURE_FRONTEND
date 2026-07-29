// panama-signature/src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaEnvelope, FaUser, FaBars, FaTimes } from "react-icons/fa";
import AdminLoginModal from "../pages/AdminLogin";
import logo from "../assets/images/logo.png";
import "./Navbar.scss";

// routes that have a hero/banner behind the navbar (dark navbar over image)
const TRANSPARENT_ROUTES = ["/", "/about", "/contact"];
// routes that use the full-width light (white bg, black text) navbar
const LIGHT_ROUTES = ["/buy", "/rent", "/projects"];

// each transparent route's banner/hero section, so we can watch it
// and switch the navbar to solid the moment it scrolls out of view
const BANNER_SELECTORS = {
  "/": ".hero",
  "/about": ".about-banner",
  "/contact": ".contact-banner",
};

// roughly matches the navbar's min-height, used as the intersection
// root margin so the switch happens right as content tucks under it
const NAVBAR_HEIGHT = 68;

// exact match for "/", but prefix match for everything else so that
// nested detail routes (e.g. /buy/:id, /rent/:id, /projects/:id) still
// get treated the same as their parent listing page's navbar style
const matchesRoute = (path, route) =>
  route === "/" ? path === "/" : path === route || path.startsWith(route + "/");

function Navbar() {
  const location = useLocation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const observerRef = useRef(null);

  const isTransparent = TRANSPARENT_ROUTES.some((route) => matchesRoute(location.pathname, route));
  const isLight = LIGHT_ROUTES.some((route) => matchesRoute(location.pathname, route));
  const isHome = location.pathname === "/";

  useEffect(() => {
    // clean up any observer from a previous route
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const selector = BANNER_SELECTORS[location.pathname];

    // routes with no banner (Buy/Rent/Projects etc.) — navbar is
    // already solid via navbar--light, nothing to watch
    if (!selector) {
      setIsScrolled(false);
      return;
    }

    let cancelled = false;

    // wait a tick so the page's banner element exists in the DOM
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const bannerEl = document.querySelector(selector);

      if (!bannerEl) {
        // fallback: no banner found, default to solid so text stays readable
        setIsScrolled(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        { rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`, threshold: 0 }
      );

      observer.observe(bannerEl);
      observerRef.current = observer;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [location.pathname]);

  const navClass = [
    "navbar",
    isTransparent && !isScrolled ? "navbar--transparent" : "",
    isLight ? "navbar--light" : "",
    isHome ? "navbar--home" : "",
    isScrolled ? "navbar--scrolled" : "",
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
              <li className={matchesRoute(location.pathname, "/buy") ? "active" : ""}>
                <Link to="/buy" onClick={closeMobileMenu}>Buy</Link>
              </li>
              <li className={matchesRoute(location.pathname, "/projects") ? "active" : ""}>
                <Link to="/projects" onClick={closeMobileMenu}>Projects</Link>
              </li>
              <li className={matchesRoute(location.pathname, "/rent") ? "active" : ""}>
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