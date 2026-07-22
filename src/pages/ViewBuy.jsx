import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/ViewBuy.scss";
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
  FaCar,
  FaCouch,
  FaStar,
  FaHashtag,
  FaCircle,
} from "react-icons/fa";

const STATUS_LABELS = {
  exclusive: "Exclusive",
  sold_out: "Sold Out",
  launching_soon: "Launching Soon",
  available: "Available",
};

const FURNISHED_LABELS = {
  furnished: "Furnished",
  semi_furnished: "Semi-Furnished",
  unfurnished: "Unfurnished",
};

// WhatsApp number in international format (no +, no leading 0)
const WHATSAPP_NUMBER = "971545969259";

function ViewBuy() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getPropertyBySlug(slug)
      .then((data) => {
        setProperty(data);
      })
      .catch((err) => {
        console.error("Failed to load property:", err);
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
      <div className="viewbuy-page viewbuy-page--status">
        <p>Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="viewbuy-page viewbuy-page--status">
        <p>{error || "Property not found."}</p>
        <button className="viewbuy-back-btn" onClick={() => navigate("/buy")}>
          <FaArrowLeft /> Back to Listings
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const total = images.length;

  const statusBadge = (
    <span className="viewbuy-gallery__status-badge">
      {STATUS_LABELS[property.status] || property.status}
    </span>
  );

  const fullAddress = [
    property.location,
    property.city,
    property.state,
    property.country,
    property.zip_code,
  ]
    .filter(Boolean)
    .join(", ");

  // Build a detailed WhatsApp message with all property info
  const buildWhatsAppMessage = () => {
    const lines = [
      `Hi, I'm interested in the following property:`,
      ``,
      `*${property.title}*`,
      `Location: ${property.location}`,
      `Price: ${property.currency} ${Number(property.price).toLocaleString()}`,
      `Type: ${property.property_type}`,
      `Bedrooms: ${property.bedrooms}`,
      `Bathrooms: ${property.bathrooms}`,
      `Size: ${property.size_sqft} sqft`,
      `Status: ${STATUS_LABELS[property.status] || property.status}`,
    ];

    if (property.developer) {
      lines.push(`Developer: ${property.developer}`);
    }

    if (property.handover_date) {
      lines.push(`Handover Date: ${property.handover_date}`);
    }

    if (fullAddress) {
      lines.push(`Address: ${fullAddress}`);
    }

    if (property.year_built) {
      lines.push(`Year Built: ${property.year_built}`);
    }

    if (property.parking_spaces != null && property.parking_spaces !== "") {
      lines.push(`Parking Spaces: ${property.parking_spaces}`);
    }

    if (property.furnished) {
      lines.push(`Furnishing: ${FURNISHED_LABELS[property.furnished] || property.furnished}`);
    }

    lines.push(``);
    lines.push(`Property Link: ${window.location.href}`);

    return lines.join("\n");
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildWhatsAppMessage()
  )}`;

  return (
    <div className="viewbuy-page">
      <div className="viewbuy-topbar">
        <button className="viewbuy-back-btn" onClick={() => navigate("/buy")}>
          <FaArrowLeft /> Back to Listings
        </button>
      </div>

      <div className="viewbuy-gallery">
        {total === 0 && (
          <div className="viewbuy-gallery__grid viewbuy-gallery__grid--empty">
            <div className="viewbuy-gallery__placeholder">{statusBadge}</div>
          </div>
        )}

        {total === 1 && (
          <div className="viewbuy-gallery__grid viewbuy-gallery__grid--single">
            <div className="viewbuy-gallery__cell" onClick={() => openLightbox(0)}>
              <img src={resolveImage(images[0].image)} alt={property.title} />
              {statusBadge}
            </div>
          </div>
        )}

        {total === 2 && (
          <div className="viewbuy-gallery__grid viewbuy-gallery__grid--two">
            {images.map((img, idx) => (
              <div
                className="viewbuy-gallery__cell"
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
          <div className="viewbuy-gallery__grid viewbuy-gallery__grid--main">
            <div
              className="viewbuy-gallery__cell viewbuy-gallery__cell--main"
              onClick={() => openLightbox(0)}
            >
              <img src={resolveImage(images[0].image)} alt={property.title} />
              {statusBadge}
            </div>
            <div className="viewbuy-gallery__side">
              <div className="viewbuy-gallery__cell" onClick={() => openLightbox(1)}>
                <img src={resolveImage(images[1].image)} alt={`${property.title} 2`} />
              </div>
              <div className="viewbuy-gallery__cell" onClick={() => openLightbox(2)}>
                <img src={resolveImage(images[2].image)} alt={`${property.title} 3`} />
                {total > 3 && (
                  <div
                    className="viewbuy-gallery__more-overlay"
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
          <button className="viewbuy-gallery__photos-btn" onClick={() => openLightbox(0)}>
            <FaImages /> {total} Photo{total > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="viewbuy-content">
        <div className="viewbuy-content__main">
          <div className="viewbuy-eyebrow-row">
            <span className="viewbuy-eyebrow">Property Overview</span>
            <span className="viewbuy-eyebrow-line" />
          </div>

          <div className="viewbuy-heading">
            <div className="viewbuy-heading__badges">
              <span className="viewbuy-heading__status-chip">
                <FaCircle style={{ fontSize: "8px" }} /> {STATUS_LABELS[property.status] || property.status}
              </span>
              {property.is_featured && (
                <span className="viewbuy-heading__featured-chip">
                  <FaStar /> Featured
                </span>
              )}
            </div>

            <h1 className="viewbuy-heading__title">{property.title}</h1>

            <p className="viewbuy-heading__slug">
              <FaHashtag /> {property.slug}
            </p>

            <p className="viewbuy-heading__location">
              <FaMapMarkerAlt /> {property.location}
            </p>

            <p className="viewbuy-heading__price">
              <span className="viewbuy-heading__price-label">Price</span>
              {property.currency} {Number(property.price).toLocaleString()}
            </p>
          </div>

          <div className="viewbuy-meta">
            <div className="viewbuy-meta__item">
              <FaBed className="viewbuy-meta__icon" />
              <div className="viewbuy-meta__text">
                <span className="viewbuy-meta__value">{property.bedrooms}</span>
                <span className="viewbuy-meta__label">Bedrooms</span>
              </div>
            </div>
            <div className="viewbuy-meta__item">
              <FaBath className="viewbuy-meta__icon" />
              <div className="viewbuy-meta__text">
                <span className="viewbuy-meta__value">{property.bathrooms}</span>
                <span className="viewbuy-meta__label">Bathrooms</span>
              </div>
            </div>
            <div className="viewbuy-meta__item">
              <FaRulerCombined className="viewbuy-meta__icon" />
              <div className="viewbuy-meta__text">
                <span className="viewbuy-meta__value">{property.size_sqft}</span>
                <span className="viewbuy-meta__label">Sqft</span>
              </div>
            </div>
            <div className="viewbuy-meta__item">
              <FaTag className="viewbuy-meta__icon" />
              <div className="viewbuy-meta__text">
                <span className="viewbuy-meta__label">Type</span>
                <span className="viewbuy-meta__value">{property.property_type}</span>
              </div>
            </div>
          </div>

          {property.developer && (
            <div className="viewbuy-developer">
              <span className="viewbuy-developer__icon">
                <FaBuilding />
              </span>
              <span className="viewbuy-developer__label">Developer</span>
              <span className="viewbuy-developer__value">{property.developer}</span>
            </div>
          )}

          {property.handover_date && (
            <div className="viewbuy-developer">
              <span className="viewbuy-developer__icon">
                <FaRegCalendarAlt />
              </span>
              <span className="viewbuy-developer__label">Handover Date</span>
              <span className="viewbuy-developer__value">{property.handover_date}</span>
            </div>
          )}

          <div className="viewbuy-developer">
            <span className="viewbuy-developer__icon">
              <FaMapMarkerAlt />
            </span>
            <span className="viewbuy-developer__label">Address Details</span>
            <span className="viewbuy-developer__value">
              {fullAddress || "Not provided"}
            </span>
          </div>

          <div className="viewbuy-developer">
            <span className="viewbuy-developer__icon">
              <FaRegCalendarAlt />
            </span>
            <span className="viewbuy-developer__label">Year Built</span>
            <span className="viewbuy-developer__value">
              {property.year_built || "Not provided"}
            </span>
          </div>

          <div className="viewbuy-developer">
            <span className="viewbuy-developer__icon">
              <FaCar />
            </span>
            <span className="viewbuy-developer__label">Parking Spaces</span>
            <span className="viewbuy-developer__value">
              {property.parking_spaces != null && property.parking_spaces !== ""
                ? property.parking_spaces
                : "Not provided"}
            </span>
          </div>

          <div className="viewbuy-developer">
            <span className="viewbuy-developer__icon">
              <FaCouch />
            </span>
            <span className="viewbuy-developer__label">Furnishing</span>
            <span className="viewbuy-developer__value">
              {property.furnished ? (FURNISHED_LABELS[property.furnished] || property.furnished) : "Not provided"}
            </span>
          </div>

          {property.description && (
            <div className="viewbuy-description">
              <h3>Description</h3>
              <p>{property.description}</p>
            </div>
          )}

          {property.payment_plans && property.payment_plans.length > 0 && (
            <div className="viewbuy-payment-plans">
              <h3>Payment Plan</h3>
              <div className="viewbuy-payment-plans__list">
                {property.payment_plans.map((plan) => (
                  <div className="viewbuy-payment-plans__item" key={plan.id}>
                    <span className="viewbuy-payment-plans__milestone">{plan.milestone}</span>
                    <span className="viewbuy-payment-plans__percentage">{plan.percentage}%</span>
                    {plan.due_date && (
                      <span className="viewbuy-payment-plans__date">{plan.due_date}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="viewbuy-content__sidebar">
          <div className="viewbuy-contact-card">
            <h3>Interested in this property?</h3>
            <p>Reach out to our team for a private viewing or more details.</p>

            <a
              className="viewbuy-contact-card__btn viewbuy-contact-card__btn--whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp /> WhatsApp Us
            </a>

            <a
              className="viewbuy-contact-card__btn viewbuy-contact-card__btn--call"
              href={`tel:+${WHATSAPP_NUMBER}`}
            >
              <FaPhoneAlt /> Call Us
            </a>

            <Link
              to="/contact"
              className="viewbuy-contact-card__link"
            >
              Or fill out our contact form
            </Link>
          </div>
        </aside>
      </div>

      {lightboxOpen && total > 0 && (
        <div className="viewbuy-lightbox" onClick={closeLightbox}>
          <button className="viewbuy-lightbox__close" onClick={closeLightbox}>
            <FaTimes />
          </button>

          <span className="viewbuy-lightbox__counter">
            {lightboxIndex + 1} / {total}
          </span>

          {total > 1 && (
            <button
              className="viewbuy-lightbox__nav viewbuy-lightbox__nav--prev"
              onClick={(e) => showPrev(e, total)}
            >
              <FaChevronLeft />
            </button>
          )}

          <div className="viewbuy-lightbox__image-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={resolveImage(images[lightboxIndex].image)} alt={`${property.title} ${lightboxIndex + 1}`} />
          </div>

          {total > 1 && (
            <button
              className="viewbuy-lightbox__nav viewbuy-lightbox__nav--next"
              onClick={(e) => showNext(e, total)}
            >
              <FaChevronRight />
            </button>
          )}

          {total > 1 && (
            <div className="viewbuy-lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className={`viewbuy-lightbox__thumb ${
                    idx === lightboxIndex ? "viewbuy-lightbox__thumb--active" : ""
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

export default ViewBuy;