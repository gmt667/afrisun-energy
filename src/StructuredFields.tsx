import {
  detailsSchema,
  emptyDetails,
  impactKeys,
  marketTypes,
  marketLabels,
  type ContentDetails,
} from "../shared/enhancements";
import type { ContentInput } from "../shared/schemas";
import countries from "../shared/africa-countries.json" with { type: "json" };
import { services } from "../shared/content";
export function StructuredFields({
  record,
  onChange,
}: {
  record: ContentInput;
  onChange: (details: ContentDetails) => void;
}) {
  const details = { ...emptyDetails, ...record.details };
  const input = (
    label: string,
    value: string,
    set: (value: string) => void,
    type = "text",
    multiline = false,
  ) => (
    <label className={`form-field ${multiline ? "full-width" : ""}`}>
      {label}
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )}
    </label>
  );
  const metric =
    details.metric ||
    detailsSchema.parse({ metric: { key: "households" } }).metric!;
  const setMetric = (patch: Partial<typeof metric>) =>
    onChange({ ...details, metric: { ...metric, ...patch } });
  const market = details.market || detailsSchema.parse({ market: {} }).market!;
  const setMarket = (patch: Partial<typeof market>) =>
    onChange({ ...details, market: { ...market, ...patch } });
  const story = details.story || detailsSchema.parse({ story: {} }).story!;
  const setStory = (patch: Partial<typeof story>) =>
    onChange({ ...details, story: { ...story, ...patch } });
  const news = details.news || detailsSchema.parse({ news: {} }).news!;
  const setNews = (patch: Partial<typeof news>) =>
    onChange({ ...details, news: { ...news, ...patch } });
  const network =
    details.network || detailsSchema.parse({ network: {} }).network!;
  const video = details.video || detailsSchema.parse({ video: {} }).video!;
  const setVideo = (patch: Partial<typeof video>) =>
    onChange({ ...details, video: { ...video, ...patch } });
  return (
    <div className="structured-fields">
      <h2>Verification & structured content</h2>
      <p>
        Drafts can remain incomplete. Publication requires the applicable fields
        below and administrator approval. Evidence is private.
      </p>
      {input(
        "Supporting evidence / permission references (private)",
        details.evidence,
        (value) => onChange({ ...details, evidence: value }),
        "text",
        true,
      )}
      <div className="form-grid">
        {record.kind === "metric" && (
          <>
            <label className="form-field">
              Impact area
              <select
                value={details.metric?.key || ""}
                onChange={(e) =>
                  setMetric({ key: e.target.value as typeof metric.key })
                }
              >
                <option value="" disabled>
                  Choose impact area
                </option>
                {impactKeys.map((key) => (
                  <option key={key}>{key}</option>
                ))}
              </select>
            </label>
            {input(
              "Verified value",
              metric.value === null ? "" : String(metric.value),
              (v) => setMetric({ value: v === "" ? null : Number(v) }),
              "number",
            )}
            <label className="form-field">
              Unit
              <select
                value={metric.unit}
                onChange={(e) =>
                  setMetric({ unit: e.target.value as typeof metric.unit })
                }
              >
                <option value="">Count (no unit)</option>
                <option>MW</option>
                <option>MWh</option>
              </select>
            </label>
            <label className="form-field">
              Display suffix
              <select
                value={metric.suffix}
                onChange={(e) =>
                  setMetric({ suffix: e.target.value as typeof metric.suffix })
                }
              >
                <option value="">Exact count</option>
                <option value="+">+ (verified lower bound)</option>
              </select>
            </label>
            {input(
              "Decimal places (0–2)",
              String(metric.decimals),
              (v) => setMetric({ decimals: Number(v) }),
              "number",
            )}
            {input(
              "Measured as of",
              metric.asOf,
              (v) => setMetric({ asOf: v }),
              "date",
            )}
            {input(
              "Company target (optional)",
              metric.target === null ? "" : String(metric.target),
              (v) => setMetric({ target: v === "" ? null : Number(v) }),
              "number",
            )}
            {input(
              "Target year (optional)",
              metric.targetYear === null ? "" : String(metric.targetYear),
              (v) => setMetric({ targetYear: v === "" ? null : Number(v) }),
              "number",
            )}
            {input(
              "Measurement methodology (public)",
              metric.methodology,
              (v) => setMetric({ methodology: v }),
              "text",
              true,
            )}
          </>
        )}
        {record.kind === "market" && (
          <>
            <label className="form-field">
              Country / territory
              <select
                value={details.market?.countryCode || ""}
                onChange={(e) => setMarket({ countryCode: e.target.value })}
              >
                <option value="" disabled>
                  Choose a country
                </option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} · {c.region}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Presence category
              <select
                value={market.type}
                onChange={(e) =>
                  setMarket({ type: e.target.value as typeof market.type })
                }
              >
                {marketTypes.map((type) => (
                  <option value={type} key={type}>
                    {marketLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            {input(
              "Verified location description — no invented coordinates",
              market.locations,
              (v) => setMarket({ locations: v }),
              "text",
              true,
            )}
            <p className="fine-print full-width">
              A published planned expansion remains labelled as a plan, never an
              active market. Country boundaries use the sourced geographic
              dataset.
            </p>
          </>
        )}
        {record.kind === "case-study" && (
          <>
            {input("Approved partner location", story.location, (v) =>
              setStory({ location: v }),
            )}
            {input(
              "Business challenge",
              story.challenge,
              (v) => setStory({ challenge: v }),
              "text",
              true,
            )}
            {input(
              "Afrisun contribution",
              story.contribution,
              (v) => setStory({ contribution: v }),
              "text",
              true,
            )}
            {input(
              "Verified results",
              story.results,
              (v) => setStory({ results: v }),
              "text",
              true,
            )}
            {input(
              "Approved testimonial (optional)",
              story.testimonial,
              (v) => setStory({ testimonial: v }),
              "text",
              true,
            )}
            {input("Approved testimonial attribution", story.attribution, (v) =>
              setStory({ attribution: v }),
            )}
            <label className="consent">
              <input
                type="checkbox"
                checked={story.quotePermission}
                onChange={(e) =>
                  setStory({ quotePermission: e.target.checked })
                }
              />
              Written permission to publish this quotation is on file
            </label>
            <div className="full-width">
              <h3>Numerical claims</h3>
              <p className="fine-print">
                Add each numerical result. Percentage values and
                baseline/multiplier arithmetic are checked; company evidence is
                still required.
              </p>
              {story.claims.map((claim, i) => (
                <div className="claim-editor" key={i}>
                  {input("Claim label", claim.label, (v) =>
                    setStory({
                      claims: story.claims.map((c, j) =>
                        j === i ? { ...c, label: v } : c,
                      ),
                    }),
                  )}
                  {input(
                    "Result value",
                    String(claim.value),
                    (v) =>
                      setStory({
                        claims: story.claims.map((c, j) =>
                          j === i ? { ...c, value: Number(v) } : c,
                        ),
                      }),
                    "number",
                  )}
                  {input("Result unit", claim.unit, (v) =>
                    setStory({
                      claims: story.claims.map((c, j) =>
                        j === i ? { ...c, unit: v } : c,
                      ),
                    }),
                  )}
                  {input(
                    "Baseline (optional)",
                    claim.baseline === null ? "" : String(claim.baseline),
                    (v) =>
                      setStory({
                        claims: story.claims.map((c, j) =>
                          j === i
                            ? { ...c, baseline: v === "" ? null : Number(v) }
                            : c,
                        ),
                      }),
                    "number",
                  )}
                  {input(
                    "Multiplier (optional)",
                    claim.multiplier === null ? "" : String(claim.multiplier),
                    (v) =>
                      setStory({
                        claims: story.claims.map((c, j) =>
                          j === i
                            ? { ...c, multiplier: v === "" ? null : Number(v) }
                            : c,
                        ),
                      }),
                    "number",
                  )}
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      setStory({
                        claims: story.claims.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Remove claim
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setStory({
                    claims: [
                      ...story.claims,
                      {
                        label: "",
                        value: 0,
                        unit: "",
                        baseline: null,
                        multiplier: null,
                      },
                    ],
                  })
                }
              >
                Add numerical claim
              </button>
              <h3>Related services</h3>
              {services.map(([title], i) => (
                <label className="consent" key={title}>
                  <input
                    type="checkbox"
                    checked={story.relatedServices.includes(`service-${i + 1}`)}
                    onChange={(e) =>
                      setStory({
                        relatedServices: e.target.checked
                          ? [...story.relatedServices, `service-${i + 1}`]
                          : story.relatedServices.filter(
                              (x) => x !== `service-${i + 1}`,
                            ),
                      })
                    }
                  />
                  {title}
                </label>
              ))}
            </div>
          </>
        )}
        {record.kind === "article" && (
          <div className="full-width">
            <label className="consent">
              <input
                type="checkbox"
                checked={!!details.news}
                onChange={(e) =>
                  onChange({ ...details, news: e.target.checked ? news : null })
                }
              />
              This is an attributed external news reference (short original
              summary only)
            </label>
            {details.news && (
              <div className="form-grid">
                {input("Source / publisher", news.source, (v) =>
                  setNews({ source: v }),
                )}
                {input(
                  "Original source URL (HTTPS)",
                  news.url,
                  (v) => setNews({ url: v }),
                  "url",
                )}
                {input(
                  "Original publication date",
                  news.sourcePublishedAt,
                  (v) => setNews({ sourcePublishedAt: v }),
                  "date",
                )}
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={news.linkChecked}
                    onChange={(e) => setNews({ linkChecked: e.target.checked })}
                  />
                  I opened and checked this source URL, title and publication
                  date
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={news.originalSummary}
                    onChange={(e) =>
                      setNews({ originalSummary: e.target.checked })
                    }
                  />
                  The summary and body are original writing; the full article is
                  not reproduced
                </label>
              </div>
            )}
          </div>
        )}
        {record.kind === "network-partner" && (
          <>
            {input("Approved partner role", network.role, (v) =>
              onChange({ ...details, network: { ...network, role: v } }),
            )}
            <label className="consent">
              <input
                type="checkbox"
                checked={network.namePermission}
                onChange={(e) =>
                  onChange({
                    ...details,
                    network: { ...network, namePermission: e.target.checked },
                  })
                }
              />
              Permission to publicly name this organisation is on file
            </label>
          </>
        )}
        {record.kind === "video-story" && (
          <>
            {input("MP4 video URL from media library", video.url, (v) =>
              setVideo({ url: v }),
            )}
            {input(
              "English WebVTT caption URL from media library",
              video.captions,
              (v) => setVideo({ captions: v }),
            )}
            {input("Approved filming / story location", video.location, (v) =>
              setVideo({ location: v }),
            )}
            {input(
              "Duration in seconds (only if verified)",
              video.durationSeconds === null
                ? ""
                : String(video.durationSeconds),
              (v) => setVideo({ durationSeconds: v === "" ? null : Number(v) }),
              "number",
            )}
            {input(
              "Approved attribution / spokesperson",
              video.attribution,
              (v) => setVideo({ attribution: v }),
            )}
            {input(
              "Accessible transcript",
              video.transcript,
              (v) => setVideo({ transcript: v }),
              "text",
              true,
            )}
            <label className="consent full-width">
              <input
                type="checkbox"
                checked={video.mediaPermission}
                onChange={(e) =>
                  setVideo({ mediaPermission: e.target.checked })
                }
              />
              Written permission covers the video, featured people, organisation
              and claimed results
            </label>
          </>
        )}
        {record.kind === "faq" && (
          <label className="form-field">
            FAQ category
            <select
              value={details.faq?.group || ""}
              onChange={(e) =>
                onChange({
                  ...details,
                  faq: {
                    group: e.target.value as
                      "Payment Terms" | "Partnership Criteria",
                  },
                })
              }
            >
              <option value="" disabled>
                Select category
              </option>
              <option>Payment Terms</option>
              <option>Partnership Criteria</option>
            </select>
            <span>
              Write the answer in the main content field. Do not promise
              unconfirmed credit terms.
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
