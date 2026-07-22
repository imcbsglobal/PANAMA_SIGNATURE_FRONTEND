import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Rent.scss";
import api from "../api/api";
import { resolveImage } from "../api/config";
import {
  FaSearch,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaListUl,
  FaRegMap,
} from "react-icons/fa";

const STATUS_LABELS = {
  exclusive: "Exclusive",
  rented: "Rented",
  coming_soon: "Coming Soon",
  available: "Available Now",
};

const PERIOD_LABELS = {
  monthly: "/mo",
  yearly: "/yr",
};

const PROPERTY_TYPE_OPTIONS = [
  "Apartment",
  "Independent House",
  "Villa",
  "Studio Apartment",
  "Penthouse",
];

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6+ BHK"];

function bhkMatches(property, bhkLabel) {
  const beds = Number(property.bedrooms);
  if (bhkLabel === "6+ BHK") return beds >= 6;
  const n = parseInt(bhkLabel, 10);
  return beds === n;
}

function RentPropertyCard({ property, onOpen }) {
  const images = property.images && property.images.length > 0 ? property.images : [];
  const total = images.length;

  const [index, setIndex] = useState(() => {
    const coverIdx = images.findIndex((img) => img.is_cover);
    return coverIdx >= 0 ? coverIdx : 0;
  });

  const showPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + total) % total);
  };

  const showNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="rent-property-card" onClick={() => onOpen(property.slug)}>
      <div className="rent-property-card__image-wrap">
        {total > 0 ? (
          <img src={resolveImage(images[index].image)} alt={property.title} />
        ) : (
          <div className="rent-property-card__image-placeholder" />
        )}

        <span className="rent-property-card__status-badge">
          {STATUS_LABELS[property.status] || property.status}
        </span>

        {total > 1 && (
          <>
            <button className="rent-property-card__nav rent-property-card__nav--prev" onClick={showPrev}>
              <FaChevronLeft />
            </button>
            <button className="rent-property-card__nav rent-property-card__nav--next" onClick={showNext}>
              <FaChevronRight />
            </button>
            <div className="rent-property-card__dots" onClick={(e) => e.stopPropagation()}>
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`rent-property-card__dot ${i === index ? "rent-property-card__dot--active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rent-property-card__body">
        <h3 title={property.title}>{property.title}</h3>
        <p className="rent-property-card__location">
          <FaMapMarkerAlt /> {property.location}
        </p>

        <p className="rent-property-card__price">
          {property.currency} {Number(property.rent_price).toLocaleString()}
          <span className="rent-property-card__period">
            {PERIOD_LABELS[property.rent_period]}
          </span>
        </p>

        <div className="rent-property-card__meta">
          <span className="rent-property-card__meta-item">{property.property_type}</span>
          <span className="rent-property-card__meta-item">
            <FaBed /> {property.bedrooms}
          </span>
          <span className="rent-property-card__meta-item">
            <FaBath /> {property.bathrooms}
          </span>
          <span className="rent-property-card__meta-item">{property.size_sqft} Sqft</span>
        </div>
      </div>
    </div>
  );
}

// Generic dropdown wrapper: closes on outside click
function FilterDropdown({ label, isActive, isOpen, onToggle, children }) {
  return (
    <div className="rent-filterbar__dropdown-wrap">
      <button
        type="button"
        className={`rent-filterbar__dropdown ${isActive ? "rent-filterbar__dropdown--active" : ""}`}
        onClick={onToggle}
      >
        {label} <FaChevronDown />
      </button>
      {isOpen && <div className="rent-filterbar__panel">{children}</div>}
    </div>
  );
}

function Rent() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---- filter state ----
  const [searchText, setSearchText] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); // 'types' | 'bhk' | 'price' | 'status' | null

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [sortOrder, setSortOrder] = useState("recent");

  const wrapRef = useRef(null);

  useEffect(() => {
    api.getRentals()
      .then((data) => setProperties(data))
      .catch((err) => console.error("Failed to load rentals:", err))
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

  const handleCardClick = (slug) => {
    navigate(`/rent/${slug}`);
  };

  const clearAllFilters = () => {
    setSearchText("");
    setSelectedTypes([]);
    setSelectedBhk([]);
    setPriceMin("");
    setPriceMax("");
    setSelectedStatus([]);
    setSortOrder("recent");
    setOpenDropdown(null);
  };

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const haystack = `${p.location || ""} ${p.title || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(p.property_type)) return false;

      if (selectedBhk.length > 0 && !selectedBhk.some((b) => bhkMatches(p, b))) return false;

      if (priceMin && Number(p.rent_price) < Number(priceMin)) return false;
      if (priceMax && Number(p.rent_price) > Number(priceMax)) return false;

      if (selectedStatus.length > 0 && !selectedStatus.includes(p.status)) return false;

      return true;
    });

    if (sortOrder === "price_asc") {
      result = [...result].sort((a, b) => Number(a.rent_price) - Number(b.rent_price));
    } else if (sortOrder === "price_desc") {
      result = [...result].sort((a, b) => Number(b.rent_price) - Number(a.rent_price));
    } else {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [properties, searchText, selectedTypes, selectedBhk, priceMin, priceMax, selectedStatus, sortOrder]);

  const activeFilterCount =
    selectedTypes.length +
    selectedBhk.length +
    selectedStatus.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0);

  return (
    <div className="rent-page">
      <div className="rent-filterbar" ref={wrapRef}>
        <div className="rent-filterbar__search">
          <FaSearch />
          <input
            placeholder="Enter locality, city or area"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <FilterDropdown
          label="Property Type"
          isActive={selectedTypes.length > 0}
          isOpen={openDropdown === "types"}
          onToggle={() => toggleDropdown("types")}
        >
          {PROPERTY_TYPE_OPTIONS.map((t) => (
            <label key={t} className="rent-filterbar__option">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t)}
                onChange={() => toggleInArray(selectedTypes, setSelectedTypes, t)}
              />
              {t}
            </label>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="BHK Type"
          isActive={selectedBhk.length > 0}
          isOpen={openDropdown === "bhk"}
          onToggle={() => toggleDropdown("bhk")}
        >
          {BHK_OPTIONS.map((b) => (
            <label key={b} className="rent-filterbar__option">
              <input
                type="checkbox"
                checked={selectedBhk.includes(b)}
                onChange={() => toggleInArray(selectedBhk, setSelectedBhk, b)}
              />
              {b}
            </label>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Price"
          isActive={!!priceMin || !!priceMax}
          isOpen={openDropdown === "price"}
          onToggle={() => toggleDropdown("price")}
        >
          <div className="rent-filterbar__range">
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
          label="Status"
          isActive={selectedStatus.length > 0}
          isOpen={openDropdown === "status"}
          onToggle={() => toggleDropdown("status")}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <label key={value} className="rent-filterbar__option">
              <input
                type="checkbox"
                checked={selectedStatus.includes(value)}
                onChange={() => toggleInArray(selectedStatus, setSelectedStatus, value)}
              />
              {label}
            </label>
          ))}
        </FilterDropdown>

        <button className="rent-filterbar__search-btn" onClick={() => setOpenDropdown(null)}>
          <FaSearch /> Search
        </button>

        {activeFilterCount > 0 && (
          <button type="button" className="rent-filterbar__clear-btn" onClick={clearAllFilters}>
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="rent-shell">
        <div className="rent-breadcrumb">
          <Link to="/">Home</Link>
          <span className="rent-breadcrumb__sep">/</span>
          <span className="rent-breadcrumb__active">Properties for Rent</span>
        </div>

        <div className="rent-titlebar">
          <div>
            <h1>Properties For Rent</h1>
            <span className="rent-titlebar__count">
              {filteredProperties.length} listings
              {activeFilterCount > 0 && ` (${activeFilterCount} filters applied)`}
            </span>
          </div>

          <div className="rent-titlebar__controls">
           
            <button className="rent-titlebar__toggle rent-titlebar__toggle--active">
              <FaListUl /> List
            </button>
            <span className="rent-titlebar__divider" />
            <label className="rent-titlebar__sort">
              Sort:
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>

        {loading && <p className="rent-results__status">Loading properties...</p>}
        {!loading && filteredProperties.length === 0 && (
          <p className="rent-results__status">No properties match your filters.</p>
        )}

        <div className="rent-results__grid">
          {filteredProperties.map((property) => (
            <RentPropertyCard key={property.id} property={property} onOpen={handleCardClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rent;