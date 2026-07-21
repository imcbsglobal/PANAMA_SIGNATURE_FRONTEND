import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Buy.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import {
  FaSearch,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaBed,
  FaListUl,
  FaRegMap,
  FaStar,
} from "react-icons/fa";

const STATUS_LABELS = {
  exclusive: "Exclusive",
  sold_out: "Sold Out",
  launching_soon: "Launching Soon",
  available: "Available",
};

const TYPE_LABELS = {
  apartment: "Apartment",
  villa: "Villa",
  townhouse: "Townhouse",
  penthouse: "Penthouse",
  off_plan: "Off-Plan",
};

const BED_OPTIONS = ["Studio", "1", "2", "3", "4", "5+"];

function PropertyCard({ property, onOpen }) {
  const images = property.images && property.images.length > 0 ? property.images : [];
  const total = images.length;
  const [index, setIndex] = useState(0);

  const badgeText =
    property.handover_date
      ? new Date(property.handover_date).getFullYear()
      : property.year_built || STATUS_LABELS[property.status] || property.status;

  const showPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + total) % total);
  };

  const showNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="buy-property-card" onClick={() => onOpen(property.slug)}>
      <div className="buy-property-card__image-wrap">
        {total > 0 ? (
          <img src={resolveImage(images[index].image)} alt={property.title} />
        ) : (
          <div className="buy-property-card__image-placeholder" />
        )}

        <span className="buy-property-card__type-badge">{property.property_type}</span>
        <span className="buy-property-card__year-badge">{badgeText}</span>

        {total > 1 && (
          <>
            <button className="buy-property-card__nav buy-property-card__nav--prev" onClick={showPrev}>
              <FaChevronLeft />
            </button>
            <button className="buy-property-card__nav buy-property-card__nav--next" onClick={showNext}>
              <FaChevronRight />
            </button>
            <div className="buy-property-card__dots" onClick={(e) => e.stopPropagation()}>
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`buy-property-card__dot ${i === index ? "buy-property-card__dot--active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="buy-property-card__body">
        {property.is_featured && (
          <span className="buy-property-card__featured-tag">
            <FaStar /> Featured
          </span>
        )}
        <h3 title={property.title}>{property.title}</h3>
        {property.developer && (
          <p className="buy-property-card__developer">
            by <strong>{property.developer}</strong>
          </p>
        )}

        <p className="buy-property-card__price">
          <span className="buy-property-card__price-label">Starting Price</span>
          {property.currency} {Number(property.price).toLocaleString()}
        </p>

        <div className="buy-property-card__meta">
          <span className="buy-property-card__meta-item" title={property.location}>
            <FaMapMarkerAlt /> {property.location}
          </span>
          <span className="buy-property-card__meta-item">
            <FaBed /> {property.bedrooms}
          </span>
        </div>
      </div>
    </div>
  );
}

// Generic dropdown wrapper: closes on outside click
function FilterDropdown({ label, isActive, isOpen, onToggle, children }) {
  return (
    <div className="buy-filterbar__dropdown-wrap">
      <button
        type="button"
        className={`buy-filterbar__dropdown ${isActive ? "buy-filterbar__dropdown--active" : ""}`}
        onClick={onToggle}
      >
        {label} <FaChevronDown />
      </button>
      {isOpen && <div className="buy-filterbar__panel">{children}</div>}
    </div>
  );
}

function Buy() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---- filter state ----
  const [searchText, setSearchText] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); // 'types' | 'price' | 'beds' | 'status' | 'developers' | 'filters' | null

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [minBathrooms, setMinBathrooms] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [sortOrder, setSortOrder] = useState("recent");

  const wrapRef = useRef(null);

  useEffect(() => {
    api.getProperties()
      .then((data) => setProperties(data))
      .catch((err) => console.error("Failed to load properties:", err))
      .finally(() => setLoading(false));
  }, []);

  // close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const toggleInArray = (arr, setArr, value) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const developerOptions = useMemo(() => {
    const devs = properties.map((p) => p.developer).filter(Boolean);
    return [...new Set(devs)].sort();
  }, [properties]);

  const bedMatches = (property, bedFilter) => {
    if (bedFilter === "Studio") return Number(property.bedrooms) === 0;
    if (bedFilter === "5+") return Number(property.bedrooms) >= 5;
    return Number(property.bedrooms) === Number(bedFilter);
  };

  const handleCardClick = (slug) => {
    navigate(`/buy/${slug}`);
  };

  const clearAllFilters = () => {
    setSearchText("");
    setSelectedTypes([]);
    setPriceMin("");
    setPriceMax("");
    setSelectedBeds([]);
    setSelectedStatus([]);
    setSelectedDevelopers([]);
    setMinBathrooms("");
    setFeaturedOnly(false);
    setSortOrder("recent");
    setOpenDropdown(null);
  };

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const haystack = `${p.location || ""} ${p.title || ""} ${p.developer || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(p.property_type)) return false;

      if (priceMin && Number(p.price) < Number(priceMin)) return false;
      if (priceMax && Number(p.price) > Number(priceMax)) return false;

      if (selectedBeds.length > 0 && !selectedBeds.some((b) => bedMatches(p, b))) return false;

      if (selectedStatus.length > 0 && !selectedStatus.includes(p.status)) return false;

      if (selectedDevelopers.length > 0 && !selectedDevelopers.includes(p.developer)) return false;

      if (minBathrooms && Number(p.bathrooms) < Number(minBathrooms)) return false;

      if (featuredOnly && !p.is_featured) return false;

      return true;
    });

    if (sortOrder === "price_asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === "price_desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [
    properties,
    searchText,
    selectedTypes,
    priceMin,
    priceMax,
    selectedBeds,
    selectedStatus,
    selectedDevelopers,
    minBathrooms,
    featuredOnly,
    sortOrder,
  ]);

  const activeFilterCount =
    selectedTypes.length +
    selectedBeds.length +
    selectedStatus.length +
    selectedDevelopers.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0) +
    (minBathrooms ? 1 : 0) +
    (featuredOnly ? 1 : 0);

  return (
    <div className="buy-page">
      <div className="buy-filterbar" ref={wrapRef}>
        <div className="buy-filterbar__search">
          <FaSearch />
          <input
            placeholder="Area, project or community"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <FilterDropdown
          label="All Types"
          isActive={selectedTypes.length > 0}
          isOpen={openDropdown === "types"}
          onToggle={() => toggleDropdown("types")}
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <label key={value} className="buy-filterbar__option">
              <input
                type="checkbox"
                checked={selectedTypes.includes(value)}
                onChange={() => toggleInArray(selectedTypes, setSelectedTypes, value)}
              />
              {label}
            </label>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Price"
          isActive={!!priceMin || !!priceMax}
          isOpen={openDropdown === "price"}
          onToggle={() => toggleDropdown("price")}
        >
          <div className="buy-filterbar__range">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
        </FilterDropdown>

        <FilterDropdown
          label="Beds"
          isActive={selectedBeds.length > 0}
          isOpen={openDropdown === "beds"}
          onToggle={() => toggleDropdown("beds")}
        >
          {BED_OPTIONS.map((b) => (
            <label key={b} className="buy-filterbar__option">
              <input
                type="checkbox"
                checked={selectedBeds.includes(b)}
                onChange={() => toggleInArray(selectedBeds, setSelectedBeds, b)}
              />
              {b}
            </label>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="All Status"
          isActive={selectedStatus.length > 0}
          isOpen={openDropdown === "status"}
          onToggle={() => toggleDropdown("status")}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <label key={value} className="buy-filterbar__option">
              <input
                type="checkbox"
                checked={selectedStatus.includes(value)}
                onChange={() => toggleInArray(selectedStatus, setSelectedStatus, value)}
              />
              {label}
            </label>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="All Developers"
          isActive={selectedDevelopers.length > 0}
          isOpen={openDropdown === "developers"}
          onToggle={() => toggleDropdown("developers")}
        >
          {developerOptions.length === 0 && (
            <div className="buy-filterbar__empty">No developers found</div>
          )}
          {developerOptions.map((dev) => (
            <label key={dev} className="buy-filterbar__option">
              <input
                type="checkbox"
                checked={selectedDevelopers.includes(dev)}
                onChange={() => toggleInArray(selectedDevelopers, setSelectedDevelopers, dev)}
              />
              {dev}
            </label>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Filters"
          isActive={!!minBathrooms || featuredOnly}
          isOpen={openDropdown === "filters"}
          onToggle={() => toggleDropdown("filters")}
        >
          <div className="buy-filterbar__field">
            <label>Min Bathrooms</label>
            <input
              type="number"
              min="0"
              value={minBathrooms}
              onChange={(e) => setMinBathrooms(e.target.value)}
            />
          </div>
          <label className="buy-filterbar__option">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={() => setFeaturedOnly((v) => !v)}
            />
            Featured only
          </label>
        </FilterDropdown>

        <button className="buy-filterbar__search-btn" onClick={() => setOpenDropdown(null)}>
          <FaSearch /> Search
        </button>

        {activeFilterCount > 0 && (
          <button type="button" className="buy-filterbar__clear-btn" onClick={clearAllFilters}>
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="buy-shell">
        <div className="buy-breadcrumb">
          <Link to="/">Home</Link>
          <span className="buy-breadcrumb__sep">/</span>
          <span className="buy-breadcrumb__active">Properties for Sale</span>
        </div>

        <div className="buy-titlebar">
          <div>
            <h1>Properties for Sale</h1>
            <span className="buy-titlebar__count">
              {filteredProperties.length} listings
              {activeFilterCount > 0 && ` (${activeFilterCount} filters applied)`}
            </span>
          </div>

          <div className="buy-titlebar__controls">
            <button className="buy-titlebar__toggle">
              <FaRegMap /> Map
            </button>
            <button className="buy-titlebar__toggle buy-titlebar__toggle--active">
              <FaListUl /> List
            </button>
            <span className="buy-titlebar__divider" />
            <label className="buy-titlebar__sort">
              Sort:
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>

        {loading && <p className="buy-results__status">Loading properties...</p>}
        {!loading && filteredProperties.length === 0 && (
          <p className="buy-results__status">No properties match your filters.</p>
        )}

        <div className="buy-results__grid">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} onOpen={handleCardClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Buy;