import { useId, useState, type KeyboardEvent } from "react";
import { MapPin, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useApi } from "./lib";
import { Eyebrow, Markdown, Reveal, Notice } from "./components";
import {
  detailsOf,
  marketLabels,
  type ContentDetails,
} from "../shared/enhancements";
import countries from "../shared/africa-countries.json" with { type: "json" };
import type { Content } from "../shared/schemas";
type Boundary = { code: string; name: string; region: string; path: string };
type Market = {
  id: string;
  title: string;
  description: string;
  body: string;
  market: NonNullable<ContentDetails["market"]>;
};
const hq: Market = {
  id: "approved-sandton-headquarters",
  title: "South Africa",
  description: "Sandton, Johannesburg",
  body: "Afrisun Energy (Pty) Ltd\n\n1 Lawnmarket Road, Morningside Villas, Sandton, 2196, South Africa.",
  market: {
    countryCode: "ZAF",
    type: "headquarters",
    locations: "Sandton headquarters",
  },
};
export function Footprint() {
  const { data, error } = useApi<{ items: Content[] }>(
    "/api/content?kind=market&limit=100",
    { items: [] },
  );
  const { data: map, error: mapError } = useApi<{
    viewBox: string;
    countries: Boundary[];
  }>("/maps/africa.json", { viewBox: "0 0 640 580", countries: [] });
  const [region, setRegion] = useState("All regions");
  const [selected, setSelected] = useState("ZAF");
  const [hovered, setHovered] = useState("");
  const id = useId().replaceAll(":", "");
  const verified = data.items
    .filter((x) => x.status === "published" && x.verified && !x.demo)
    .flatMap((x) => {
      const market = detailsOf(x).market;
      return market
        ? [
            {
              id: x.id,
              title: x.title,
              description: x.description,
              body: x.body,
              market,
            },
          ]
        : [];
    });
  const markets = [...verified];
  if (
    !markets.some(
      (x) => x.market.countryCode === "ZAF" && x.market.type === "headquarters",
    )
  )
    markets.unshift(hq);
  const visible = markets.filter(
    (x) =>
      region === "All regions" ||
      countries.find((c) => c.code === x.market.countryCode)?.region === region,
  );
  const codes = [...new Set(visible.map((x) => x.market.countryCode))];
  const currentCode = codes.includes(selected) ? selected : codes[0];
  const current = visible.filter((x) => x.market.countryCode === currentCode);
  const activeCountry = countries.find((x) => x.code === currentCode);
  const hoveredCountry = countries.find((x) => x.code === hovered);
  const choose = (code: string) => {
    setSelected(code);
    setHovered("");
  };
  return (
    <section
      className="section footprint premium-footprint"
      aria-labelledby={`${id}-heading`}
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Continental footprint</Eyebrow>
            <h2 id={`${id}-heading`}>
              A continent of possibility.
              <br />
              <em>A presence built on trust.</em>
            </h2>
          </div>
          <p>
            Explore our approved presence.
            <br />
            New markets appear only after verification.
          </p>
        </div>
        <div
          className="region-filters"
          role="group"
          aria-label="Filter African markets by region"
        >
          {[
            "All regions",
            "Southern Africa",
            "East Africa",
            "West Africa",
            "Central Africa",
            "North Africa",
          ].map((r) => (
            <button
              key={r}
              aria-pressed={region === r}
              onClick={() => {
                setRegion(r);
                setHovered("");
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="africa-layout">
          <div className="africa-visual">
            <div className="map-caption">
              <Globe size={16} />
              <span>AFRICA / APPROVED PRESENCE</span>
              <span>
                {codes.length} {codes.length === 1 ? "country" : "countries"}
              </span>
            </div>
            {mapError ? (
              <Notice
                title="Map temporarily unavailable"
                text="Use the accessible country controls below to explore our approved presence."
              />
            ) : (
              <svg
                className="africa-map"
                viewBox={map.viewBox}
                aria-label="Map of Africa. Highlighted countries have approved presence records; use Enter or Space to select."
                role="group"
              >
                <title>Afrisun Energy African footprint</title>
                <defs>
                  <pattern
                    id={`${id}-planned`}
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="6" height="6" fill="#f3f0e4" />
                    <path d="M0 6 6 0" stroke="#a87412" strokeWidth="1" />
                  </pattern>
                </defs>
                {map.countries.map((country) => {
                  const records = visible.filter(
                    (x) => x.market.countryCode === country.code,
                  );
                  const primary =
                    records.find((x) => x.market.type === "headquarters") ||
                    records.find((x) => x.market.type === "distribution") ||
                    records.find((x) => x.market.type === "retail") ||
                    records[0];
                  return (
                    <path
                      key={country.code}
                      d={country.path}
                      className={`africa-country ${primary ? `presence-${primary.market.type}` : ""} ${currentCode === country.code && primary ? "country-selected" : ""}`}
                      {...(primary
                        ? {
                            role: "button",
                            tabIndex: 0,
                            "aria-pressed": currentCode === country.code,
                            "aria-label": `${country.name}: ${records.map((x) => marketLabels[x.market.type]).join(", ")}`,
                            onClick: () => choose(country.code),
                            onFocus: () => setHovered(country.code),
                            onKeyDown: (e: KeyboardEvent<SVGPathElement>) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                choose(country.code);
                              }
                              if (
                                [
                                  "ArrowRight",
                                  "ArrowDown",
                                  "ArrowLeft",
                                  "ArrowUp",
                                ].includes(e.key)
                              ) {
                                e.preventDefault();
                                const next =
                                  codes[
                                    (codes.indexOf(country.code) +
                                      (e.key === "ArrowRight" ||
                                      e.key === "ArrowDown"
                                        ? 1
                                        : codes.length - 1)) %
                                      codes.length
                                  ];
                                choose(next);
                                e.currentTarget.ownerSVGElement
                                  ?.querySelector<SVGPathElement>(
                                    `[data-country="${next}"]`,
                                  )
                                  ?.focus();
                              }
                            },
                          }
                        : { "aria-hidden": true })}
                      data-country={country.code}
                      style={
                        primary?.market.type === "planned"
                          ? { fill: `url(#${id}-planned)` }
                          : undefined
                      }
                      onMouseEnter={() => setHovered(country.code)}
                      onMouseLeave={() => setHovered("")}
                    >
                      <title>
                        {country.name}
                        {primary
                          ? ` — ${marketLabels[primary.market.type]}`
                          : " — no published presence record"}
                      </title>
                    </path>
                  );
                })}
              </svg>
            )}
            <div className="map-tooltip" aria-hidden="true">
              {hoveredCountry ? (
                <>
                  <strong>{hoveredCountry.name}</strong>
                  <span>
                    {visible.some((x) => x.market.countryCode === hovered)
                      ? "Select highlighted country to explore"
                      : "No published presence record"}
                  </span>
                </>
              ) : (
                <>
                  <strong>Explore the connections</strong>
                  <span>Hover, tap, or use the country controls.</span>
                </>
              )}
            </div>
            <div className="map-legend" aria-label="Map legend">
              {Object.entries(marketLabels).map(([type, label]) => (
                <span key={type}>
                  <i className={`legend-${type}`} />
                  {label}
                </span>
              ))}
            </div>
            <p className="map-credit">
              Boundaries:{" "}
              <a
                href="https://www.naturalearthdata.com/about/terms-of-use/"
                target="_blank"
                rel="noreferrer"
              >
                Natural Earth, 1:50m
              </a>
              . Generalised country and territory outlines; no exact hub
              positions or geopolitical endorsement implied.
            </p>
          </div>
          <div className="africa-panel">
            <div
              className="country-controls"
              role="group"
              aria-label="Select an approved country"
            >
              {codes.map((code) => (
                <button
                  key={code}
                  aria-pressed={currentCode === code}
                  onClick={() => choose(code)}
                >
                  {countries.find((c) => c.code === code)?.name || code}
                </button>
              ))}
            </div>
            <div
              aria-live="polite"
              aria-atomic="true"
              className="country-information"
            >
              {current.length ? (
                <div key={currentCode} className="country-panel-enter">
                  <Eyebrow>{activeCountry?.region}</Eyebrow>
                  <h3>{activeCountry?.name}</h3>
                  {current.map((item) => (
                    <article className="country-presence" key={item.id}>
                      <span
                        className={`presence-label label-${item.market.type}`}
                      >
                        <MapPin size={14} />
                        {marketLabels[item.market.type]}
                      </span>
                      <h4>{item.market.locations}</h4>
                      <p>{item.description}</p>
                      <Markdown>{item.body}</Markdown>
                      {item.market.type === "planned" && (
                        <p className="planned-note">
                          Approved expansion intention. This is not an active
                          operating market.
                        </p>
                      )}
                    </article>
                  ))}
                  <Link
                    className="text-link"
                    to={`/partners?market=${activeCountry?.code || ""}`}
                  >
                    Explore a partnership <ArrowUpRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="map-region-empty">
                  <Globe size={35} />
                  <h3>No approved presence to show.</h3>
                  <p>
                    There are no published market records in this region.
                    Proposed markets remain private until reviewed.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setRegion("All regions")}
                  >
                    Show all regions <ArrowUpRight size={16} />
                  </button>
                </div>
              )}
            </div>
            {error && (
              <p className="fine-print" role="status">
                Market updates are temporarily unavailable. The approved Sandton
                headquarters is shown.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export function CaseStudies() {
  const { data } = useApi<{ items: Content[] }>(
    "/api/content?kind=case-study",
    { items: [] },
  );
  const items = data.items.filter(
    (x) => x.status === "published" && x.verified && !x.demo,
  );
  return (
    <section className="section success-stories">
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Success stories</Eyebrow>
            <h2>
              Behind every connection,
              <br />
              <em>a possibility worth sharing.</em>
            </h2>
          </div>
          <Link className="text-link" to="/partners">
            Become a retail partner <ArrowUpRight size={17} />
          </Link>
        </div>
        {items.length ? (
          <div className="story-editorial">
            {items.slice(0, 3).map((item, i) => (
              <Reveal
                key={item.id}
                className={`story-teaser story-teaser-${i}`}
              >
                <Link to={`/stories/${item.slug}`}>
                  <div className="story-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        loading="lazy"
                      />
                    ) : (
                      <div className="story-image-type">
                        <span>PARTNER PERSPECTIVE</span>
                        <strong>{item.title}</strong>
                      </div>
                    )}
                    <span className="card-arrow">
                      <ArrowUpRight />
                    </span>
                  </div>
                  <Eyebrow>
                    {detailsOf(item).story?.location || item.category}
                  </Eyebrow>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="text-link">
                    Read the story <ArrowUpRight size={16} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="story-invitation">
            <span>THE NEXT CHAPTER</span>
            <h3>
              Real partnerships.
              <br />
              Stories earned through progress.
            </h3>
            <p>
              We will share partner stories when the organisations, experiences
              and results have been verified and approved for publication.
            </p>
            <Link className="text-link" to="/partners">
              Start a conversation with Afrisun <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
