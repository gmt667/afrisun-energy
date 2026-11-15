import { useParams, Link } from "react-router-dom";
import { useApi } from "../lib";
import type { Content } from "../../shared/schemas";
import { detailsOf } from "../../shared/enhancements";
import { SEO } from "../seo";
import { Eyebrow, PageHero, Button, PartnershipCTA } from "../components";
import { StoryNarrative } from "../ContentDetails";
export default function Story() {
  const { slug } = useParams();
  const {
    data: record,
    loading,
    error,
  } = useApi<Content | null>(`/api/content/case-study/${slug}`, null);
  if (loading)
    return (
      <div className="container section loading" role="status">
        Loading story…
      </div>
    );
  if (error || !record)
    return (
      <>
        <SEO title="Story unavailable" noindex />
        <PageHero
          label="Partner perspectives"
          title="This story is not available."
          text="Stories appear only after company and partner approval."
        />
        <div className="container section">
          <Button to="/partners" className="button-navy">
            Explore Partnerships
          </Button>
        </div>
      </>
    );
  return (
    <>
      <SEO
        title={record.seoTitle || record.title}
        description={record.seoDescription || record.description}
        image={record.image || undefined}
      />
      <div className="container breadcrumbs">
        <Link to="/partners">Partnerships</Link>
        <span>/</span>
        <span>{record.title}</span>
      </div>
      <article className="container story-page">
        <header>
          <Eyebrow>
            {detailsOf(record).story?.location || record.category}
          </Eyebrow>
          <h1>{record.title}</h1>
          <p className="lead">{record.description}</p>
        </header>
        {record.image && (
          <img
            className="story-hero"
            src={record.image}
            alt={record.imageAlt}
          />
        )}
        <StoryNarrative record={record} />
      </article>
      <PartnershipCTA />
    </>
  );
}
