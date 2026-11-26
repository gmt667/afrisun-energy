import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { MapPin, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow, Markdown, Reveal, Notice } from "./components";
import {
  detailsOf,
  marketLabels,
  type ContentDetails,
} from "../shared/enhancements";
import countries from "../shared/africa-countries.json" with { type: "json" };
import branches from "../shared/branches.json";
import { motion, useReducedMotion } from "motion/react";
import { publicContent } from "../shared/public-content";
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
  const reduced = useReducedMotion();
  const marketsContent = publicContent.markets;
  const [map, setMap] = useState<{
    viewBox: string;
    countries: Boundary[];
    branches?: {
      code: string;
      name: string;
      city?: string;
      point: number[];
      approximate: boolean;
    }[];
  }>({
    viewBox: "0 0 640 580",
    countries: [],
    branches: [],
  });
  const [mapError, setMapError] = useState(false);
  useEffect(() => {
    fetch("/maps/africa.json")
      .then((response) => {
        if (!response.ok) throw new Error("Map asset unavailable");
        return response.json();
      })
      .then(setMap)
      .catch(() => setMapError(true));
  }, []);
  const [region, setRegion] = useState("All regions");
  const [selected, setSelected] = useState("ZAF");
  const [countryFilter, setCountryFilter] = useState("All countries");
  const [hovered, setHovered] = useState("");
  const id = useId().replaceAll(":", "");
  const verified = marketsContent
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
  for (const branch of branches.filter(
    (b, i, all) =>
      b.code !== "ZAF" && all.findIndex((a) => a.code === b.code) === i,
  )) {
    markets.push({
      id: `company-branch-${branch.code}`,
      title: branch.name,
      description: "Connected to our South African headquarters.",
      body: "Contact our team for branch enquiries and local support.",
      market: {
        countryCode: branch.code,
        type: "distribution",
        locations: branch.locations,
      },
    });
  }
  if (
    !markets.some(
      (x) => x.market.countryCode === "ZAF" && x.market.type === "headquarters",
    )
  )
    markets.unshift(hq);
  const visible = markets
    .filter(
      (x) =>
        region === "All regions" ||
        countries.find((c) => c.code === x.market.countryCode)?.region ===
          region,
    )
    .filter(
      (x) =>
        countryFilter === "All countries" ||
        x.market.countryCode === countryFilter,
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
            One connected African network.
            <br />
            South African roots. Local connections across the continent.
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
                setCountryFilter("All countries");
                setSelected(
                  r === "All regions"
                    ? "ZAF"
                    : visible.find(
                        (x) =>
                          countries.find((c) => c.code === x.market.countryCode)
                            ?.region === r,
                      )?.market.countryCode || "ZAF",
                );
                setHovered("");
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <label className="map-country-filter">
          <span>Show branches</span>
          <select
            aria-label="Filter map by country"
            value={countryFilter}
            onChange={(event) => {
              const code = event.target.value;
              setCountryFilter(code);
              setSelected(
                code === "All countries"
                  ? codes.includes("ZAF")
                    ? "ZAF"
                    : codes[0]
                  : code,
              );
            }}
          >
            <option value="All countries">All countries in region</option>
            {codes.map((code) => (
              <option key={code} value={code}>
                {countries.find((country) => country.code === code)?.name ||
                  code}
              </option>
            ))}
          </select>
        </label>
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
                  <marker
                    id={`${id}-branch-arrow`}
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3.5"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path d="M0 0 7 3.5 0 7Z" fill="#14785e" />
                  </marker>
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
                            "aria-label": `${country.name}: ${records.map((x) => (x.id.startsWith("company-branch-") ? "Branch" : marketLabels[x.market.type])).join(", ")}`,
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
                <g
                  className="branch-connections"
                  aria-hidden="true"
                  pointerEvents="none"
                >
                  {(map.branches || [])
                    .filter((b) => b.code !== "ZAF" && codes.includes(b.code))
                    .map((branch, i) => {
                      const origin = map.branches?.find(
                        (b) => b.code === "ZAF",
                      )?.point;
                      if (!origin) return null;
                      const [x, y] = branch.point;
                      const [ox, oy] = origin;
                      const curve = `M ${ox} ${oy} Q ${Math.min(ox, x) - 42} ${(oy + y) / 2} ${x} ${y}`;
                      return (
                        <g key={`${branch.code}-${branch.city || i}`}>
                          <motion.path
                            className="branch-route"
                            d={curve}
                            markerEnd={`url(#${id}-branch-arrow)`}
                            initial={false}
                            whileInView={
                              reduced
                                ? {}
                                : { pathLength: [0, 1], opacity: [0.2, 1] }
                            }
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: i * 0.13 }}
                          />
                          <text
                            className="branch-city-label"
                            x={
                              x +
                              (branch.city === "Lusaka" || branch.code === "MOZ"
                                ? -9
                                : 10)
                            }
                            y={
                              y +
                              (branch.code === "MOZ"
                                ? 25
                                : branch.city === "Blantyre"
                                  ? 15
                                  : -11)
                            }
                            textAnchor={
                              branch.city === "Lusaka" || branch.code === "MOZ"
                                ? "end"
                                : "start"
                            }
                          >
                            {branch.city || branch.name}
                          </text>
                        </g>
                      );
                    })}
                  {(map.branches || [])
                    .filter((b) => b.code === "ZAF")
                    .map((branch) => (
                      <g key="headquarters">
                        <text
                          className="branch-city-label"
                          x={branch.point[0] + 12}
                          y={branch.point[1] + 5}
                        >
                          South Africa · HQ
                        </text>
                      </g>
                    ))}
                </g>
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
                  {type === "distribution" ? "Branches / distribution" : label}
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
              . Lines show branch connections, not transport routes. City
              markers are approximate; country-level markers do not indicate
              street addresses.
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
                        {item.id.startsWith("company-branch-")
                          ? "Branch"
                          : marketLabels[item.market.type]}
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
          </div>
        </div>
      </div>
    </section>
  );
}
export function CaseStudies() {
  const items = publicContent.caseStudies.filter(
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
