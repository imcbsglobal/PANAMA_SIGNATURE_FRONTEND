import { useEffect, useState } from "react";
import "./TeamSection.scss";
import api from "../api/api";

function TeamSection() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.getAgents()
      .then((data) => setAgents(data))
      .catch((err) => console.error("Failed to load agents:", err));
  }, []);

  return (
    <section className="team">
      <div className="team__header">
        <h2>Our Team</h2>
        <p>Where top-tier quality meets trusted professionals.</p>
      </div>

      <div className="team__grid">
        {agents.map((agent) => (
          <div className="team__card" key={agent.id}>
            <div
              className="team__photo"
              style={{
                backgroundImage: agent.photo ? `url(${agent.photo})` : "none",
              }}
            />
            <h3>{agent.name}</h3>
            <span className="team__designation">{agent.designation}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TeamSection;