import { HiArrowUp } from "react-icons/hi";
import { FaFacebookF, FaWhatsapp, FaInstagram } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import "./Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__left">
          <div className="footer__logo">
            <img src={logo} alt="Panama Signature" />
            Panama Signature
          </div>

          <h2 className="footer__heading">
            Let's Help You Find The Perfect Property Or Get Top Value For The
            One You Own.
          </h2>

          <div className="footer__divider" />

          <div className="footer__phone">+123 456 789 00</div>

          <div className="footer__divider" />

          <div className="footer__email">info@panamasignature.com</div>

          <div className="footer__divider" />

          <div className="footer__social">
  <span>Follow Us.</span>

  <a
    href="https://facebook.com"
    target="_blank"
    rel="noreferrer"
    aria-label="Facebook"
  >
    <FaFacebookF />
  </a>

  <a
    href="https://wa.me/123456789"
    target="_blank"
    rel="noreferrer"
    aria-label="WhatsApp"
  >
    <FaWhatsapp />
  </a>

  <a
    href="https://instagram.com"
    target="_blank"
    rel="noreferrer"
    aria-label="Instagram"
  >
    <FaInstagram />
  </a>
</div>
</div>
        <div className="footer__image" />

        <button
          className="footer__scrolltop"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <HiArrowUp />
        </button>
      </div>

      <div className="footer__bottom">
        <span>2026 © All rights reserved by <strong>Panama Signature</strong></span>
        <div>
          <a href="/about">About Us</a>
          <a href="/projects">Properties</a>
          <a href="/services">Services</a>
          <a href="/blog">Blog</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;