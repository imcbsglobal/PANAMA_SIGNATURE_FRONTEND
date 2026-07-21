// panama-signature/src/pages/ManagePropertyByAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ManagePropertyByAdmin.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import Sidebar from "../components/sidebar";

function ManagePropertyByAdmin() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [error, setError] = useState("");

  const loadProperties = () => {
    setLoading(true);
    api
      .getProperties()
      .then((data) => setProperties(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load properties.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleEdit = (slug) => {
    navigate(`/admin-buy?edit=${slug}`);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this property permanently?")) return;
    setDeletingSlug(slug);
    try {
      await api.deleteProperty(slug);
      setProperties((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      console.error(err);
      setError("Failed to delete property.");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="manage-property">
        <div className="manage-property__header">
          <div className="manage-property__header-left">
            <div className="manage-property__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21V8L12 3L21 8V21H14V14H10V21H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1>Manage Properties</h1>
              <p>View, edit, or remove listed properties.</p>
            </div>
          </div>
          <button type="button" className="manage-property__add" onClick={() => navigate("/admin-buy")}>
            + Add Property
          </button>
        </div>

        {error && <p className="manage-property__error">{error}</p>}
        {loading && <p className="manage-property__loading">Loading properties...</p>}
        {!loading && properties.length === 0 && (
          <p className="manage-property__empty">No properties added yet.</p>
        )}

        <div className="manage-property__grid">
          {properties.map((property) => {
            const cover =
              property.images && property.images.length > 0
                ? property.images.find((img) => img.is_cover)?.image || property.images[0].image
                : null;
            const coverUrl = resolveImage(cover);

            return (
              <div className="manage-property__card" key={property.id}>
                <div className="manage-property__image-wrap">
                  {coverUrl ? (
                    <img src={coverUrl} alt={property.title} />
                  ) : (
                    <div className="manage-property__image-placeholder" />
                  )}
                  <span className="manage-property__status-badge">{property.status}</span>
                </div>

                <div className="manage-property__body">
                  <h3>{property.title}</h3>
                  <p className="manage-property__location">{property.location}</p>
                  <p className="manage-property__price">
                    {property.currency} {Number(property.price).toLocaleString()}
                  </p>
                  <div className="manage-property__meta">
                    <span>{property.property_type}</span>
                    <span>{property.bedrooms} bd</span>
                    <span>{property.bathrooms} ba</span>
                    <span>{property.size_sqft} sqft</span>
                  </div>

                  <div className="manage-property__actions">
                    <button
                      type="button"
                      className="manage-property__edit-btn"
                      onClick={() => handleEdit(property.slug)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="manage-property__delete-btn"
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

export default ManagePropertyByAdmin;