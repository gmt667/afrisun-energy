import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company } from "../shared/content";
export function SEO({
  title,
  description = "Connecting renewable energy manufacturers and distributors with retailers. Quality products, supply support and commercial partnerships for Africa’s energy future.",
  image = "/images/solar-aerial.webp",
  article,
  noindex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  article?: { author: string; publishedAt: string };
  noindex?: boolean;
}) {
  const location = useLocation();
  useEffect(() => {
    const pageTitle = `${title} | Afrisun Energy`;
    document.title = pageTitle;
    const origin = window.location.origin;
    const url = origin + location.pathname;
    const metas: Record<string, string> = {
      description,
      "og:title": pageTitle,
      "og:description": description,
      "og:type": article ? "article" : "website",
      "og:url": url,
      "og:image": origin + image,
      "twitter:card": "summary_large_image",
      robots: noindex ? "noindex, nofollow" : "index, follow",
    };
    for (const [key, content] of Object.entries(metas)) {
      const attr = key.startsWith("og:") ? "property" : "name";
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.append(el);
      }
      el.content = content;
    }
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;
    const script =
      document.querySelector<HTMLScriptElement>("#afrisun-structured-data") ||
      document.createElement("script");
    script.id = "afrisun-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(
      article
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            author: { "@type": "Person", name: article.author },
            datePublished: article.publishedAt,
            image: origin + image,
            mainEntityOfPage: url,
            publisher: { "@type": "Organization", name: company.name },
          }
        : {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: origin,
            telephone: company.phone,
            email: company.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: "1 Lawnmarket Road, Morningside Villas",
              addressLocality: "Sandton",
              postalCode: "2196",
              addressCountry: "ZA",
            },
          },
    );
    if (!script.isConnected) document.head.append(script);
    return () => script.remove();
  }, [title, description, image, location.pathname, article, noindex]);
  return null;
}
