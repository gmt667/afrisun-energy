import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowUpRight,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow } from "./components";
import { useApi } from "./lib";
import { detailsOf } from "../shared/enhancements";
import type { Content } from "../shared/schemas";
export function VideoStories() {
  const { data } = useApi<{ items: Content[] }>(
    "/api/content?kind=video-story&limit=100",
    { items: [] },
  );
  const [selected, setSelected] = useState(0);
  const [auto, setAuto] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const engaged = hovered || focused;
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const items = data.items.filter(
    (x) =>
      x.status === "published" &&
      x.verified &&
      !x.demo &&
      detailsOf(x).video?.url &&
      detailsOf(x).video?.mediaPermission,
  );
  const index = items.length ? selected % items.length : 0;
  const record = items[index];
  const video = record ? detailsOf(record).video : null;
  useEffect(() => {
    if (!auto || reduced || engaged || playing || items.length < 2) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible")
        setSelected((value) => value + 1);
    }, 9000);
    return () => clearInterval(timer);
  }, [auto, reduced, engaged, playing, items.length]);
  const choose = (next: number) => {
    setSelected((next + items.length) % items.length);
    setAuto(false);
    setPlaying(false);
  };
  return (
    <section
      className="section video-stories"
      aria-labelledby="video-stories-heading"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Client testimonials</Eyebrow>
            <h2 id="video-stories-heading">
              Perspectives from the field.
              <br />
              <em>In our partners’ own words.</em>
            </h2>
          </div>
          <p>
            Experiences shared with permission.
            <br />
            Results grounded in evidence.
          </p>
        </div>
        {record && video ? (
          <div
            className="video-carousel"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                setFocused(false);
            }}
            aria-roledescription="carousel"
            aria-label="Approved partner video stories"
          >
            <div className="video-controls">
              <button
                className="text-link"
                disabled={!!reduced || items.length < 2}
                onClick={() => setAuto(!auto)}
                aria-pressed={auto && !reduced}
              >
                {auto && !reduced ? <Pause size={15} /> : <Play size={15} />}
                Auto-rotate {auto && !reduced ? "on" : "off"}
              </button>
              <span>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")}
              </span>
              <div>
                <button
                  aria-label="Previous video story"
                  onClick={() => choose(index - 1)}
                >
                  <ChevronLeft />
                </button>
                <button
                  aria-label="Next video story"
                  onClick={() => choose(index + 1)}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
            <div className="video-feature" aria-live={auto ? "off" : "polite"}>
              <div className="video-player">
                <video
                  key={record.id}
                  controls
                  preload="none"
                  poster={record.image || undefined}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  aria-label={`${record.title} — ${video.location}`}
                >
                  <source src={video.url} type="video/mp4" />
                  <track
                    kind="captions"
                    src={video.captions}
                    srcLang="en"
                    label="English"
                    default
                  />
                  Your browser does not support video playback.
                </video>
                <details className="video-transcript">
                  <summary>Read the video transcript</summary>
                  <p>{video.transcript}</p>
                </details>
              </div>
              <div className="video-story-copy">
                <Eyebrow>{video.location}</Eyebrow>
                <h3>{record.title}</h3>
                <p>{record.description}</p>
                <span>{video.attribution}</span>
                <Link className="text-link" to="/partners">
                  Partner with us <ArrowUpRight size={17} />
                </Link>
              </div>
            </div>
            <div
              className="video-selector"
              role="group"
              aria-label="Choose a partner video"
            >
              {items.map((item, i) => (
                <button
                  key={item.id}
                  aria-pressed={index === i}
                  onClick={() => choose(i)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                  <small>{detailsOf(item).video?.location}</small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="video-awaiting">
            <Video size={40} strokeWidth={1} />
            <div>
              <h3>
                Stories worth hearing.
                <br />
                Shared when they’re ready.
              </h3>
              <p>
                Approved partner videos will appear here with captions and
                transcripts. We do not present illustrative footage or customer
                experiences as company results.
              </p>
              <Link className="text-link" to="/partners">
                Share your interest in a partnership <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
