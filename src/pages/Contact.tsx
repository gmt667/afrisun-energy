import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { PageHero, Eyebrow } from "../components";
import { SEO } from "../seo";
import { EnquiryForm } from "../forms";
import { company } from "../../shared/content";
export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [map, setMap] = useState(false);
  const [copyError, setCopyError] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(company.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError("Please select and copy the address below.");
    }
  }
  return (
    <>
      <SEO title="Get in Touch" />
      <PageHero
        label="Contact Afrisun"
        title="Great things start with a conversation."
        text="Whether you are a manufacturer, distributor, retailer or development partner, we would like to hear from you."
      />
      <section className="section">
        <div className="container contact-grid">
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2>
              Let’s make
              <br />
              <em>a connection.</em>
            </h2>
            <div className="contact-detail">
              <MapPin />
              <div>
                <h3>Visit our office</h3>
                <p>
                  Afrisun Energy (Pty) Ltd
                  <br />1 Lawnmarket Road, Morningside Villas
                  <br />
                  Sandton, 2196
                  <br />
                  South Africa
                </p>
                <button className="text-link" onClick={copy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                  {copied ? "Address copied" : "Copy address"}
                </button>
                {copyError && <small role="status">{copyError}</small>}
              </div>
            </div>
            <div className="contact-detail">
              <Phone />
              <div>
                <h3>Call us</h3>
                <a href="tel:+27635483486">{company.phone}</a>
              </div>
            </div>
            <div className="contact-detail">
              <Mail />
              <div>
                <h3>Email us</h3>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            </div>
            <div className="contact-detail">
              <Clock />
              <div>
                <h3>Office hours</h3>
                <p>
                  Monday–Friday
                  <br />
                  08:00–17:00 SAST
                </p>
              </div>
            </div>
          </div>
          <EnquiryForm kind="contact" />
        </div>
      </section>
      <section className="map-section container">
        <div className="section-heading">
          <div>
            <Eyebrow>Find us</Eyebrow>
            <h2>
              Sandton, <em>South Africa.</em>
            </h2>
          </div>
          <a
            className="text-link"
            href="https://www.openstreetmap.org/search?query=1%20Lawnmarket%20Road%20Sandton%20South%20Africa"
            rel="noreferrer"
            target="_blank"
          >
            Open directions <ArrowUpRight size={18} />
          </a>
        </div>
        {map ? (
          <iframe
            title="Map of the Sandton area; use the address link for exact directions"
            src="https://www.openstreetmap.org/export/embed.html?bbox=28.02%2C-26.10%2C28.08%2C-26.04&layer=mapnik"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="map-placeholder">
            <MapPin size={35} />
            <h3>Our home in Sandton</h3>
            <p>
              Load an interactive area map from OpenStreetMap.
              <br />
              Your IP address will be shared with the map provider.
            </p>
            <button className="button button-navy" onClick={() => setMap(true)}>
              Load area map <ArrowUpRight size={17} />
            </button>
          </div>
        )}
        <p className="fine-print">
          Area map only. The office location has not been independently
          geocoded; use the full address for directions.
        </p>
      </section>
    </>
  );
}
