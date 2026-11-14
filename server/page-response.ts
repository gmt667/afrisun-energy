import type { Request, Response } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db.js";
import { renderPublic } from "./render-public.js";
import type { Content } from "../shared/schemas.js";
import { company } from "../shared/content.js";

const labels: Record<string, string> = {
  "/": "Powering Africa’s Future",
  "/about": "About Us",
  "/products": "Products",
  "/services": "Services",
  "/industries": "Industries & Applications",
  "/sustainability": "Sustainability & Impact",
  "/insights": "Insights",
  "/partners": "Partnerships",
  "/contact": "Get in Touch",
  "/privacy": "Privacy Policy",
  "/cookies": "Cookie Policy",
  "/search": "Search",
};
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function pageResponse(req: Request, res: Response) {
  const origin = new URL(process.env.SITE_URL!).origin;
  const pathname = req.path;
  let item: Content | null = null;
  const match = /^\/(products|insights)\/([a-z0-9-]+)$/.exec(pathname);
  if (match && process.env.DATABASE_URL) {
    const record = await db.content.findFirst({
      where: {
        kind: match[1] === "products" ? "product" : "article",
        slug: match[2],
        status: "published",
        verified: true,
        demo: false,
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
      },
    });
    if (record) item = JSON.parse(JSON.stringify(record)) as Content;
  }
  const known =
    Object.hasOwn(labels, pathname) || !!item || pathname.startsWith("/admin");
  const title = `${item?.seoTitle || item?.title || labels[pathname] || "Page not found"} | Afrisun Energy`;
  const description =
    item?.seoDescription ||
    item?.description ||
    "Connecting renewable energy manufacturers and distributors with retailers. Powering Africa’s Future.";
  let html = await readFile(path.resolve("dist/index.html"), "utf8");
  const url = origin + pathname;
  const image = origin + (item?.image || "/images/solar-aerial.webp");
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escape(description)}"/>`,
    );
  const noindex =
    !known || pathname.startsWith("/admin") || pathname === "/search";
  const metadata = `<link rel="canonical" href="${escape(url)}"/><meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow"}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${escape(url)}"/><meta property="og:image" content="${escape(image)}"/><meta property="og:type" content="${item?.kind === "article" ? "article" : "website"}"/><meta name="twitter:card" content="summary_large_image"/>`;
  html = html.replace("</head>", metadata + "</head>");
  const structured =
    item?.kind === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: item.title,
          description: item.description,
          datePublished: item.publishedAt,
          author: { "@type": "Person", name: item.author },
          publisher: { "@type": "Organization", name: company.name },
          mainEntityOfPage: url,
          image,
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
        };
  html = html.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(structured).replaceAll("<", "\\u003c")}</script></head>`,
  );
  // Server-rendered public content is available to crawlers before client React mounts.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${renderPublic(pathname, item)}</div>`,
  );
  res
    .status(known ? 200 : 404)
    .type("html")
    .send(html);
}
