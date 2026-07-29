// panama-signature/src/pages/AdminTeam.jsx
import { useEffect, useRef, useState } from "react";
import "../styles/AdminTeam.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import Sidebar from "../components/sidebar";

const emptyForm = { name: "", designation: "", bio: "", photo: null };

function AdminTeam() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const loadAgents = async () => {
    try {
      const data = await api.getAllAgents();
      setAgents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setExistingPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditClick = (agent) => {
    setEditingId(agent.id);
    setExistingPhoto(agent.photo || null);
    setForm({
      name: agent.name || "",
      designation: agent.designation || "",
      bio: agent.bio || "",
      photo: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      await api.deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to delete team member.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(editingId ? "Updating..." : "Saving...");

    const data = new FormData();
    data.append("name", form.name);
    data.append("designation", form.designation);
    data.append("bio", form.bio);
    if (form.photo) data.append("photo", form.photo);

    try {
      if (editingId) {
        const updated = await api.updateAgent(editingId, data);
        setAgents((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        setStatus("Team member updated successfully!");
      } else {
        const created = await api.createAgent(data);
        setAgents((prev) => [...prev, created]);
        setStatus("Team member added successfully!");
      }
      resetForm();
    } catch (err) {
      setStatus(editingId ? "Error updating team member." : "Error saving team member.");
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-team">
        <div className="admin-team__card">
          <span className="admin-team__eyebrow">Panama Signature</span>
          <h1>{editingId ? "Edit Team Member" : "Add Team Member"}</h1>
          <div className="admin-team__divider" />

          <form onSubmit={handleSubmit}>
            <label>
              Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Designation
              <input type="text" name="designation" value={form.designation} onChange={handleChange} />
            </label>

            {/* <label>
              Bio
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
            </label> */}

            <label>
              Photo {editingId && "(leave empty to keep current)"}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                ref={fileInputRef}
              />
            </label>

            {editingId && existingPhoto && (
              <div className="admin-team__current-photo">
                <img src={resolveImage(existingPhoto)} alt="Current" />
              </div>
            )}

            <div className="admin-team__form-actions">
              <button type="submit">{editingId ? "Update Team Member" : "Add Team Member"}</button>
              {editingId && (
                <button type="button" className="admin-team__cancel" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          {status && <p className="admin-team__status">{status}</p>}
        </div>

        <div className="admin-team__list-card">
          <h2>Team Members</h2>

          {loading && <p className="admin-team__empty">Loading...</p>}
          {!loading && agents.length === 0 && (
            <p className="admin-team__empty">No team members added yet.</p>
          )}

          <div className="admin-team__list">
            {agents.map((agent) => (
              <div className="admin-team__item" key={agent.id}>
                <div className="admin-team__item-photo">
                  {agent.photo ? (
                    <img src={resolveImage(agent.photo)} alt={agent.name} />
                  ) : (
                    <div className="admin-team__item-photo--placeholder">
                      {agent.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                <div className="admin-team__item-info">
                  <span className="admin-team__item-name">
                    {agent.name}
                    {/* {!agent.is_active && <span className="admin-team__badge">Inactive</span>} */}
                  </span>
                  <span className="admin-team__item-designation">{agent.designation}</span>
                  {/* {agent.bio && <p className="admin-team__item-bio">{agent.bio}</p>} */}
                </div>

                <div className="admin-team__item-actions">
                  <button onClick={() => handleEditClick(agent)}>Edit</button>
                  <button className="admin-team__delete" onClick={() => handleDelete(agent.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTeam;