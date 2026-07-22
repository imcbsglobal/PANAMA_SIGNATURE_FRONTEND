// panama-signature/src/pages/About.jsx
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "../styles/About.scss";
import banImg from "../assets/images/banimg.png";
import buildingImg from "../assets/images/aboutbuilding.png";
import trailImg1 from "../assets/images/1.png";
import trailImg2 from "../assets/images/2.png";
import trailImg3 from "../assets/images/3.png";
import trailImg4 from "../assets/images/4.png";
import trailImg5 from "../assets/images/5.png";
import trailImg6 from "../assets/images/6.png";

const avatarUrls = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/76.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

function getLocalPointerPos(e, rect) {
  let clientX = 0,
    clientY = 0;
  if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

class ImageItem {
  DOM = { el: null, inner: null };
  rect = null;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector(".about-trail__img-inner");
    this.getRect();
    this.resize = () => this.getRect();
    window.addEventListener("resize", this.resize);
  }
  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }
  destroy() {
    window.removeEventListener("resize", this.resize);
  }
}

class ImageTrailEngine {
  constructor(container) {
    this.container = container;
    this.images = [...container.querySelectorAll(".about-trail__img")].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;

    this.handleClick = (ev) => {
      const rect = this.container.getBoundingClientRect();
      const pos = getLocalPointerPos(ev, rect);
      this.showOneImage(pos);
    };

    container.addEventListener("click", this.handleClick);
    container.addEventListener("touchstart", this.handleClick);
  }

  showOneImage(pos) {
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline()
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0.6,
          zIndex: this.zIndexVal,
          x: pos.x - img.rect.width / 2,
          y: pos.y - img.rect.height / 2,
        },
        {
          duration: 0.35,
          ease: "power2.out",
          scale: 1,
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.6,
          ease: "power3",
          opacity: 0,
          scale: 0.3,
        },
        0.5
      );
  }

  destroy() {
    this.container.removeEventListener("click", this.handleClick);
    this.container.removeEventListener("touchstart", this.handleClick);
    this.images.forEach((img) => img.destroy());
  }
}

const trailImages = [
  trailImg1,
  trailImg2,
  trailImg3,
  trailImg4,
  trailImg5,
  trailImg6,
];

const expertiseData = [
  {
    key: "residential",
    label: "Residential Properties",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    description:
      "We help buyers and sellers navigate Dubai and Abu Dhabi's freehold residential market, from off-plan apartments to family villas in the UAE's most sought-after communities — Downtown, Palm Jumeirah, Dubai Hills, and Yas Island.",
    highlights: [
      "Freehold & Leasehold Areas",
      "Off-Plan & Ready Units",
      "DLD & RERA Compliant Transactions",
      "Mortgage & Financing Support",
      "Title Deed & Documentation Handling",
      "After-Sale Handover Assistance",
    ],
  },
  {
    key: "commercial",
    label: "Commercial Properties",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    description:
      "From free zone offices to retail units on Sheikh Zayed Road, we connect businesses and investors with commercial spaces across the UAE's key economic hubs, backed by local market expertise and legal know-how.",
    highlights: [
      "Free Zone & Mainland Options",
      "Grade A Office Towers",
      "High Footfall Retail Units",
      "Ejari & Lease Registration",
      "Investment Advisory",
      "Facility & Tenant Management",
    ],
  },
  {
    key: "villas",
    label: "Luxury Villas & Penthouses",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    description:
      "Exclusive villas and penthouses across Emirates Hills, Al Barari, and Saadiyat Island, curated for buyers and sellers who expect privacy, architectural distinction, and world-class amenities.",
    highlights: [
      "Private Pools & Beach Access",
      "Bespoke Interiors",
      "Gated Community Security",
      "Smart Home Integration",
      "Concierge & Relocation Services",
      "Resale & Valuation Guidance",
    ],
  },
  {
    key: "investment",
    label: "Property Investment",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    description:
      "Strategic buy-to-let and capital growth opportunities across Dubai and Abu Dhabi, backed by market data and rental yield analysis to help investors buy and sell at the right time.",
    highlights: [
      "Market Research & Yield Analysis",
      "High-ROI Freehold Areas",
      "Off-Plan Investment Deals",
      "Portfolio Diversification",
      "Resale Value Guidance",
      "Exit & Resale Strategy Planning",
    ],
  },
  {
    key: "construction",
    label: "Off-Plan & Development",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
    description:
      "From launch to handover, we work alongside leading UAE developers to bring buyers first access to off-plan projects, with full transparency on payment plans and delivery timelines.",
    highlights: [
      "Developer-Direct Launch Access",
      "Flexible Payment Plans",
      "Construction Progress Tracking",
      "Escrow Account Verification",
      "Handover Inspection Support",
      "Post-Handover Resale Assistance",
    ],
  },
];

function About() {
  const trailRef = useRef(null);
  const expertiseRef = useRef(null);

  const [activeKey, setActiveKey] = useState(expertiseData[0].key);
  const [imgVisible, setImgVisible] = useState(true);
  const [inView, setInView] = useState(false);

  const active =
    expertiseData.find((item) => item.key === activeKey) || expertiseData[0];

  useEffect(() => {
    if (!trailRef.current) return;
    const engine = new ImageTrailEngine(trailRef.current);
    return () => engine.destroy();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (expertiseRef.current) observer.observe(expertiseRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (key) => {
    if (key === activeKey) return;
    setImgVisible(false);
    setTimeout(() => {
      setActiveKey(key);
      setImgVisible(true);
    }, 200);
  };

  return (
    <div className="about-page">
      <section
        className="about-banner"
        style={{ backgroundImage: `url(${banImg})` }}
      >
        <div className="about-banner__overlay" />

        <div className="about-banner__content">
          <h1 className="about-banner__title">
            Crafting Things For Real &amp; <br /> Og Peoples.
          </h1>

          <div className="about-banner__breadcrumb">
            <Link to="/">Home 01</Link>
            <span className="about-banner__chevron">›</span>
            <span className="active">About Us</span>
          </div>
        </div>
      </section>

      <section className="about-company">
        <div className="about-company__image">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Modern luxury house entrance"
          />
        </div>

        <div className="about-company__content">
          <div className="about-company__eyebrow-row">
            <span className="about-company__eyebrow">About our company</span>
            <span className="about-company__line" />
          </div>

          <h2 className="about-company__title">
            We Help You Buy, Sell &amp; Invest Smartly—Backed By Experience,
            Driven By Results.
          </h2>

          <div className="about-company__reviews">
            <div className="about-company__avatars">
              {avatarUrls.map((src, i) => (
                <img key={i} src={src} alt={`User ${i + 1}`} />
              ))}
            </div>
            <div className="about-company__reviews-text">
              <span className="about-company__reviews-count">1200+</span>
              <span className="about-company__reviews-label">
                users review
              </span>
            </div>
          </div>

          <div className="about-company__divider" />

          <p className="about-company__text">
            Discover prime homes, luxury estates, and high-value investments
            with our expert real estate group. Whether you're a first-time
            buyer or a seasoned investor, we're here to guide every step.
          </p>

          <button className="about-company__cta">Meet With Team</button>
        </div>
      </section>

      <section className="about-showcase">
        <div className="about-showcase__frame">
          <img
            src={buildingImg}
            alt="Featured property"
            className="about-showcase__img"
          />

          <div className="about-trail" ref={trailRef}>
            {trailImages.map((url, i) => (
              <div className="about-trail__img" key={i}>
                <div
                  className="about-trail__img-inner"
                  style={{ backgroundImage: `url(${url})` }}
                />
              </div>
            ))}
          </div>

          <div className="about-showcase__bar">
            <div className="about-showcase__info">
              <span className="about-showcase__dot">+</span> Real estate group
              <br />
              base on UAE
            </div>
            <div className="about-showcase__info">
              <span className="about-showcase__dot">+</span> 
              <br />
            
            </div>
          </div>
        </div>
      </section>

      <section className="expertise" ref={expertiseRef}>
        <div className="expertise__header">
          <div className="expertise__eyebrow-row">
            <span className="expertise__eyebrow">Our Expertise</span>
            <span className="expertise__line" />
          </div>
          <h2 className="expertise__title">
            Delivering Excellence Across Every Property Category In The UAE
          </h2>
        </div>

        <div className="expertise__panel">
          <div className="expertise__list">
            {expertiseData.map((item, i) => (
              <button
                key={item.key}
                className={`expertise__item ${
                  item.key === activeKey ? "expertise__item--active" : ""
                } ${inView ? "expertise__item--in" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => handleSelect(item.key)}
              >
                <span>{item.label}</span>
                <span className="expertise__arrow">→</span>
              </button>
            ))}
          </div>

          <div className="expertise__image-wrap">
            <img
              src={active.image}
              alt={active.label}
              className={`expertise__image ${
                imgVisible ? "expertise__image--visible" : ""
              }`}
            />
          </div>

          <div className="expertise__content">
            <h3 className="expertise__content-title">{active.label}</h3>
            <p className="expertise__content-text">{active.description}</p>

            <ul className="expertise__highlights">
              {active.highlights.map((h, i) => (
                <li key={i}>
                  <span className="expertise__dot" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="expertise__cta-row">
              <button className="expertise__cta expertise__cta--primary">
                Explore Properties
              </button>
              <button className="expertise__cta expertise__cta--secondary">
                Contact Our Experts
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;