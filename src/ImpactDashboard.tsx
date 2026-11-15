import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { House, Sun, Store, HeartPulse, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApi } from "./lib";
import { Eyebrow, Reveal } from "./components";
import { detailsOf, type ContentDetails } from "../shared/enhancements";
import type { Content } from "../shared/schemas";
const pillars = [
  {
    key: "households",
    label: "Households powered",
    icon: House,
    text: "Reliable lighting and household power that can open up everyday possibilities.",
  },
  {
    key: "capacity",
    label: "Solar & storage capacity",
    icon: Sun,
    text: "Appropriately specified renewable energy products that support reliable access.",
  },
  {
    key: "partners",
    label: "Retail & distribution partners",
    icon: Store,
    text: "Stronger supply relationships that help local retailers serve their communities.",
  },
  {
    key: "institutions",
    label: "Clinics, schools & businesses",
    icon: HeartPulse,
    text: "Power for longer learning, essential care and productive working hours.",
  },
] as const;
function Counter({
  metric,
}: {
  metric: NonNullable<ContentDetails["metric"]>;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [number, setNumber] = useState(metric.value || 0);
  useEffect(() => {
    if (!visible || reduced) {
      setNumber(metric.value || 0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const fraction = Math.min(1, (time - start) / 1100);
      setNumber((metric.value || 0) * (1 - Math.pow(1 - fraction, 3)));
      if (fraction < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [metric.value, visible, reduced]);
  const format = (n: number) =>
    new Intl.NumberFormat("en-ZA", {
      minimumFractionDigits: metric.decimals,
      maximumFractionDigits: metric.decimals,
    }).format(n);
  return (
    <span ref={ref} className="impact-value">
      <span className="sr-only">
        {format(metric.value || 0)}
        {metric.suffix} {metric.unit}
      </span>
      <span aria-hidden="true">
        {format(number)}
        {metric.suffix}
        <small>{metric.unit}</small>
      </span>
    </span>
  );
}
export function ImpactDashboard() {
  const { data, error } = useApi<{ items: Content[] }>(
    "/api/content?kind=metric",
    { items: [] },
  );
  const metrics = data.items
    .filter((x) => x.status === "published" && x.verified && !x.demo)
    .map((item) => ({ item, metric: detailsOf(item).metric }))
    .filter((x) => x.metric && x.metric.value !== null);
  return (
    <section
      className="section impact-dashboard"
      aria-labelledby="impact-heading"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Our impact</Eyebrow>
            <h2 id="impact-heading">
              Access is the beginning.
              <br />
              <em>Opportunity is the impact.</em>
            </h2>
          </div>
          <p>
            Connecting the supply chain.
            <br />
            Supporting possibilities at the last mile.
          </p>
        </div>
        <div className="impact-context">
          <span>SDG 7 · Clean energy access</span>
          <span>Mission 300 · Shared ambition</span>
          <span>
            {metrics.length
              ? "Verified company measurements"
              : "Our intended contribution"}
          </span>
        </div>
        <div className="impact-metrics">
          {pillars.map((pillar, i) => {
            const entry = metrics.find((x) => x.metric?.key === pillar.key);
            const m = entry?.metric;
            const progress =
              m?.value !== null && m?.value !== undefined && m.target
                ? Math.min(100, (m.value / m.target) * 100)
                : null;
            return (
              <Reveal
                className="impact-metric"
                key={pillar.key}
                delay={i * 0.06}
              >
                <div className="impact-metric-top">
                  <pillar.icon size={22} strokeWidth={1.4} />
                  <span>0{i + 1}</span>
                </div>
                {m ? (
                  <Counter metric={m} />
                ) : (
                  <span className="impact-intent">
                    {
                      [
                        "Everyday possibility",
                        "Reliable clean power",
                        "Stronger connections",
                        "Productive communities",
                      ][i]
                    }
                  </span>
                )}
                <h3>{pillar.label}</h3>
                <p>{entry?.item.description || pillar.text}</p>
                {m ? (
                  <>
                    <p className="metric-asof">Measured {m.asOf}</p>
                    {progress !== null && (
                      <div className="metric-target">
                        <div>
                          <span>Company target · {m.targetYear}</span>
                          <strong>{Math.round(progress)}%</strong>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`${pillar.label} company target progress`}
                          aria-valuenow={Math.round(progress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="metric-track"
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <small>
                          Target:{" "}
                          {new Intl.NumberFormat("en-ZA").format(m.target!)}{" "}
                          {m.unit}. Company target, separate from Mission 300.
                        </small>
                      </div>
                    )}
                    <details className="metric-method">
                      <summary>How this is measured</summary>
                      <p>{m.methodology}</p>
                    </details>
                  </>
                ) : (
                  <span className="metric-pending">
                    Purpose in action · figures awaiting verification
                  </span>
                )}
              </Reveal>
            );
          })}
        </div>
        <div className="impact-footnote">
          <p>
            {error
              ? "Verified measurements are temporarily unavailable. Our intended impact areas are shown above."
              : metrics.length
                ? "Published measurements are supported by company-reviewed data. They do not represent results achieved by Mission 300."
                : "We will publish company results when measurement methods and supporting data have been verified. No illustrative figures are presented as achievements."}
          </p>
          <Link className="text-link" to="/sustainability">
            Our sustainability approach <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
