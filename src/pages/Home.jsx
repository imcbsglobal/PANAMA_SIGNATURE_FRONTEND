import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/Home.scss";
import heroVideo from "../assets/images/video-hq.mp4";
import mobileBanner from "../assets/images/mobilebanner.png";
import { HiArrowRight, HiPlay, HiPlus, HiX } from "react-icons/hi";
import MarqueeSection from "../components/MarqueeSection";
import Masonry from "../components/Masonry";
import TeamSection from "../components/TeamSection";
import AdminLoginModal from "./AdminLogin";

gsap.registerPlugin(ScrollTrigger);

// Keep this in sync with the $mobile-breakpoint used in Home.scss (991px).
const MOBILE_BREAKPOINT = 991;

const howItWorksSteps = [
  {
    id: "01",
    title: "Consultation & Needs Analysis",
    desc: "We begin by understanding your goals, preferences, and budget to shape the perfect search.",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  },
  {
    id: "02",
    title: "Property Search & Tours",
    desc: "We curate a shortlist of properties matching your criteria and arrange private tours.",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  },
  {
    id: "03",
    title: "Offer & Negotiation",
    desc: "Our team handles offers and negotiations to secure the best possible terms for you.",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
  },
  {
    id: "04",
    title: "Closing & Aftercare",
    desc: "We guide you through closing and remain a resource long after you've moved in.",
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
  },
];

const testimonialAvatars = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/76.jpg",
];

const testimonialPills = [
  { name: "Alonso D.", tag: "Quality design" },
  { name: "Miranda", tag: "One of the best development" },
  { name: "Nelson M.", tag: "Unbelievable & next-gen design team" },
  { name: "Alvon B.", tag: "Better quality design, communication ui & ux" },
];

