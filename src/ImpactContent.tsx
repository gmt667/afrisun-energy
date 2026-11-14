import { useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApi } from "./lib";
import { Eyebrow, Markdown, Reveal } from "./components";
import type { Content } from "../shared/schemas";
export function Footprint() {
  const { data } = useApi<{ items: Content[] }>("/api/content?kind=market", {
    items: [],
  });
  const [region, setRegion] = useState("All regions");
  const [selected, setSelected] = useState("");
  const regions = [
    ...new Set(data.items.map((x) => x.category).filter(Boolean)),
  ];
  const items = data.items.filter(
    (x) => region === "All regions" || x.category === region,
  );
  const current = items.find((x) => x.id === selected) || items[0];
  return (
    <section className="section footprint">
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Continental connections</Eyebrow>
            <h2>
              Rooted in Sandton.
              <br />
              <em>Connected by ambition.</em>
            </h2>
          </div>
          <p>
            South African headquarters.
            <br />A purpose shaped by Africa’s energy future.
          </p>
        </div>
        {data.items.length > 0 ? (
          <>
            <div
              className="region-filters"
              role="group"
              aria-label="Filter markets by region"
            >
              {["All regions", ...regions].map((r) => (
                <button
                  key={r}
                  aria-pressed={region === r}
                  onClick={() => {
                    setRegion(r);
                    setSelected("");
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="footprint-grid">
              <div className="market-list" aria-label="Verified markets">
                {items.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setSelected(x.id)}
                    aria-pressed={current?.id === x.id}
                  >
                    <MapPin size={17} />
                    <span>
                      <strong>{x.title}</strong>
                      <small>{x.description}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
              {current && (
                <Reveal className="market-detail">
                  <Eyebrow>{current.category}</Eyebrow>
                  <h3>{current.title}</h3>
                  <p className="lead">{current.description}</p>
                  <Markdown>{current.body}</Markdown>
                  <Link
                    className="text-link"
                    to={`/partners?market=${current.slug}`}
                  >
                    Partner in {current.title} <ArrowUpRight size={17} />
                  </Link>
                </Reveal>
              )}
            </div>
          </>
        ) : (
          <div className="headquarters-panel">
            <div className="hq-symbol">
              <MapPin size={48} strokeWidth={1} />
              <span>26° S / 28° E</span>
            </div>
            <div>
              <Eyebrow>Headquarters · South Africa</Eyebrow>
              <h3>Sandton, Johannesburg</h3>
              <p>
                1 Lawnmarket Road, Morningside Villas
                <br />
                Sandton, 2196, South Africa
              </p>
              <Link className="text-link" to="/partners">
                Explore a supply-chain partnership <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
export function CaseStudies() {
  const { data } = useApi<{ items: Content[] }>(
    "/api/content?kind=case-study",
    { items: [] },
  );
  if (!data.items.length) return null;
  return (
    <section className="section off-white">
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Partner perspectives</Eyebrow>
            <h2>
              Connections that
              <br />
              <em>make a difference.</em>
            </h2>
          </div>
          <Link className="text-link" to="/partners">
            Become a retail partner <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="three-grid">
          {data.items.map((x) => (
            <article className="case-study" key={x.id}>
              <Eyebrow>{x.category}</Eyebrow>
              <h3>{x.title}</h3>
              <p className="lead">{x.description}</p>
              <Markdown>{x.body}</Markdown>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
