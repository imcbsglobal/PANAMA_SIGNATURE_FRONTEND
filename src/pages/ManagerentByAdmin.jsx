// panama-signature/src/pages/ManagerentByAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ManagerentByAdmin.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import Sidebar from "../components/sidebar";

const PERIOD_LABELS = {
  monthly: "/mo",
  yearly: "/yr",
};

function ManagerentByAdmin() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [error, setError] = useState("");

  const loadRentals = () => {
    setLoading(true);
    api
      .getRentals()
      .then((data) => setProperties(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load rental properties.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleEdit = (slug) => {
    navigate(`/admin-rent?edit=${slug}`);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this rental property permanently?")) return;
    setDeletingSlug(slug);
    try {
      await api.deleteRental(slug);
      setProperties((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      console.error(err);
      setError("Failed to delete rental property.");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="manage-rent">
        <div className="manage-rent__header">
          <div className="manage-rent__header-left">
            <div className="manage-rent__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21V8L12 3L21 8V21H14V14H10V21H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1>Manage Rentals</h1>
              <p>View, edit, or remove listed rental properties.</p>
            </div>
          </div>
          <button type="button" className="manage-rent__add" onClick={() => navigate("/admin-rent")}>
            + Add Rental
          </button>
        </div>

        {error && <p className="manage-rent__error">{error}</p>}
        {loading && <p className="manage-rent__loading">Loading rental properties...</p>}
        {!loading && properties.length === 0 && (
          <p className="manage-rent__empty">No rental properties added yet.</p>
        )}

        <div className="manage-rent__grid">
          {properties.map((property) => {
            const cover =
              property.images && property.images.length > 0
                ? property.images.find((img) => img.is_cover)?.image || property.images[0].image
                : null;
            const coverUrl = resolveImage(cover);

            return (
              <div className="manage-rent__card" key={property.id}>
                <div className="manage-rent__image-wrap">
                  {coverUrl ? (
                    <img src={coverUrl} alt={property.title} />
                  ) : (
                    <div className="manage-rent__image-placeholder" />
                  )}
                  <span className="manage-rent__status-badge">{property.status}</span>
                </div>

                <div className="manage-rent__body">
                  <h3>{property.title}</h3>
                  <p className="manage-rent__location">{property.location}</p>
                  <p className="manage-rent__price">
                    {property.currency} {Number(property.rent_price).toLocaleString()}
                    <span className="manage-rent__period">
                      {PERIOD_LABELS[property.rent_period]}
                    </span>
                  </p>
                  <div className="manage-rent__meta">
                    <span>{property.property_type}</span>
                    <span>{property.bedrooms} bd</span>
                    <span>{property.bathrooms} ba</span>
                    <span>{property.size_sqft} sqft</span>
                  </div>

                  <div className="manage-rent__actions">
                    <button
                      type="button"
                      className="manage-rent__edit-btn"
                      onClick={() => handleEdit(property.slug)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="manage-rent__delete-btn"
                      onClick={() => handleDelete(property.slug)}
                      disabled={deletingSlug === property.slug}
                    >
                      {deletingSlug === property.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ManagerentByAdmin;