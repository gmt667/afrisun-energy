import { renderToString } from "react-dom/server";
import { StaticRouter, Link } from "react-router-dom";
import { Header, Footer, Markdown, PageHero } from "../src/components.js";
import Home from "../src/pages/Home.js";
import {
  About,
  Services,
  Industries,
  Sustainability,
  Partners,
} from "../src/pages/CompanyPages.js";
import Contact from "../src/pages/Contact.js";
import { Catalogue, SiteSearch } from "../src/pages/Catalogue.js";
import Legal from "../src/pages/Legal.js";
import type { Content } from "../shared/schemas.js";

export function renderPublic(pathname: string, item: Content | null) {
  const pages: Record<string, React.ReactNode> = {
    "/": <Home />,
    "/about": <About />,
    "/products": <Catalogue />,
    "/services": <Services />,
    "/industries": <Industries />,
    "/sustainability": <Sustainability />,
    "/insights": <Catalogue articles />,
    "/partners": <Partners />,
    "/contact": <Contact />,
    "/privacy": <Legal />,
    "/cookies": <Legal cookies />,
    "/search": <SiteSearch />,
  };
  if (pathname.startsWith("/admin")) return "";
  const page = item ? (
    <article className="container article-layout">
      <p className="eyebrow">{item.category || item.kind}</p>
      <h1>{item.title}</h1>
      <p className="lead">{item.description}</p>
      {item.image && (
        <img className="article-hero" src={item.image} alt={item.imageAlt} />
      )}
      <Markdown>{item.body}</Markdown>
      {item.kind === "product" && (
        <Link className="button button-navy" to={`${pathname}#quote`}>
          Request a Quote
        </Link>
      )}
    </article>
  ) : (
    pages[pathname] || (
      <PageHero
        label="404 — Afrisun Energy"
        title="Let’s reconnect you."
        text="This page is unavailable or has moved."
      />
    )
  );
  return renderToString(
    <StaticRouter location={pathname}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{page}</main>
      <Footer />
    </StaticRouter>,
  );
}
