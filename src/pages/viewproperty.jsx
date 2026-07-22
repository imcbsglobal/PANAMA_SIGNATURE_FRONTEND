import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/viewproperty.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaBed,
  FaBuilding,
  FaTag,
  FaCalendarAlt,
  FaArrowLeft,
  FaWhatsapp,
  FaPhoneAlt,
} from "react-icons/fa";

const STATUS_LABELS = {
  ready: "Ready",
  off_plan: "Off-Plan",
  under_construction: "Under Construction",
  launching_soon: "Launching Soon",
};

// WhatsApp number in international format (no +, no leading 0)
const WHATSAPP_NUMBER = "971545969259";

function ViewProperty() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getProjectBySlug(slug)
      .then((data) => {
        setProject(data);
        setImgIndex(0);
      })
      .catch((err) => {
        console.error(err);
        setError("This property could not be found.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="view-property">
        <p className="view-property__status">Loading property details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="view-property">
        <p className="view-property__status view-property__status--error">
          {error || "Property not found."}
        </p>
        <Link to="/projects" className="view-property__back-link">
          <FaArrowLeft /> Back to Properties
        </Link>
      </div>
    );
  }

  const images = project.images && project.images.length > 0 ? project.images : [];
  const activeImage = images[imgIndex] ? resolveImage(images[imgIndex].image) : null;

  const propertyTypes = (project.property_types || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const bedrooms = (project.bedroom_range || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  const prevImage = () => setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Build a detailed WhatsApp message with all property info
  const buildWhatsAppMessage = () => {
    const lines = [
      `Hi, I'm interested in the following property:`,
      ``,
      `*${project.title}*`,
      `Location: ${project.location}`,
      `Starting Price: ${project.currency} ${Number(project.starting_price).toLocaleString()}`,
      `Status: ${STATUS_LABELS[project.status] || project.status}`,
    ];

    if (bedrooms.length > 0) {
      lines.push(`Bedrooms: ${bedrooms.join(", ")}`);
    }

    if (project.developer) {
      lines.push(`Developer: ${project.developer}`);
    }

    if (propertyTypes.length > 0) {
      lines.push(`Property Types: ${propertyTypes.join(", ")}`);
    }

    lines.push(``);
    lines.push(`Property Link: ${window.location.href}`);

    return lines.join("\n");
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildWhatsAppMessage()
  )}`;

  return (
    <div className="view-property">
      <div className="view-property__topbar">
        <button className="view-property__back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="view-property__breadcrumb">
          <Link to="/">Home</Link> / <Link to="/projects">Properties</Link> / <span>{project.title}</span>
        </div>
      </div>

      <div className="view-property__gallery">
        <div className="view-property__main-image">
          {activeImage ? (
            <img src={activeImage} alt={project.title} />
          ) : (
            <div className="view-property__image-placeholder" />
          )}

          <span className="view-property__status-badge">
            {STATUS_LABELS[project.status] || project.status}
          </span>

          {images.length > 1 && (
            <>
              <button className="view-property__nav view-property__nav--prev" onClick={prevImage} aria-label="Previous image">
                <FaChevronLeft />
              </button>
              <button className="view-property__nav view-property__nav--next" onClick={nextImage} aria-label="Next image">
                <FaChevronRight />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="view-property__thumbs">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                className={`view-property__thumb ${i === imgIndex ? "is-active" : ""}`}
                onClick={() => setImgIndex(i)}
              >
                <img src={resolveImage(img.image)} alt={`${project.title} ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="view-property__layout">
        <div className="view-property__main">
          <div className="view-property__header">
            <h1>{project.title}</h1>
            <p className="view-property__location">
              <FaMapMarkerAlt /> {project.location}
            </p>
          </div>

          <div className="view-property__feature-strip">
            {bedrooms.length > 0 && (
              <div className="view-property__feature">
                <FaBed />
                <div>
                  <strong>{bedrooms.join(", ")}</strong>
                  <span>Bedrooms</span>
                </div>
              </div>
            )}
            {project.developer && (
              <div className="view-property__feature">
                <FaBuilding />
                <div>
                  <strong>{project.developer}</strong>
                  <span>Developer</span>
                </div>
              </div>
            )}
            <div className="view-property__feature">
              <FaTag />
              <div>
                <strong>{STATUS_LABELS[project.status] || project.status}</strong>
                <span>Status</span>
              </div>
            </div>
            {project.updated_at && (
              <div className="view-property__feature">
                <FaCalendarAlt />
                <div>
                  <strong>{new Date(project.updated_at).toLocaleDateString()}</strong>
                  <span>Last Updated</span>
                </div>
              </div>
            )}
          </div>

          {project.description && (
            <div className="view-property__section">
              <h2>About this Property</h2>
              <p>{project.description}</p>
            </div>
          )}

          {propertyTypes.length > 0 && (
            <div className="view-property__section">
              <h2>Property Types</h2>
              <div className="view-property__chips">
                {propertyTypes.map((type) => (
                  <span key={type} className="view-property__chip">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="view-property__sidebar">
          <div className="view-property__price-card">
            <span className="view-property__price-label">Starting Price</span>
            <span className="view-property__price-value">
              {project.currency} {Number(project.starting_price).toLocaleString()}
            </span>

            {project.is_featured && <span className="view-property__featured-tag">Featured Listing</span>}

            <a className="view-property__contact-btn" href={`tel:+${WHATSAPP_NUMBER}`}>
              <FaPhoneAlt /> Call Agent
            </a>
            <a className="view-property__contact-btn view-property__contact-btn--whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> WhatsApp Enquiry
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ViewProperty;