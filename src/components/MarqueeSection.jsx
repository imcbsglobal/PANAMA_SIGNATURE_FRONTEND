// panama-signature/src/components/MarqueeSection.jsx
import ScrollVelocity from "./ScrollVelocity";
import "./MarqueeSection.scss";

function MarqueeSection({ word = "Solutions" }) {
  return (
    <section className="marquee-section">
      <ScrollVelocity
        texts={[word]}
        velocity={40}
        numCopies={2}
        className="marquee-section__text"
      />
    </section>
  );
}

export default MarqueeSection;