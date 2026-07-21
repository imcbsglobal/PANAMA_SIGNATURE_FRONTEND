// panama-signature/src/pages/AdminBuy.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/AdminBuy.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import Sidebar from "../components/sidebar";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  property_type: "apartment",
  status: "available",
  price: "",
  currency: "USD",
  address: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
  bedrooms: "",
  bathrooms: "",
  size_sqft: "",
  year_built: "",
  parking_spaces: "",
  furnished: "",
  developer: "",
  is_featured: false,
  images: [],
};

function AdminBuy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const isEditMode = Boolean(editSlug);

  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [status, setStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;
    api
      .getPropertyBySlug(editSlug)
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          property_type: data.property_type || "apartment",
          status: data.status || "available",
          price: data.price || "",
          currency: data.currency || "USD",
          address: data.location || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          zip_code: data.zip_code || "",
          bedrooms: data.bedrooms || "",
          bathrooms: data.bathrooms || "",
          size_sqft: data.size_sqft || "",
          year_built: data.year_built || "",
          parking_spaces: data.parking_spaces || "",
          furnished: data.furnished || "",
          developer: data.developer || "",
          is_featured: data.is_featured || false,
          images: [],
        });
        setExistingImages(data.images || []);
      })
      .catch((err) => {
        console.error(err);
        setStatus("Failed to load property for editing.");
      })
      .finally(() => setLoadingEdit(false));
  }, [isEditMode, editSlug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addImages = (fileList) => {
    const files = Array.from(fileList);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) addImages(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setForm(emptyForm);
    setPreviews([]);
  };

  const buildFormData = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => data.append("images", file));
      } else if (key === "address") {
        data.append("location", value);
      } else {
        data.append(key, value);
      }
    });
    return data;
  };

  const submitProperty = async (asDraft = false) => {
    setStatus(asDraft ? "Saving draft..." : "Saving...");
    const data = buildFormData();
    if (asDraft) data.append("is_draft", "true");

    try {
      if (isEditMode) {
        await api.updateProperty(editSlug, data);
        setStatus("Property updated successfully!");
        navigate("/manage-property-admin");
      } else {
        await api.createProperty(data);
        setStatus(asDraft ? "Draft saved!" : "Property added successfully!");
        resetForm();
      }
    } catch (err) {
      setStatus("Error saving property.");
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitProperty(false);
  };

  if (loadingEdit) {
    return (
      <div className="admin-page">
        <Sidebar />
        <div className="admin-buy">
          <p className="admin-buy__status">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-buy">
        <div className="admin-buy__header">
          <div className="admin-buy__header-left">
            <div className="admin-buy__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21V8L12 3L21 8V21H14V14H10V21H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1>{isEditMode ? "Edit Property" : "Add Property"}</h1>
              <p>Create a new property listing and manage all details in one place.</p>
            </div>
          </div>
          <button
            type="button"
            className="admin-buy__back"
            onClick={() => navigate("/manage-property-admin")}
          >
            <span>&larr;</span> Manage Property
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-buy__grid">
            <div className="admin-buy__col">
              <section className="admin-buy__section">
                <h2>
                  <span className="admin-buy__num">1</span> Basic Information
                </h2>

                <div className="admin-buy__row">
                  <label>
                    Title <span className="req">*</span>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter property title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Slug (Unique URL ID) <span className="req">*</span>
                    <input
                      type="text"
                      name="slug"
                      placeholder="e.g. tilal-binghatti"
                      value={form.slug}
                      onChange={handleChange}
                      required
                      disabled={isEditMode}
                    />
                  </label>
                </div>

                <label>
                  Description <span className="req">*</span>
                  <textarea
                    name="description"
                    placeholder="Enter property description..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={900}
                    required
                  />
                  <span className="admin-buy__charcount">
                    {form.description.length} / 900
                  </span>
                </label>
              </section>

              <section className="admin-buy__section">
                <h2>
                  <span className="admin-buy__num">2</span> Property Details
                </h2>

                <div className="admin-buy__row">
                  <label>
                    Property Type <span className="req">*</span>
                    <select name="property_type" value={form.property_type} onChange={handleChange}>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="off_plan">Off-Plan</option>
                    </select>
                  </label>
                  <label>
                    Status <span className="req">*</span>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="available">Available</option>
                      <option value="exclusive">Exclusive</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="launching_soon">Launching Soon</option>
                    </select>
                  </label>
                </div>

                <div className="admin-buy__row">
                  <label>
                    Price <span className="req">*</span>
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Currency <span className="req">*</span>
                    <select name="currency" value={form.currency} onChange={handleChange}>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="EUR">EUR</option>
                      <option value="INR">INR</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="admin-buy__section">
                <h2>
                  <span className="admin-buy__num">3</span> Location
                </h2>

                <label>
                  Address <span className="req">*</span>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter full address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </label>

                <div className="admin-buy__row admin-buy__row--three">
                  <label>
                    City
                    <input type="text" name="city" placeholder="Enter city" value={form.city} onChange={handleChange} />
                  </label>
                  <label>
                    State / Province
                    <input type="text" name="state" placeholder="Enter state or province" value={form.state} onChange={handleChange} />
                  </label>
                  <label>
                    Country
                    <select name="country" value={form.country} onChange={handleChange}>
                      <option value="">Select country</option>
                      <option value="UAE">United Arab Emirates</option>
                      <option value="USA">United States</option>
                      <option value="IN">India</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </label>
                </div>

                <label className="admin-buy__half">
                  Zip / Postal Code
                  <input
                    type="text"
                    name="zip_code"
                    placeholder="Enter zip or postal code"
                    value={form.zip_code}
                    onChange={handleChange}
                  />
                </label>
              </section>
            </div>

            <div className="admin-buy__col">
              <section className="admin-buy__section">
                <h2>
                  <span className="admin-buy__num">4</span> Property Images
                </h2>

                {existingImages.length > 0 && (
                  <div className="admin-buy__previews">
                    {existingImages.map((img) => (
                      <div className="admin-buy__preview" key={img.id}>
                        <img
                          src={resolveImage(img.image)}
                          alt="existing"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`admin-buy__dropzone${dragActive ? " admin-buy__dropzone--active" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7 18a4 4 0 01-.6-7.95A5.5 5.5 0 0117.5 9a4 4 0 01.5 7.94M12 12v7m0-7l-2.5 2.5M12 12l2.5 2.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p>Drag &amp; drop images here</p>
                  <span>or</span>
                  <button type="button" className="admin-buy__browse">
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleFileInput}
                  />
                </div>
                <p className="admin-buy__hint">
                  Upload high-quality images. Max size 5MB each.
                  <br />
                  Supported formats: JPG, PNG, WEBP.
                </p>

                {previews.length > 0 && (
                  <div className="admin-buy__previews">
                    {previews.map((p, i) => (
                      <div className="admin-buy__preview" key={p.url}>
                        <img src={p.url} alt={`preview-${i}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-buy__section">
                <h2>
                  <span className="admin-buy__num">5</span> Specifications
                </h2>

                <div className="admin-buy__row">
                  <label>
                    Bedrooms
                    <input type="number" name="bedrooms" placeholder="e.g. 3" value={form.bedrooms} onChange={handleChange} />
                  </label>
                  <label>
                    Bathrooms
                    <input type="number" name="bathrooms" placeholder="e.g. 2" value={form.bathrooms} onChange={handleChange} />
                  </label>
                </div>

                <div className="admin-buy__row">
                  <label>
                    Size (Sqft)
                    <input type="number" name="size_sqft" placeholder="e.g. 1200" value={form.size_sqft} onChange={handleChange} />
                  </label>
                  <label>
                    Year Built
                    <input type="number" name="year_built" placeholder="e.g. 2024" value={form.year_built} onChange={handleChange} />
                  </label>
                </div>

                <div className="admin-buy__row">
                  <label>
                    Parking Spaces
                    <input type="number" name="parking_spaces" placeholder="e.g. 2" value={form.parking_spaces} onChange={handleChange} />
                  </label>
                  <label>
                    Furnished
                    <select name="furnished" value={form.furnished} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="furnished">Furnished</option>
                      <option value="semi_furnished">Semi-Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </label>
                </div>

                <label>
                  Developer
                  <input type="text" name="developer" placeholder="Enter developer name" value={form.developer} onChange={handleChange} />
                </label>

                <label className="admin-buy__checkbox">
                  <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                  Featured
                </label>
              </section>
            </div>
          </div>

          <div className="admin-buy__footer">
            {status && <p className="admin-buy__status">{status}</p>}
            <div className="admin-buy__actions">
              {!isEditMode && (
                <button type="button" className="admin-buy__draft" onClick={() => submitProperty(true)}>
                  Save as Draft
                </button>
              )}
              <button type="submit" className="admin-buy__submit">
                {isEditMode ? "Update Property" : "Save Property"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminBuy;