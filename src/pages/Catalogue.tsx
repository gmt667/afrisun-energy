import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Sun,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PageHero,
  ContentCard,
  Eyebrow,
  Button,
  Markdown,
} from "../components";
import { SEO } from "../seo";
import { formatDate, readingTime } from "../lib";
import { categories, insightTopics } from "../../shared/content";
import type { Content } from "../../shared/schemas";
import { publicContent } from "../../shared/public-content";
import { EnquiryForm } from "../forms";
import { SourceReference } from "../ContentDetails";
import { detailsOf } from "../../shared/enhancements";
type Listing = { items: Content[]; total: number; page: number };
const matchingContent = (items: Content[], query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) =>
    [item.title, item.description, item.body, item.brand, item.model]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
};
export function Catalogue({ articles = false }: { articles?: boolean }) {
  const [params, setParams] = useSearchParams();
  const source = articles ? publicContent.articles : publicContent.products;
  const q = params.get("q") || "";
  const selected = params.get("category") || "";
  const category = categories.find((item) => item.slug === selected);
  const topic = insightTopics.find((item) => item.slug === selected);
  const brand = params.get("brand") || "";
  const specification = params.get("specification") || "";
  const specValue = params.get("specValue") || "";
  const filtered = matchingContent(source, q).filter((item) => {
    const categoryMatches =
      !selected ||
      item.category === selected ||
      item.category === category?.name ||
      item.category === topic?.label;
    const brandMatches = articles || !brand || item.brand === brand;
    const specificationMatches =
      articles ||
      !specification ||
      item.specifications.some(
        (item) => item.name === specification && item.value === specValue,
      );
    return categoryMatches && brandMatches && specificationMatches;
  });
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / 12));
  const page = Math.min(pageCount, Math.max(1, Number(params.get("page") || 1)));
  const data: Listing = {
    items: filtered.slice((page - 1) * 12, page * 12),
    total,
    page,
  };
  const cmsCategories = { items: [] as Content[] };
  const facets = {
    brands: [...new Set(source.map((item) => item.brand).filter(Boolean))],
    specifications: [
      ...new Map(
        source
          .flatMap((item) => item.specifications)
          .map((item) => [`${item.name}:${item.value}`, item] as const),
      ).values(),
    ],
  };
  const proposed = categories.find((c) => c.slug === selected);
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };
  return (
    <>
      <SEO
        title={articles ? "Insights" : "Products"}
        description={
          articles
            ? "Perspectives on renewable energy, energy access and supply chains."
            : "Explore Afrisun’s renewable energy catalogue and enquire about verified product availability."
        }
      />
      <PageHero
        label={articles ? "Insights & perspectives" : "Product possibilities"}
        title={
          articles
            ? "Ideas for an energised future."
            : "The right products. A world of possibilities."
        }
        text={
          articles
            ? "Knowledge, perspectives and practical understanding for a changing energy landscape."
            : "Explore renewable energy product categories and connect with us about your sourcing requirements."
        }
      />
      <section className="section">
        <div className="container">
          {!articles && !params.get("q") && !params.get("page") && (
            <div
              className="category-gallery"
              aria-label="Explore product categories"
            >
              {categories
                .filter((category) => !selected || category.slug === selected)
                .map((category) => (
                  <Link
                    key={category.slug}
                    to={`/products?category=${category.slug}`}
                    className="category-gallery-card"
                  >
                    <div>
                      <img
                        src={category.image}
                        alt={`${category.name} — illustrative category photograph`}
                        loading="lazy"
                        width="640"
                        height="480"
                      />
                    </div>
                    <span>
                      <h2>{category.name}</h2>
                      <ArrowUpRight size={20} />
                    </span>
                    <p>{category.description}</p>
                  </Link>
                ))}
            </div>
          )}
          <form
            className="catalogue-toolbar"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <label className="search-field">
              <Search size={20} />
              <span className="sr-only">
                {articles ? "Search articles" : "Search products"}
              </span>
              <input
                placeholder={
                  articles
                    ? "Search insights…"
                    : "Search products, technologies…"
                }
                value={params.get("q") || ""}
                onChange={(e) => change("q", e.target.value)}
              />
            </label>
            <label className="filter-field">
              <SlidersHorizontal size={17} />
              <span className="sr-only">Category</span>
              <select
                value={selected}
                onChange={(e) => change("category", e.target.value)}
              >
                <option value="">All categories</option>
                {articles &&
                  insightTopics
                    .filter(
                      (topic) =>
                        !cmsCategories.items.some((c) => c.slug === topic.slug),
                    )
                    .map((topic) => (
                      <option key={topic.slug} value={topic.slug}>
                        {topic.label}
                      </option>
                    ))}
                {cmsCategories.items.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title}
                  </option>
                ))}
                {!articles &&
                  categories
                    .filter(
                      (c) =>
                        !cmsCategories.items.some((x) => x.slug === c.slug),
                    )
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} (proposed)
                      </option>
                    ))}
              </select>
            </label>
            {!articles && (
              <label className="filter-field">
                <span className="sr-only">Brand</span>
                <select
                  value={params.get("brand") || ""}
                  onChange={(e) => change("brand", e.target.value)}
                >
                  <option value="">All brands</option>
                  {facets.brands.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
            )}
            {!articles && facets.specifications?.length > 0 && (
              <label className="filter-field">
                <span className="sr-only">Technical specification</span>
                <select
                  value={
                    params.get("specification")
                      ? JSON.stringify({
                          name: params.get("specification"),
                          value: params.get("specValue"),
                        })
                      : ""
                  }
                  onChange={(e) => {
                    const next = new URLSearchParams(params);
                    next.delete("page");
                    if (e.target.value) {
                      const spec = JSON.parse(e.target.value) as {
                        name: string;
                        value: string;
                      };
                      next.set("specification", spec.name);
                      next.set("specValue", spec.value);
                    } else {
                      next.delete("specification");
                      next.delete("specValue");
                    }
                    setParams(next, { replace: true });
                  }}
                >
                  <option value="">All specifications</option>
                  {facets.specifications.map((spec) => (
                    <option
                      key={spec.name + spec.value}
                      value={JSON.stringify(spec)}
                    >
                      {spec.name}: {spec.value}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </form>
          {!articles && (
            <p className="fine-print">
              Category suggestions describe potential sourcing interests, not
              confirmed inventory. Only verified, published products appear in
              the catalogue. Installation photographs supplied for this website;
              solar lighting photography by Kindel Media / Pexels; solar-powered
              pump by{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Solar-powered_pump.jpg"
                target="_blank"
                rel="noreferrer"
              >
                James Emery
              </a>
              ,{" "}
              <a
                href="https://creativecommons.org/licenses/by/2.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY 2.0
              </a>{" "}
              (resized and converted to WebP). Photography does not imply
              supplier or installer affiliation.
            </p>
          )}
          {data.items.length ? (
            <>
              <p className="results-count">
                {data.total} {articles ? "articles" : "products"}
              </p>
              {articles && !params.get("q") && !selected && data.page === 1 && (
                <Link
                  className="featured-article"
                  to={`/insights/${data.items[0].slug}`}
                >
                  {data.items[0].image ? (
                    <img
                      src={data.items[0].image}
                      alt={data.items[0].imageAlt}
                    />
                  ) : (
                    <Sun size={90} />
                  )}
                  <div>
                    <Eyebrow>Featured perspective</Eyebrow>
                    <h2>{data.items[0].title}</h2>
                    <p>{data.items[0].description}</p>
                    <span className="text-link">
                      Read article <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              )}
              <div className="three-grid catalogue-results">
                {data.items.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
              <div className="pagination">
                <button
                  className="button button-outline"
                  disabled={data.page <= 1}
                  onClick={() => change("page", String(data.page - 1))}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span>
                  Page {data.page} of {Math.ceil(data.total / 12)}
                </span>
                <button
                  className="button button-outline"
                  disabled={data.page * 12 >= data.total}
                  onClick={() => change("page", String(data.page + 1))}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="catalogue-empty">
              <Sun size={52} strokeWidth={1.1} />
              <Eyebrow>
                {articles
                  ? "The next perspective"
                  : "Sourcing starts with a conversation"}
              </Eyebrow>
              <h2>
                {params.get("q")
                  ? "No matching results."
                  : articles
                    ? "Fresh insights are on the horizon."
                    : proposed
                      ? `Let’s talk ${proposed.name.toLowerCase()}.`
                      : "Your energy needs. Our next conversation."}
              </h2>
              <p>
                {articles
                  ? "Verified articles will appear here as our editorial team publishes them."
                  : proposed
                    ? `${proposed.description} Specific products and availability are awaiting confirmation.`
                    : "Our verified product catalogue is being prepared. Tell us what you need and we can discuss suitable sourcing options."}
              </p>
              {params.get("q") && (
                <button className="text-link" onClick={() => change("q", "")}>
                  Clear search
                </button>
              )}
              <Button
                to={
                  articles
                    ? "/sustainability"
                    : `/contact?interest=${encodeURIComponent(proposed?.name || "Product sourcing")}`
                }
                className="button-navy"
              >
                {articles ? "Explore Our Purpose" : "Discuss Your Requirements"}
              </Button>
            </div>
          )}
          {!articles && (
            <div className="proposed-categories">
              <div className="section-heading">
                <div>
                  <Eyebrow>Explore by application</Eyebrow>
                  <h2>
                    Renewable energy, <em>connected.</em>
                  </h2>
                </div>
                <span className="status-badge">Proposed categories</span>
              </div>
              <div className="three-grid">
                {categories.map((c, i) => (
                  <Link
                    key={c.slug}
                    to={`/products?category=${c.slug}`}
                    className="proposed-category"
                  >
                    <span>0{i + 1}</span>
                    <h3>
                      {c.name}
                      <ArrowUpRight size={20} />
                    </h3>
                    <p>{c.description}</p>
                    <small>Enquire about sourcing</small>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
export function Detail({ article = false }: { article?: boolean }) {
  const { slug } = useParams();
  const source = article ? publicContent.articles : publicContent.products;
  const item = source.find((record) => record.slug === slug);
  const related = item
    ? source.filter(
        (record) => record.category === item.category && record.id !== item.id,
      )
    : [];
  if (!item)
    return (
      <>
        <SEO title="Content unavailable" noindex />
        <PageHero
          label="Afrisun Energy"
          title="This page isn’t available."
          text="It may be unpublished or the address may have changed."
        />
        <div className="container section">
          <Button
            to={article ? "/insights" : "/products"}
            className="button-navy"
          >
            Back to {article ? "Insights" : "Products"}
          </Button>
        </div>
      </>
    );
  return (
    <>
      <SEO
        title={item.seoTitle || item.title}
        description={item.seoDescription || item.description}
        image={item.image || undefined}
        article={
          article && item.publishedAt
            ? { author: item.author, publishedAt: item.publishedAt }
            : undefined
        }
      />
      <div className="container breadcrumbs">
        <Link to={article ? "/insights" : "/products"}>
          {article ? "Insights" : "Products"}
        </Link>
        <span>/</span>
        <span>{item.title}</span>
      </div>
      {article ? (
        <>
          <article className="article-layout container">
            <Eyebrow>{item.category || "Insights"}</Eyebrow>
            <h1>{item.title}</h1>
            <p className="lead">{item.description}</p>
            <div className="article-byline">
              <span>By {item.author}</span>
              {detailsOf(item).news && (
                <span>
                  Source: {detailsOf(item).news?.source} ·{" "}
                  {detailsOf(item).news?.sourcePublishedAt}
                </span>
              )}
              {item.publishedAt && (
                <time dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              )}
              <span>{readingTime(item.body)} min read</span>
            </div>
            {item.image && (
              <img
                className="article-hero"
                src={item.image}
                alt={item.imageAlt}
              />
            )}
            <Markdown>{item.body}</Markdown>
            <SourceReference record={item} />
            <div className="share-links">
              <span>Share this perspective</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <ArrowUpRight size={15} />
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(window.location.href)}`}
              >
                Email <ArrowUpRight size={15} />
              </a>
            </div>
          </article>
        </>
      ) : (
        <section className="section">
          <div className="container">
            <div className="product-detail-grid">
              <div className="product-detail-image">
                {item.image ? (
                  <img src={item.image} alt={item.imageAlt} />
                ) : (
                  <Sun size={100} strokeWidth={1} />
                )}
              </div>
              <div>
                <Eyebrow>{item.brand || "Product catalogue"}</Eyebrow>
                <h1>{item.title}</h1>
                {item.model && <p>Model: {item.model}</p>}
                <span className="status-badge">
                  {item.availability === "enquiry"
                    ? "Availability on enquiry"
                    : item.availability.replace("-", " ")}
                </span>
                <p className="lead">{item.description}</p>
                <Markdown>{item.body}</Markdown>
                <a href="#quote" className="button button-navy">
                  Request a Quote <ArrowUpRight size={18} />
                </a>
                {item.datasheet && (
                  <a
                    className="text-link datasheet-link"
                    href={item.datasheet}
                    download
                  >
                    Download datasheet <Download size={18} />
                  </a>
                )}
              </div>
            </div>
            {item.specifications.length > 0 && (
              <section className="detail-section">
                <Eyebrow>Product information</Eyebrow>
                <h2>Technical specifications</h2>
                <table className="spec-table">
                  <tbody>
                    {item.specifications.map((s) => (
                      <tr key={s.name}>
                        <th scope="row">{s.name}</th>
                        <td>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
            {item.applications && (
              <section className="detail-section">
                <h2>Applications</h2>
                <Markdown>{item.applications}</Markdown>
              </section>
            )}
            {item.warranty && (
              <section className="detail-section">
                <h2>Warranty information</h2>
                <p>{item.warranty}</p>
              </section>
            )}
            <section className="detail-section editorial-grid" id="quote">
              <div>
                <Eyebrow>Let’s connect</Eyebrow>
                <h2>Request a quote.</h2>
                <p>
                  Tell us your quantity and delivery requirements. Commercial
                  terms and availability are confirmed individually.
                </p>
              </div>
              <EnquiryForm
                kind="quote"
                productId={item.id}
                productName={item.title}
              />
            </section>
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="section off-white">
          <div className="container">
            <h2>Related {article ? "perspectives" : "products"}</h2>
            <div className="three-grid">
              {related.slice(0, 3)
                .map((x) => (
                  <ContentCard key={x.id} item={x} />
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
export function SiteSearch() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const products = matchingContent(publicContent.products, q);
  const articles = matchingContent(publicContent.articles, q);
  return (
    <>
      <SEO title="Search" noindex />
      <PageHero
        label="Find your connection"
        title="What are you looking for?"
      />
      <section className="section">
        <div className="container">
          <form role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="search-field">
              <Search />
              <span className="sr-only">
                Search public products and articles
              </span>
              <input
                autoFocus
                value={q}
                placeholder="Search products and insights…"
                onChange={(e) =>
                  setParams(e.target.value ? { q: e.target.value } : {}, {
                    replace: true,
                  })
                }
              />
            </label>
          </form>
          {q && (
            <>
              <h2 className="search-heading">Products</h2>
              {products.length ? (
                <div className="three-grid">
                  {products.map((x) => (
                    <ContentCard key={x.id} item={x} />
                  ))}
                </div>
              ) : (
                <p>No matching published products.</p>
              )}
              <h2 className="search-heading">Insights</h2>
              {articles.length ? (
                <div className="three-grid">
                  {articles.map((x) => (
                    <ContentCard key={x.id} item={x} />
                  ))}
                </div>
              ) : (
                <p>No matching published articles.</p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
