import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/manageprojects.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import Sidebar from "../components/sidebar";

function ManageProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState(null);

  const [editingSlug, setEditingSlug] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    api
      .getProjects()
      .then((data) => setProjects(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load projects.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this project permanently?")) return;
    setDeletingSlug(slug);
    try {
      await api.deleteProject(slug);
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      console.error(err);
      setError("Failed to delete project.");
    } finally {
      setDeletingSlug(null);
    }
  };

  const startEdit = (project) => {
    setEditingSlug(project.slug);
    setEditForm({
      title: project.title || "",
      slug: project.slug || "",
      developer: project.developer || "",
      description: project.description || "",
      property_types: project.property_types || "",
      status: project.status || "ready",
      starting_price: project.starting_price || "",
      currency: project.currency || "USD",
      location: project.location || "",
      bedroom_range: project.bedroom_range || "",
      is_featured: project.is_featured || false,
      images: [],
      existingImages: project.images ? [...project.images] : [],
      removedImageIds: [],
    });
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setEditForm(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setEditForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setEditForm((prev) => ({ ...prev, images: Array.from(files) }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveExistingImage = (imageId) => {
    setEditForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img.id !== imageId),
      removedImageIds: [...prev.removedImageIds, imageId],
    }));
  };

  const handleRemoveNewImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async (slug) => {
    setSaving(true);
    setError("");
    const data = new FormData();

    Object.entries(editForm).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => data.append("images", file));
      } else if (key === "existingImages") {
        // not sent as-is; used only to render current state
      } else if (key === "removedImageIds") {
        if (value.length > 0) {
          data.append("removed_images", JSON.stringify(value));
        }
      } else {
        data.append(key, value);
      }
    });

    try {
      await api.updateProject(slug, data);
      setEditingSlug(null);
      setEditForm(null);
      loadProjects();
    } catch (err) {
      console.error(err);
      setError("Failed to update project.");
    } finally {
      setSaving(false);
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
              <h1>Manage Projects</h1>
              <p>View, edit, or remove listed projects.</p>
            </div>
          </div>
          <button type="button" className="manage-property__add" onClick={() => navigate("/admin-project")}>
            + Add Project
          </button>
        </div>

        {error && <p className="manage-property__error">{error}</p>}
        {loading && <p className="manage-property__loading">Loading projects...</p>}
        {!loading && projects.length === 0 && (
          <p className="manage-property__empty">No projects added yet.</p>
        )}

        <div className="manage-property__grid">
          {projects.map((project) => {
            if (editingSlug === project.slug) {
              return (
                <div className="manage-property__card manage-property__card--editing" key={project.id}>
                  <div className="manage-property__edit-form">
                    <label>
                      Title
                      <input type="text" name="title" value={editForm.title} onChange={handleEditChange} />
                    </label>

                    <label>
                      Slug
                      <input type="text" name="slug" value={editForm.slug} onChange={handleEditChange} />
                    </label>

                    <label>
                      Developer
                      <input type="text" name="developer" value={editForm.developer} onChange={handleEditChange} />
                    </label>

                    <label>
                      Description
                      <textarea name="description" rows={3} value={editForm.description} onChange={handleEditChange} />
                    </label>

                    <label>
                      Property Types (comma-separated)
                      <input
                        type="text"
                        name="property_types"
                        value={editForm.property_types}
                        onChange={handleEditChange}
                      />
                    </label>

                    <div className="manage-property__edit-row">
                      <label>
                        Status
                        <select name="status" value={editForm.status} onChange={handleEditChange}>
                          <option value="ready">Ready</option>
                          <option value="off_plan">Off-Plan</option>
                          <option value="under_construction">Under Construction</option>
                          <option value="launching_soon">Launching Soon</option>
                        </select>
                      </label>

                      <label>
                        Currency
                        <select name="currency" value={editForm.currency} onChange={handleEditChange}>
                          <option value="USD">USD</option>
                          <option value="AED">AED</option>
                          <option value="EUR">EUR</option>
                          <option value="INR">INR</option>
                        </select>
                      </label>
                    </div>

                    <label>
                      Starting Price
                      <input
                        type="number"
                        step="0.01"
                        name="starting_price"
                        value={editForm.starting_price}
                        onChange={handleEditChange}
                      />
                    </label>

                    <label>
                      Location
                      <input type="text" name="location" value={editForm.location} onChange={handleEditChange} />
                    </label>

                    <label>
                      Bedroom Range (comma-separated)
                      <input
                        type="text"
                        name="bedroom_range"
                        value={editForm.bedroom_range}
                        onChange={handleEditChange}
                      />
                    </label>

                    <label className="manage-property__edit-checkbox">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={editForm.is_featured}
                        onChange={handleEditChange}
                      />
                      Featured
                    </label>

                    {editForm.existingImages.length > 0 && (
                      <div className="manage-property__existing-images">
                        <span className="manage-property__existing-images-label">Current Images</span>
                        <div className="manage-property__thumb-grid">
                          {editForm.existingImages.map((img) => (
                            <div className="manage-property__thumb" key={img.id}>
                              <img src={resolveImage(img.image)} alt="" />
                              {img.is_cover && (
                                <span className="manage-property__thumb-cover">Cover</span>
                              )}
                              <button
                                type="button"
                                className="manage-property__thumb-remove"
                                onClick={() => handleRemoveExistingImage(img.id)}
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <label>
                      Add Images
                      <input type="file" name="images" accept="image/*" multiple onChange={handleEditChange} />
                    </label>

                    {editForm.images.length > 0 && (
                      <div className="manage-property__thumb-grid">
                        {editForm.images.map((file, index) => (
                          <div className="manage-property__thumb" key={`${file.name}-${index}`}>
                            <img src={URL.createObjectURL(file)} alt="" />
                            <button
                              type="button"
                              className="manage-property__thumb-remove"
                              onClick={() => handleRemoveNewImage(index)}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="manage-property__actions">
                      <button
                        type="button"
                        className="manage-property__edit-btn"
                        onClick={() => handleUpdate(project.slug)}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button type="button" className="manage-property__delete-btn" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            const cover =
              project.images && project.images.length > 0
                ? project.images.find((img) => img.is_cover)?.image || project.images[0].image
                : null;
            const coverUrl = resolveImage(cover);

            return (
              <div className="manage-property__card" key={project.id}>
                <div className="manage-property__image-wrap">
                  {coverUrl ? (
                    <img src={coverUrl} alt={project.title} />
                  ) : (
                    <div className="manage-property__image-placeholder" />
                  )}
                  <span className="manage-property__status-badge">{project.status}</span>
                </div>

                <div className="manage-property__body">
                  <h3>{project.title}</h3>
                  <p className="manage-property__location">{project.location}</p>
                  <p className="manage-property__price">
                    {project.currency} {Number(project.starting_price).toLocaleString()}
                  </p>
                  <div className="manage-property__meta">
                    {project.developer && <span>{project.developer}</span>}
                    {project.bedroom_range && <span>{project.bedroom_range} bd</span>}
                  </div>

                  <div className="manage-property__actions">
                    <button type="button" className="manage-property__edit-btn" onClick={() => startEdit(project)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="manage-property__delete-btn"
                      onClick={() => handleDelete(project.slug)}
                      disabled={deletingSlug === project.slug}
                    >
                      {deletingSlug === project.slug ? "Deleting..." : "Delete"}
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

export default ManageProjects;