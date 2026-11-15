import { Link } from "react-router-dom";
import { ArrowUpRight, Quote } from "lucide-react";
import { detailsOf, safeExternalUrl } from "../shared/enhancements";
import type { ContentInput } from "../shared/schemas";
import { Eyebrow, Markdown } from "./components";
import { services } from "../shared/content";
export function SourceReference({ record }: { record: ContentInput }) {
  const news = detailsOf(record).news;
  if (!news) return null;
  return (
    <aside className="source-reference">
      <Eyebrow>Industry news reference</Eyebrow>
      <h2>From {news.source}</h2>
      <p>
        Originally published{" "}
        <time dateTime={news.sourcePublishedAt}>{news.sourcePublishedAt}</time>.
        This page contains an original short summary; the full report belongs to
        its publisher.
      </p>
      {safeExternalUrl(news.url) && (
        <a
          className="text-link"
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the original at {news.source} <ArrowUpRight size={17} />
        </a>
      )}
    </aside>
  );
}
export function StoryNarrative({ record }: { record: ContentInput }) {
  const story = detailsOf(record).story;
  return (
    <>
      {story && (
        <>
          <div className="story-narrative">
            {[
              ["The challenge", story.challenge],
              ["Afrisun’s contribution", story.contribution],
              ["The outcome", story.results],
            ].map(([title, text], i) => (
              <section key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h2>{title}</h2>
                  <Markdown>{text}</Markdown>
                </div>
              </section>
            ))}
          </div>
          {story.claims.length > 0 && (
            <div className="story-results">
              {story.claims.map((claim) => (
                <div key={claim.label}>
                  <strong>
                    {new Intl.NumberFormat("en-ZA").format(claim.value)}
                    <small>{claim.unit}</small>
                  </strong>
                  <p>{claim.label}</p>
                  {claim.baseline !== null && (
                    <span>Recorded baseline: {claim.baseline}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {story.testimonial && story.quotePermission && (
            <figure className="story-quote">
              <Quote size={36} strokeWidth={1} />
              <blockquote>{story.testimonial}</blockquote>
              <figcaption>{story.attribution}</figcaption>
            </figure>
          )}
        </>
      )}
      <Markdown>{record.body}</Markdown>
      {story && story.relatedServices.length > 0 && (
        <section className="story-related">
          <Eyebrow>Related support</Eyebrow>
          <h2>Continue the connection.</h2>
          {services.map(([title], i) =>
            story.relatedServices.includes(`service-${i + 1}`) ? (
              <Link
                className="text-link"
                key={title}
                to={`/services#service-${i + 1}`}
              >
                {title}
                <ArrowUpRight size={17} />
              </Link>
            ) : null,
          )}
        </section>
      )}
    </>
  );
}
