import { useState } from "react";
import { Pause, Play, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow } from "./components";
const roles = [
  ["PV manufacturers", "Solar technology"],
  ["Lithium systems", "Energy storage"],
  ["Power electronics", "Solar conversion"],
  ["Regional distributors", "Product availability"],
  ["Retail networks", "Last-mile access"],
  ["Logistics & distribution", "Supply-chain connections"],
];
export function PartnerTicker() {
  const [paused, setPaused] = useState(false);
  const items = roles;
  return (
    <section
      className={`partner-network ${paused ? "ticker-paused" : ""}`}
      aria-labelledby="network-heading"
    >
      <div className="container">
        <div className="network-heading">
          <div>
            <Eyebrow>Industry connectivity</Eyebrow>
            <h2 id="network-heading">
              Manufacturer & retail
              <br />
              <em>partner network.</em>
            </h2>
            <p>
              "The connections we seek across solar, storage and last-mile retail. Sector roles, rather than named partnerships."
            </p>
          </div>
          <div className="network-actions">
            <Link className="text-link" to="/partners">
              Connect with Afrisun <ArrowUpRight size={17} />
            </Link>
            <button
              className="ticker-toggle"
              type="button"
              onClick={() => setPaused(!paused)}
              aria-label={
                paused ? "Resume partner ticker" : "Pause partner ticker"
              }
              aria-pressed={paused}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
              <span>{paused ? "Resume" : "Pause"}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="ticker-window">
        <div className="ticker-track">
          <ul className="ticker-group">
            {items.map(([name, role]) => (
              <li key={name}>
                <span className="ticker-symbol" aria-hidden="true">
                  ✳
                </span>
                <div>
                  <strong>{name}</strong>
                  <span>{role}</span>
                </div>
              </li>
            ))}
          </ul>
          <ul className="ticker-group ticker-duplicate" aria-hidden="true">
            {items.map(([name, role]) => (
              <li key={name}>
                <span className="ticker-symbol">✳</span>
                <div>
                  <strong>{name}</strong>
                  <span>{role}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