function Home() {
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showVideoAd, setShowVideoAd] = useState(true);
  const [isVideoAdExpanded, setIsVideoAdExpanded] = useState(false);
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);

  // Track mobile vs desktop so we know whether to run the scroll-scrub
  // video effect (desktop) or show the static banner + video-ad (mobile).
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = heroRef.current;
    const video = heroVideoRef.current;
    if (!section || !video) return;

    // On mobile we show a static banner image instead of the scrubbed
    // video, so skip wiring up ScrollTrigger/pinning entirely there.
    if (isMobile) return;

    // Fixes mobile address-bar resize breaking ScrollTrigger's pin math
    // (the #1 cause of "scrubs fine on desktop, jumps past on mobile").
    // Safe to call multiple times; GSAP dedupes internally.
    ScrollTrigger.normalizeScroll(true);

    let duration = 0;
    let targetTime = 0;
    let currentTime = 0;
    let rafId;
    let scrollTriggerInstance;
    let unlocked = false;

    // iOS Safari (and several Android WebViews) refuse to redraw a video
    // frame via currentTime scrubbing until the element has actually been
    // played at least once. This silently "unlocks" seeking on load without
    // any visible playback -- required for the scrub to work on mobile at all.
    const unlockVideoForScrubbing = () => {
      if (unlocked) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            video.pause();
            unlocked = true;
          })
          .catch(() => {
            // Autoplay blocked -- try again on the first touch/scroll, since
            // a user gesture always clears autoplay restrictions.
            const retryOnGesture = () => {
              video
                .play()
                .then(() => {
                  video.pause();
                  unlocked = true;
                })
                .catch(() => {});
              window.removeEventListener("touchstart", retryOnGesture);
              window.removeEventListener("scroll", retryOnGesture);
            };
            window.addEventListener("touchstart", retryOnGesture, { once: true });
            window.addEventListener("scroll", retryOnGesture, { once: true });
          });
      } else {
        video.pause();
        unlocked = true;
      }
    };

    // Smooth interpolation loop -> this is what makes the scrub feel
    // buttery instead of stepping frame-by-frame with the scrollbar.
    const render = () => {
      currentTime += (targetTime - currentTime) * 0.08;
      if (Math.abs(currentTime - targetTime) < 0.01) currentTime = targetTime;
      // Skip redundant seeks -- only write currentTime when the delta is
      // big enough to matter, instead of writing every single frame. This
      // reduces how often mobile browsers have to decode a new frame.
      if (!isNaN(currentTime) && video.readyState >= 2) {
        if (Math.abs(video.currentTime - currentTime) > 0.03) {
          video.currentTime = currentTime;
        }
      }
      rafId = requestAnimationFrame(render);
    };

    const setup = () => {
      duration = video.duration || 0;
      unlockVideoForScrubbing();

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=600%", // scroll distance mapped to full video length; increase for a slower, smoother reveal
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetTime = self.progress * duration;
        },
      });

      rafId = requestAnimationFrame(render);
    };

    // readyState >= 2 (HAVE_CURRENT_DATA) so we know a frame is actually
    // decoded before wiring up ScrollTrigger -- readyState 1 (metadata only)
    // is enough for `duration` but not reliably enough for mobile seeking.
    if (video.readyState >= 2) {
      setup();
    } else {
      video.addEventListener("loadeddata", setup);
      video.load();
    }

    // Recalculate pin distances if the mobile address bar collapses/expands
    // or the device rotates mid-scroll.
    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      video.removeEventListener("loadeddata", setup);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
    };
  }, [isMobile]);

  return (
    <div className="home">
      <section className="hero" ref={heroRef}>
        <video
          ref={heroVideoRef}
          className="hero__video"
          src={heroVideo}
          muted
          playsInline
          webkit-playsinline="true"
          disablePictureInPicture
          preload="auto"
        />
        <div
          className="hero__mobile-banner"
          style={{ backgroundImage: `url(${mobileBanner})` }}
        />
        <div className="hero__overlay" />
        <div className="hero__content">
          <h1>
            <span className="line line1">Properties That Offer <span className="gold italic">More</span></span>{" "}
            <span className="line line2">Than <span className="gold italic">Homes</span>—</span>{" "}
            <span className="line line3">They Create <span className="gold script">Community.</span></span>
          </h1>
          <p>
            Discover exclusive properties designed to elevate your lifestyle
            and build a legacy for generations.
          </p>
          <button
            className="hero__explore-btn"
            onClick={() => navigate("/projects")}
          >
            Explore Availability <HiArrowRight />
          </button>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__top">
          <span className="about-section__eyebrow">About our company</span>
          <span className="about-section__eyebrow-line" />
        </div>

        <h2 className="about-section__heading">
          We Help You Buy, Sell &amp; Invest Smartly—Backed By Experience,
          Driven By Results.
        </h2>

        <div className="about-section__grid">
          <div className="about-section__badge">
            <svg viewBox="0 0 200 200">
              <defs>
                <path
                  id="badgeCircle"
                  d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
                />
              </defs>
              <circle cx="100" cy="100" r="92" className="about-section__badge-ring" />
              <circle cx="100" cy="100" r="66" className="about-section__badge-ring" />
              <text className="about-section__badge-text">
                <textPath href="#badgeCircle" startOffset="0%">
                  QUALITY  SOLUTION • WITH PANAMA •
                </textPath>
              </text>
            </svg>
          </div>

          <div className="about-section__card">
            <div
              className="about-section__card-img"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80)",
              }}
            >
              <button className="about-section__card-plus" aria-label="Expand">
                <HiPlus />
              </button>
            </div>
            <p className="about-section__card-caption">
              From Bustling Urban Condos To Peaceful Suburban Homes.
            </p>
            <button className="about-section__card-btn">About Us</button>
            <span className="about-section__card-num">1</span>
          </div>

          <div className="about-section__info">
            <p>
              Discover prime homes, luxury estates, and high-value investments
              with our expert real estate group. Whether you're a first-time
              buyer or a seasoned investor, we're here to guide every step.
            </p>
            <p>
              At <strong>Panama</strong>, we bring a unique blend of market
              knowledge, negotiation power, and personalized service. With
              over <strong>35+ years</strong> in the real estate market, we've
              helped hundreds of families find their perfect home and
              investors grow their portfolios.
            </p>

            <div className="about-section__stats">
              <div className="about-section__stat">
                <h3>2.5k</h3>
                <span>Homes delivered</span>
              </div>
              <div className="about-section__stat">
                <h3>4.9</h3>
                <span>Ratings out of 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="how-it-works__grid">
          <div className="how-it-works__col how-it-works__col--text">
            <span className="how-it-works__eyebrow">How it works?</span>
            <h2>
              We Bring Your Bold Ideas To Life With A Simple, Fun Approach.
            </h2>
          </div>

          <div className="how-it-works__col how-it-works__col--cards">
            <div className="how-it-works__stack">
              {howItWorksSteps.map((step, i) => (
                <div
                  className="how-it-works__sticky"
                  key={step.id}
                  style={{ zIndex: i + 1 }}
                >
                  <div className="how-it-works__card">
                    <div className="how-it-works__card-header">
                      <div className="how-it-works__icon">
                        <span>{i + 1}</span>
                      </div>
                      <div className="how-it-works__text">
                        <h3>{step.title}</h3>
                        <p>{step.desc}</p>
                      </div>
                      <span className="how-it-works__num">{step.id}</span>
                    </div>
                    <div
                      className="how-it-works__img"
                      style={{ backgroundImage: `url(${step.img})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MarqueeSection word="Panama Signature" />

      <TeamSection />

      <section className="testimonials">
        <div className="testimonials__header">
          <span className="testimonials__eyebrow">User Reviews</span>
          <h2>
            Happy Users Journey &amp;
            <br />
            Feedbacks Here.
          </h2>
        </div>

        <div className="testimonials__grid">
          {/* Column 1 */}
          <div className="testimonials__col testimonials__col--1">
            <div className="t-card t-card--rating">
              <div className="t-card__avatars">
                {testimonialAvatars.map((src, i) => (
                  <img key={i} src={src} alt="" />
                ))}
              </div>
              <div className="t-card__stars">★★★★★</div>
              <h3>4.9 / 5.0</h3>
              <p>From bustling urban condos to peaceful suburban retreats.</p>
            </div>

            <div
              className="t-card t-card--image"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80)",
              }}
            />
          </div>

          {/* Column 2 */}
          <div className="testimonials__col testimonials__col--2">
            <div
              className="t-card t-card--video"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80)",
              }}
            >
              <div className="t-card__name">
                <strong>Alonso D. Dowson</strong>
                <span>Alonso D. Dowson</span>
              </div>
              <button className="t-card__play" aria-label="Play video">
                <HiPlay />
              </button>
            </div>

            <div className="t-card t-card--quote">
              <div className="t-card__stars">★★★★★</div>
              <p>
                "Working with Panama Signaturefeels like a partnership; as we
                continued to use their tool and found more use cases, our
                feature requests quickly found."
              </p>
              <div className="t-card__quote-footer">
                <div>
                  <strong>Alonso D. Dowson</strong>
                  <span>House Owner</span>
                </div>
                <span className="t-card__quote-mark">"</span>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="testimonials__col testimonials__col--3">
            <div className="t-card t-card--pills">
              {testimonialPills.map((p, i) => (
                <span key={i} className="t-pill">
                  <strong>{p.name}</strong> — {p.tag}
                </span>
              ))}
            </div>

            <div
              className="t-card t-card--banner"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80)",
              }}
            >
              <h3>Quality real estate solutions</h3>
            </div>

            <div className="t-card t-card--stat">
              <span>Quality real estate solutions</span>
              <h3>98.8%</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-only floating video "ad" -- a small floating reel, same
          idea as a floating WhatsApp button, sitting bottom-left so it
          doesn't collide with a WhatsApp bubble on the right. Closing it
          hides it for the rest of the session (it does not reopen). */}
      {/* Mobile-only floating video "ad" -- a small floating reel, same
          idea as a floating WhatsApp button, sitting bottom-left so it
          doesn't collide with a WhatsApp bubble on the right. Tapping the
          reel expands the video to full size; tapping its own close (x)
          dismisses it for the session instead. */}
      {isMobile && showVideoAd && !isVideoAdExpanded && (
        <div
          className="video-ad-float"
          onClick={() => setIsVideoAdExpanded(true)}
          role="button"
          tabIndex={0}
          aria-label="Expand video"
        >
          <div className="video-ad-float__clip">
            <video
              className="video-ad-float__video"
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              webkit-playsinline="true"
              disablePictureInPicture
            />
          </div>
          <button
            type="button"
            className="video-ad-float__close"
            aria-label="Close video"
            onClick={(e) => {
              e.stopPropagation();
              setShowVideoAd(false);
            }}
          >
            <HiX />
          </button>
        </div>
      )}

      {isMobile && showVideoAd && isVideoAdExpanded && (
        <div
          className="video-ad-overlay"
          onClick={() => setIsVideoAdExpanded(false)}
        >
          <div
            className="video-ad-overlay__card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-ad-overlay__close"
              aria-label="Close video"
              onClick={() => setIsVideoAdExpanded(false)}
            >
              <HiX />
            </button>
            <video
              className="video-ad-overlay__video"
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              webkit-playsinline="true"
              disablePictureInPicture
            />
          </div>
        </div>
      )}

      {showAdminLogin && (
        <AdminLoginModal onClose={() => setShowAdminLogin(false)} />
      )}
    </div>
  );
}

export default Home;