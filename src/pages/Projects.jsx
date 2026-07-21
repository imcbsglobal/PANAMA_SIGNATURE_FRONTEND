import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Projects.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaThLarge,
  FaList,
  FaRedo,
  FaFilter,
} from "react-icons/fa";

const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Commercial"];
const PAGE_SIZE = 8;

// Maps the Project.status value (sent by AdminAddProject.jsx) to display label + badge style
const STATUS_LABELS = {
  ready: "Ready",
  off_plan: "Off-Plan",
  under_construction: "Under Construction",
  launching_soon: "Launching Soon",
};

function getStatusLabel(project) {
  return STATUS_LABELS[project.status] || project.status || "Ready";
}

function ProjectCard({ project, onView, listView }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = project.images && project.images.length > 0 ? project.images : [];
  const statusLabel = getStatusLabel(project);

  const prevImage = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const beds = project.bedroom_range
    ? project.bedroom_range.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  return (
    <article
      className={`project-tile ${listView ? "projects-list-row" : ""}`}
      onClick={() => onView && onView(project)}
    >
      <div className="project-tile__image-wrap">
        <div className="project-tile__image-inner">
          {images.length > 0 ? (
            <img src={resolveImage(images[imgIndex].image)} alt={project.title} />
          ) : (
            <div className="project-tile__image-placeholder" />
          )}
        </div>

        <span className={`project-tile__badge project-tile__badge--${project.status || "ready"}`}>
          {statusLabel}
        </span>

        {beds.length > 0 && (
          <span className="project-tile__beds-badge">
            <FaBed /> {beds.join("-")}BHK
          </span>
        )}

        {images.length > 1 && (
          <>
            <button className="project-tile__nav project-tile__nav--prev" onClick={prevImage} aria-label="Previous image">
              <FaChevronLeft />
            </button>
            <button className="project-tile__nav project-tile__nav--next" onClick={nextImage} aria-label="Next image">
              <FaChevronRight />
            </button>
            <div className="project-tile__dots">
              {images.map((_, i) => (
                <span key={i} className={`project-tile__dot ${i === imgIndex ? "active" : ""}`} />
              ))}
            </div>
          </>
        )}

        {(project.bathroom_range || project.sqft) && (
          <div className="project-tile__feature-row">
            {project.bathroom_range && (
              <span>
                <FaBath /> {project.bathroom_range} Baths
              </span>
            )}
            {project.sqft && (
              <span>
                <FaRulerCombined /> {Number(project.sqft).toLocaleString()} sqft
              </span>
            )}
          </div>
        )}
      </div>

      <div className="project-tile__body">
        <h3 className="project-tile__title">{project.title}</h3>
        <p className="project-tile__location">
          <FaMapMarkerAlt /> {project.location}
        </p>

        {project.description && (
          <p className="project-tile__desc">{project.description}</p>
        )}

        <div className="project-tile__footer">
          <span className="project-tile__price">
            {project.currency} {Number(project.starting_price).toLocaleString()}
          </span>
          <button
            className="project-tile__cta"
            onClick={(e) => {
              e.stopPropagation();
              onView && onView(project);
            }}
          >
            View Details <FaChevronRight />
          </button>
        </div>
      </div>
    </article>
  );
}

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [bedroomFilter, setBedroomFilter] = useState("");
  const [bathroomFilter, setBathroomFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  const [appliedFilters, setAppliedFilters] = useState({
    typeFilter: "",
    statusFilter: "",
    maxPrice: 5000000,
    bedroomFilter: "",
    bathroomFilter: "",
  });

  useEffect(() => {
    api.getProjects()
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to load projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const resetFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setMaxPrice(5000000);
    setBedroomFilter("");
    setBathroomFilter("");
    setAppliedFilters({
      typeFilter: "",
      statusFilter: "",
      maxPrice: 5000000,
      bedroomFilter: "",
      bathroomFilter: "",
    });
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters({ typeFilter, statusFilter, maxPrice, bedroomFilter, bathroomFilter });
    setPage(1);
  };

  const filteredProjects = projects
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !appliedFilters.typeFilter || (p.property_types || "").toLowerCase().includes(appliedFilters.typeFilter.toLowerCase()))
    .filter((p) => !appliedFilters.statusFilter || p.status === appliedFilters.statusFilter)
    .filter((p) => Number(p.starting_price) <= appliedFilters.maxPrice)
    .filter((p) => {
      if (!appliedFilters.bedroomFilter) return true;
      const beds = (p.bedroom_range || "").split(",").map((b) => b.trim());
      return beds.some((b) => b === appliedFilters.bedroomFilter || (appliedFilters.bedroomFilter === "4+" && Number(b) >= 4));
    })
    .filter((p) => {
      if (!appliedFilters.bathroomFilter) return true;
      return String(p.bathroom_range || "").includes(appliedFilters.bathroomFilter);
    })
    .sort((a, b) => {
      if (sort === "price_low") return Number(a.starting_price) - Number(b.starting_price);
      if (sort === "price_high") return Number(b.starting_price) - Number(a.starting_price);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const pagedProjects = filteredProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleViewProject = (project) => {
    navigate(`/property/${project.slug}`);
  };

  const renderPageButtons = () => {
    const buttons = [];
    const windowSize = 3;
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);

    if (start > 1) {
      buttons.push(
        <button key={1} className={page === 1 ? "is-active" : ""} onClick={() => setPage(1)}>1</button>
      );
      if (start > 2) buttons.push(<span key="dots-start" className="projects-pagination__dots">...</span>);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button key={i} className={page === i ? "is-active" : ""} onClick={() => setPage(i)}>{i}</button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) buttons.push(<span key="dots-end" className="projects-pagination__dots">...</span>);
      buttons.push(
        <button key={totalPages} className={page === totalPages ? "is-active" : ""} onClick={() => setPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <h1>All Properties</h1>
          <p>Discover your perfect property from our curated listings.</p>
        </div>
        <div className="projects-header__breadcrumb">
          Home &nbsp;&gt;&nbsp; <span>Properties</span>
        </div>
      </header>

      <div className="projects-layout">
        <aside className="projects-sidebar">
          <div className="projects-sidebar__header">
            <h3>Filters</h3>
            <button onClick={resetFilters}>
              <FaRedo /> Reset All
            </button>
          </div>

          <div className="projects-sidebar__section">
            <h4>Property Type</h4>
            <label className={`projects-sidebar__checkbox ${typeFilter === "" ? "is-active" : ""}`}>
              <input type="checkbox" checked={typeFilter === ""} onChange={() => setTypeFilter("")} />
              All Types
            </label>
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className={`projects-sidebar__checkbox ${typeFilter === type.toLowerCase() ? "is-active" : ""}`}>
                <input
                  type="checkbox"
                  checked={typeFilter === type.toLowerCase()}
                  onChange={() => setTypeFilter(typeFilter === type.toLowerCase() ? "" : type.toLowerCase())}
                />
                {type}
              </label>
            ))}
          </div>

          <div className="projects-sidebar__section">
            <h4>Status</h4>
            <select className="projects-sidebar__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="ready">Ready</option>
              <option value="off_plan">Off-Plan</option>
              <option value="under_construction">Under Construction</option>
              <option value="launching_soon">Launching Soon</option>
            </select>
          </div>

          <div className="projects-sidebar__section">
            <h4>Price Range</h4>
            <div className="projects-sidebar__range">
              $0 - ${maxPrice.toLocaleString()}+
            </div>
            <input
              type="range"
              className="projects-sidebar__slider"
              min="50000"
              max="5000000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>

          <div className="projects-sidebar__section">
            <h4>Bedrooms</h4>
            <select className="projects-sidebar__select" value={bedroomFilter} onChange={(e) => setBedroomFilter(e.target.value)}>
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4+">4+</option>
            </select>
          </div>

          <div className="projects-sidebar__section" style={{ borderBottom: "none" }}>
            <h4>Bathrooms</h4>
            <select className="projects-sidebar__select" value={bathroomFilter} onChange={(e) => setBathroomFilter(e.target.value)}>
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4+">4+</option>
            </select>
          </div>

          <button className="projects-sidebar__apply" onClick={applyFilters}>
            <FaFilter /> Apply Filters
          </button>
        </aside>

        <main className="projects-main">
          <div className="projects-toolbar">
            <span className="projects-toolbar__count">
              {filteredProjects.length} {filteredProjects.length === 1 ? "Property" : "Properties"} Found
            </span>

            <div className="projects-toolbar__right">
              <div className="projects-toolbar__search">
                <FaSearch />
                <input
                  placeholder="Search by name, location..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Sort by: Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>

              <div className="projects-toolbar__viewtoggle">
                <button className={viewMode === "grid" ? "is-active" : ""} onClick={() => setViewMode("grid")} aria-label="Grid view">
                  <FaThLarge />
                </button>
                <button className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")} aria-label="List view">
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {loading && <p className="projects-status">Loading properties...</p>}
          {!loading && filteredProjects.length === 0 && (
            <p className="projects-status">No properties listed yet.</p>
          )}

          <div className={`projects-grid ${viewMode === "list" ? "is-list" : ""}`}>
            {pagedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                listView={viewMode === "list"}
              />
            ))}
          </div>

          {!loading && filteredProjects.length > 0 && (
            <div className="projects-pagination">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <FaChevronLeft />
              </button>
              {renderPageButtons()}
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <FaChevronRight />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Projects;