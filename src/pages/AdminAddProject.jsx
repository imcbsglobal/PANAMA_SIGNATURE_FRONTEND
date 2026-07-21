import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminAddProject.scss";
import api from "../api/api";
import Sidebar from "../components/sidebar";

function AdminAddProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    developer: "",
    description: "",
    property_types: "",
    status: "ready",
    starting_price: "",
    currency: "USD",
    location: "",
    bedroom_range: "",
    is_featured: false,
    images: [],
  });
  const [status, setStatus] = useState("");

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
    setStatus("Saving...");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => data.append("images", file));
      } else {
        data.append(key, value);
      }
    });

    try {
      await api.createProject(data);
      setStatus("Project added successfully!");
      setForm({
        title: "",
        slug: "",
        developer: "",
        description: "",
        property_types: "",
        status: "ready",
        starting_price: "",
        currency: "USD",
        location: "",
        bedroom_range: "",
        is_featured: false,
        images: [],
      });
    } catch (err) {
      setStatus("Error saving project.");
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-project">
        <div className="admin-project__card">
          <div className="admin-project__header">
            <div>
              <span className="admin-project__eyebrow">Panama Signature</span>
              <h1>Add Project</h1>
            </div>
            <button
              type="button"
              className="admin-project__manage-btn"
              onClick={() => navigate("/manageprojects")}
            >
              Manage Property
            </button>
          </div>
          <div className="admin-project__divider" />

          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input type="text" name="title" value={form.title} onChange={handleChange} required />
            </label>

            <label>
              Slug (unique URL id, e.g. serenia-living-palm-jumeirah)
              <input type="text" name="slug" value={form.slug} onChange={handleChange} required />
            </label>

            <label>
              Developer
              <input type="text" name="developer" value={form.developer} onChange={handleChange} />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
            </label>

            <label>
              Property Types (comma-separated, e.g. Penthouse,Apartment)
              <input type="text" name="property_types" value={form.property_types} onChange={handleChange} />
            </label>

            <div className="admin-project__row">
              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="ready">Ready</option>
                  <option value="off_plan">Off-Plan</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="launching_soon">Launching Soon</option>
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
               Price
              <input type="number" step="0.01" name="starting_price" value={form.starting_price} onChange={handleChange} required />
            </label>

            <label>
              Location
              <input type="text" name="location" value={form.location} onChange={handleChange} required />
            </label>

            <label>
              Bedroom Range (comma-separated, e.g. 1,2,3,4)
              <input type="text" name="bedroom_range" value={form.bedroom_range} onChange={handleChange} />
            </label>

            <label className="admin-project__checkbox">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
              Featured
            </label>

            <label>
              Images (first image becomes cover)
              <input type="file" name="images" accept="image/*" multiple onChange={handleChange} />
            </label>

            <button type="submit">Add Project</button>
          </form>
          {status && <p className="admin-project__status">{status}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminAddProject;