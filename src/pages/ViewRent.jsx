import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/ViewRent.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaWhatsapp,
  FaPhoneAlt,
  FaImages,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaBuilding,
  FaRegCalendarAlt,
  FaStar,
  FaHashtag,
  FaCircle,
} from "react-icons/fa";

const STATUS_LABELS = {
  exclusive: "Exclusive",
  rented: "Rented",
  coming_soon: "Coming Soon",
  available: "Available",
};

const PERIOD_LABELS = {
  monthly: "/ month",
  yearly: "/ year",
};

// WhatsApp number in international format (no +, no leading 0)
const WHATSAPP_NUMBER = "971545969259";

function ViewRent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getRentalBySlug(slug)
      .then((data) => {
        setProperty(data);
      })
      .catch((err) => {
        console.error("Failed to load rental property:", err);
        setError("Property not found.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const openLightbox = useCallback((idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const showPrev = useCallback((e, total) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + total) % total);
  }, []);

  const showNext = useCallback((e, total) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % total);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft" && property?.images?.length) {
        setLightboxIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
      }
      if (e.key === "ArrowRight" && property?.images?.length) {
        setLightboxIndex((prev) => (prev + 1) % property.images.length);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, property]);

  if (loading) {
    return (
      <div className="viewrent-page viewrent-page--status">
        <p>Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="viewrent-page viewrent-page--status">
        <p>{error || "Property not found."}</p>
        <button className="viewrent-back-btn" onClick={() => navigate("/rent")}>
          <FaArrowLeft /> Back to Listings
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const total = images.length;

  const statusBadge = (
    <span className="viewrent-gallery__status-badge">
      {STATUS_LABELS[property.status] || property.status}
    </span>
  );

  // Build a detailed WhatsApp message with all property info
  const buildWhatsAppMessage = () => {
    const lines = [
      `Hi, I'm interested in the following property:`,
      ``,
      `*${property.title}*`,
      `Location: ${property.location}`,
      `Rent: ${property.currency} ${Number(property.rent_price).toLocaleString()} ${PERIOD_LABELS[property.rent_period] || ""}`.trim(),
      `Type: ${property.property_type}`,
      `Bedrooms: ${property.bedrooms}`,
      `Bathrooms: ${property.bathrooms}`,
      `Size: ${property.size_sqft} sqft`,
      `Status: ${STATUS_LABELS[property.status] || property.status}`,
    ];

    if (property.developer) {
      lines.push(`Developer: ${property.developer}`);
    }

    if (property.available_from) {
      lines.push(`Available From: ${property.available_from}`);
    }

    lines.push(``);
    lines.push(`Property Link: ${window.location.href}`);

    return lines.join("\n");
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildWhatsAppMessage()
  )}`;

  return (
    <div className="viewrent-page">
      <div className="viewrent-topbar">
        <button className="viewrent-back-btn" onClick={() => navigate("/rent")}>
          <FaArrowLeft /> Back to Listings
        </button>
      </div>

      <div className="viewrent-gallery">
        {total === 0 && (
          <div className="viewrent-gallery__grid viewrent-gallery__grid--empty">
            <div className="viewrent-gallery__placeholder">{statusBadge}</div>
          </div>
        )}

        {total === 1 && (
          <div className="viewrent-gallery__grid viewrent-gallery__grid--single">
            <div className="viewrent-gallery__cell" onClick={() => openLightbox(0)}>
              <img src={resolveImage(images[0].image)} alt={property.title} />
              {statusBadge}
            </div>
          </div>
        )}

        {total === 2 && (
          <div className="viewrent-gallery__grid viewrent-gallery__grid--two">
            {images.map((img, idx) => (
              <div
                className="viewrent-gallery__cell"
                key={img.id || idx}
                onClick={() => openLightbox(idx)}
              >
                <img src={resolveImage(img.image)} alt={`${property.title} ${idx + 1}`} />
                {idx === 0 && statusBadge}
              </div>
            ))}
          </div>
        )}

        {total >= 3 && (
          <div className="viewrent-gallery__grid viewrent-gallery__grid--main">
            <div
              className="viewrent-gallery__cell viewrent-gallery__cell--main"
              onClick={() => openLightbox(0)}
            >
              <img src={resolveImage(images[0].image)} alt={property.title} />
              {statusBadge}
            </div>
            <div className="viewrent-gallery__side">
              <div className="viewrent-gallery__cell" onClick={() => openLightbox(1)}>
                <img src={resolveImage(images[1].image)} alt={`${property.title} 2`} />
              </div>
              <div className="viewrent-gallery__cell" onClick={() => openLightbox(2)}>
                <img src={resolveImage(images[2].image)} alt={`${property.title} 3`} />
                {total > 3 && (
                  <div
                    className="viewrent-gallery__more-overlay"
                    onClick={() => openLightbox(2)}
                  >
                    +{total - 3} More
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {total > 0 && (
          <button className="viewrent-gallery__photos-btn" onClick={() => openLightbox(0)}>
            <FaImages /> {total} Photo{total > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="viewrent-content">
        <div className="viewrent-content__main">
          <div className="viewrent-eyebrow-row">
            <span className="viewrent-eyebrow">Property Overview</span>
            <span className="viewrent-eyebrow-line" />
          </div>

          <div className="viewrent-heading">
            <div className="viewrent-heading__badges">
              <span className="viewrent-heading__status-chip">
                <FaCircle style={{ fontSize: "8px" }} /> {STATUS_LABELS[property.status] || property.status}
              </span>
              {property.is_featured && (
                <span className="viewrent-heading__featured-chip">
                  <FaStar /> Featured
                </span>
              )}
            </div>

            <h1 className="viewrent-heading__title">{property.title}</h1>

            <p className="viewrent-heading__slug">
              <FaHashtag /> {property.slug}
            </p>

            <p className="viewrent-heading__location">
              <FaMapMarkerAlt /> {property.location}
            </p>

            <p className="viewrent-heading__price">
              <span className="viewrent-heading__price-label">Rent</span>
              {property.currency} {Number(property.rent_price).toLocaleString()}{" "}
              <span className="viewrent-heading__price-period">
                {PERIOD_LABELS[property.rent_period] || ""}
              </span>
            </p>
          </div>

          <div className="viewrent-meta">
            <div className="viewrent-meta__item">
              <FaBed className="viewrent-meta__icon" />
              <div className="viewrent-meta__text">
                <span className="viewrent-meta__value">{property.bedrooms}</span>
                <span className="viewrent-meta__label">Bedrooms</span>
              </div>
            </div>
            <div className="viewrent-meta__item">
              <FaBath className="viewrent-meta__icon" />
              <div className="viewrent-meta__text">
                <span className="viewrent-meta__value">{property.bathrooms}</span>
                <span className="viewrent-meta__label">Bathrooms</span>
              </div>
            </div>
            <div className="viewrent-meta__item">
              <FaRulerCombined className="viewrent-meta__icon" />
              <div className="viewrent-meta__text">
                <span className="viewrent-meta__value">{property.size_sqft}</span>
                <span className="viewrent-meta__label">Sqft</span>
              </div>
            </div>
            <div className="viewrent-meta__item">
              <FaTag className="viewrent-meta__icon" />
              <div className="viewrent-meta__text">
                <span className="viewrent-meta__label">Type</span>
                <span className="viewrent-meta__value">{property.property_type}</span>
              </div>
            </div>
          </div>

          {property.developer && (
            <div className="viewrent-developer">
              <span className="viewrent-developer__icon">
                <FaBuilding />
              </span>
              <span className="viewrent-developer__label">Developer</span>
              <span className="viewrent-developer__value">{property.developer}</span>
            </div>
          )}

          {property.available_from && (
            <div className="viewrent-developer">
              <span className="viewrent-developer__icon">
                <FaRegCalendarAlt />
              </span>
              <span className="viewrent-developer__label">Available From</span>
              <span className="viewrent-developer__value">{property.available_from}</span>
            </div>
          )}

          {property.description && (
            <div className="viewrent-description">
              <h3>Description</h3>
              <p>{property.description}</p>
            </div>
          )}
        </div>

        <aside className="viewrent-content__sidebar">
          <div className="viewrent-contact-card">
            <h3>Interested in this property?</h3>
            <p>Reach out to our team for a private viewing or more details.</p>

            <a
              className="viewrent-contact-card__btn viewrent-contact-card__btn--whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp /> WhatsApp Us
            </a>

            <a
              className="viewrent-contact-card__btn viewrent-contact-card__btn--call"
              href={`tel:+${WHATSAPP_NUMBER}`}
            >
              <FaPhoneAlt /> Call Us
            </a>

            <Link to="/contact" className="viewrent-contact-card__link">
              Or fill out our contact form
            </Link>
          </div>
        </aside>
      </div>

      {lightboxOpen && total > 0 && (
        <div className="viewrent-lightbox" onClick={closeLightbox}>
          <button className="viewrent-lightbox__close" onClick={closeLightbox}>
            <FaTimes />
          </button>

          <span className="viewrent-lightbox__counter">
            {lightboxIndex + 1} / {total}
          </span>

          {total > 1 && (
            <button
              className="viewrent-lightbox__nav viewrent-lightbox__nav--prev"
              onClick={(e) => showPrev(e, total)}
            >
              <FaChevronLeft />
            </button>
          )}

          <div className="viewrent-lightbox__image-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={resolveImage(images[lightboxIndex].image)} alt={`${property.title} ${lightboxIndex + 1}`} />
          </div>

          {total > 1 && (
            <button
              className="viewrent-lightbox__nav viewrent-lightbox__nav--next"
              onClick={(e) => showNext(e, total)}
            >
              <FaChevronRight />
            </button>
          )}

          {total > 1 && (
            <div className="viewrent-lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className={`viewrent-lightbox__thumb ${
                    idx === lightboxIndex ? "viewrent-lightbox__thumb--active" : ""
                  }`}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img src={resolveImage(img.image)} alt={`thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewRent;