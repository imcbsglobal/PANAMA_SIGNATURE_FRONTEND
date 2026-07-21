// panama-signature/src/pages/AdminAddRent.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/AdminAddRent.scss";
import api from "../api/api";
import Sidebar from "../components/sidebar";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  property_type: "apartment",
  status: "available",
  rent_price: "",
  rent_period: "yearly",
  currency: "USD",
  location: "",
  bedrooms: "",
  bathrooms: "",
  size_sqft: "",
  developer: "",
  is_featured: false,
  images: [],
};

function AdminAddRent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const isEditing = Boolean(editSlug);

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("");
  const [loadingExisting, setLoadingExisting] = useState(isEditing);

  useEffect(() => {
    if (!editSlug) {
      setForm(EMPTY_FORM);
      setLoadingExisting(false);
      return;
    }

    setLoadingExisting(true);
    setStatus("");
    api
      .getRentalBySlug(editSlug)
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          property_type: data.property_type || "apartment",
          status: data.status || "available",
          rent_price: data.rent_price ?? "",
          rent_period: data.rent_period || "yearly",
          currency: data.currency || "USD",
          location: data.location || "",
          bedrooms: data.bedrooms ?? "",
          bathrooms: data.bathrooms ?? "",
          size_sqft: data.size_sqft ?? "",
          developer: data.developer || "",
          is_featured: Boolean(data.is_featured),
          images: [],
        });
      })
      .catch((err) => {
        console.error(err);
        setStatus("Failed to load rental property for editing.");
      })
      .finally(() => setLoadingExisting(false));
  }, [editSlug]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, images: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(isEditing ? "Saving changes..." : "Saving...");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => data.append("images", file));
      } else {
        data.append(key, value);
      }
    });

    try {
      if (isEditing) {
        await api.updateRental(editSlug, data);
        setStatus("Rental property updated successfully!");
        navigate("/manage-rent-admin");
      } else {
        await api.createRental(data);
        setStatus("Rental property added successfully!");
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setStatus(isEditing ? "Error updating rental property." : "Error saving rental property.");
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-rent">
        <div className="admin-rent__card">
          <div className="admin-rent__header">
            <div>
              <span className="admin-rent__eyebrow">Panama Signature</span>
              <h1>{isEditing ? "Edit Rental Property" : "Add Rental Property"}</h1>
            </div>
            <button
              type="button"
              className="admin-rent__manage-btn"
              onClick={() => navigate("/manage-rent-admin")}
            >
              Manage Rentals
              <svg
                className="admin-rent__manage-btn-arrow"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="admin-rent__divider" />

          {loadingExisting ? (
            <p className="admin-rent__status">Loading rental property...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Title
                <input type="text" name="title" value={form.title} onChange={handleChange} required />
              </label>

              <label>
                Slug (unique URL id, e.g. marina-loft-rent)
                <input type="text" name="slug" value={form.slug} onChange={handleChange} required />
              </label>

              <label>
                Description
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
              </label>

              <div className="admin-rent__row">
                <label>
                  Property Type
                  <select name="property_type" value={form.property_type} onChange={handleChange}>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="studio">Studio</option>
                  </select>
                </label>

                <label>
                  Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="exclusive">Exclusive</option>
                    <option value="rented">Rented</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </label>
              </div>

              <div className="admin-rent__row admin-rent__row--three">
                <label>
                  Rent Price
                  <input type="number" name="rent_price" value={form.rent_price} onChange={handleChange} required />
                </label>

                <label>
                  Rent Period
                  <select name="rent_period" value={form.rent_period} onChange={handleChange}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>

                <label>
                  Currency
                  <select name="currency" value={form.currency} onChange={handleChange}>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </label>
              </div>

              <label>
                Location
                <input type="text" name="location" value={form.location} onChange={handleChange} required />
              </label>

              <div className="admin-rent__row admin-rent__row--three">
                <label>
                  Bedrooms
                  <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} />
                </label>

                <label>
                  Bathrooms
                  <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} />
                </label>

                <label>
                  Size (sqft)
                  <input type="number" name="size_sqft" value={form.size_sqft} onChange={handleChange} required />
                </label>
              </div>

              <label>
                Developer
                <input type="text" name="developer" value={form.developer} onChange={handleChange} />
              </label>

              <label className="admin-rent__checkbox">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                Featured
              </label>

              <label>
                {isEditing ? "Add More Images (optional)" : "Images (first image becomes cover)"}
                <input type="file" name="images" accept="image/*" multiple onChange={handleChange} />
              </label>

              <button type="submit">
                {isEditing ? "Save Changes" : "Add Rental Property"}
              </button>
            </form>
          )}
          {status && <p className="admin-rent__status">{status}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminAddRent;