import { Link } from "react-router-dom";
import { useState } from "react";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineExternalLink,
  HiOutlineStar,
  HiOutlineUser,
  HiChevronDown,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { FaDirections } from "react-icons/fa";
import "../styles/Contact.scss";
import bannerImg from "../assets/images/contact.png";

const contactDetails = [
  {
    icon: HiOutlineLocationMarker,
    label: "Visit Our Office",
    lines: ["Office No B2104-18, Latifa Towers", "Sheikh Zayed Road, Dubai, UAE"],
  },
  {
    icon: HiOutlinePhone,
    label: "Call Us",
    lines: ["+971 4 123 4567", "+971 50 123 4567"],
  },
  {
    icon: HiOutlineMail,
    label: "Email Us",
    lines: ["info@panamasignature.com", "sales@panamasignature.com"],
  },
  {
    icon: HiOutlineClock,
    label: "Working Hours",
    lines: ["Sun to Thu: 9:00 AM - 7:00 PM", "Sat: 10:00 AM - 4:00 PM"],
  },
];

const offices = [
  {
    city: "Dubai",
    address: "Office No B2104-18, Latifa Towers, Sheikh Zayed Road",
    phone: "+971 4 123 4567",
  },
  
];

const mapOffice = {
  name: "Panama Signature Properties",
  address: "Office No B2104-18, Latifa Towers, Sheikh Zayed Road, Dubai, UAE",
  rating: "4.9",
  reviews: "1,240",
  mapsQuery: "Latifa Tower - Trade Center First - Dubai",
};

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    budget: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const mapEmbedSrc =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(mapOffice.mapsQuery) +
    "&output=embed";

  const mapDirectionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(mapOffice.mapsQuery);

  const mapExternalUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(mapOffice.mapsQuery);

  return (
    <div className="contact-page">
      <section
        className="contact-banner"
        style={{ backgroundImage: "url(" + bannerImg + ")" }}
      >
        <div className="contact-banner__overlay"></div>

        <div className="contact-banner__content">
          

          <div className="contact-banner__heading">
            <h1 className="contact-banner__title">
              Let's
              <span>Connect</span>
            </h1>

            <p className="contact-banner__subtitle">
              We're here to help you find the perfect property and answer
              any questions you may have.
            </p>

            <div className="contact-banner__divider"></div>

            <div className="contact-banner__quicklinks">
              <a href="tel:+971501234567" className="contact-banner__quicklink">
                <HiOutlinePhone />
                +971 50 123 4567
              </a>

<a
  href="mailto:info@panamasignature.com"
  className="contact-banner__quicklink"
>
  <HiOutlineMail />
  info@panamasignature.com
</a>

              <span className="contact-banner__quicklink">
                <HiOutlineLocationMarker />
                Dubai, UAE
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-map">
        <div className="contact-map__frame">
          <iframe
            className="contact-map__iframe"
            src={mapEmbedSrc}
            title="Panama Signature office location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>

          <div className="contact-map__card">
            <div className="contact-map__card-top">
              <span className="contact-map__card-title">
                {mapOffice.name}
              </span>

              <div className="contact-map__card-actions">
                
<a
  href={mapExternalUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="contact-map__icon-btn"
  aria-label="Open in Google Maps"
>
  <HiOutlineExternalLink />
</a>

                
                  
<a
  href={mapDirectionsUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="contact-map__icon-btn"
  aria-label="Get directions"
>
  <FaDirections />
</a>
              </div>
            </div>

            <p className="contact-map__card-address">{mapOffice.address}</p>

            <div className="contact-map__card-rating">
              <span className="contact-map__card-score">
                {mapOffice.rating}
              </span>
              <HiOutlineStar className="contact-map__card-star" />
              <span className="contact-map__card-reviews">
                ({mapOffice.reviews})
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-main">
        <div className="contact-main__eyebrow-row">
          <span className="contact-main__eyebrow">Let's talk now</span>
          <span className="contact-main__line"></span>
        </div>

        <h2 className="contact-main__title">
          Have A Project In Mind? <br /> Let's Make It Happen
        </h2>

        <div className="contact-main__grid">
          <div className="contact-main__info">
            <h3 className="contact-main__info-title">Catch Us Here</h3>

            <div className="contact-main__info-block">
              <span>info@panamasignature.com</span>
              <span>+971 4 123 4567</span>
            </div>

            <div className="contact-main__info-block">
              <span>Office No B2104-18, Latifa Towers</span>
              <span>Sheikh Zayed Road, Dubai, UAE</span>
            </div>

            <div className="contact-main__info-block">
              <span>Sunday — Thursday,</span>
              <span>9am — 7pm GST</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <div className="contact-form__field">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name **"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <HiOutlineUser className="contact-form__icon" />
              </div>

              <div className="contact-form__field">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address **"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <HiOutlineMail className="contact-form__icon" />
              </div>
            </div>

            <div className="contact-form__row">
              <div className="contact-form__field contact-form__field--select">
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject **</option>
                  <option value="buy">Buying a Property</option>
                  <option value="sell">Selling a Property</option>
                  <option value="rent">Renting a Property</option>
                  <option value="invest">Investment Inquiry</option>
                </select>
                <HiChevronDown className="contact-form__icon" />
              </div>

              <div className="contact-form__field contact-form__field--select">
                <select
                  id="budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Budget **</option>
                  <option value="5-10">$5,000 - $10,000</option>
                  <option value="10-50">$10,000 - $50,000</option>
                  <option value="50-100">$50,000 - $100,000</option>
                  <option value="100+">$100,000+</option>
                </select>
                <HiChevronDown className="contact-form__icon" />
              </div>
            </div>

            <div className="contact-form__field contact-form__field--message">
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Message **"
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>
              <HiOutlinePencilAlt className="contact-form__icon" />
            </div>

            <button type="submit" className="contact-form__submit">
              Get A Free Quote
            </button>

            {submitted && (
              <p className="contact-form__success">
                Thank you, your message has been sent. We'll be in touch
                soon.
              </p>
            )}
          </form>
        </div>
      </section>

      <section className="contact-offices">
        <div className="contact-offices__header">
          <div className="contact-offices__eyebrow-row">
            <span className="contact-offices__eyebrow">Our Offices</span>
            <span className="contact-offices__line"></span>
          </div>
          <h2 className="contact-offices__title">Find Us Across The UAE</h2>
        </div>

        <div className="contact-offices__grid">
          {offices.map((office, i) => (
            <div className="office-card" key={i}>
              <span className="office-card__city">{office.city}</span>
              <p className="office-card__address">{office.address}</p>
              <span className="office-card__phone">{office.phone}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Contact;