# Afrisun Energy

React corporate platform for Afrisun Energy (Pty) Ltd. Built with React 19, Vite, strict TypeScript, Tailwind CSS 4, Motion, React Router, React Hook Form and Zod. The separate Express 5 server renders public pages for initial HTML and provides a Prisma 6/PostgreSQL API. **This project does not use Next.js.**

## Run locally

Use Node 22.12+ (Node 22 LTS recommended) and npm:

```sh
npm ci
npm run db:generate
npm run dev
```

Open `http://localhost:5173`. The development proxy connects to the API on port 3001. Use `localhost`, matching the default `SITE_URL`, when submitting forms or signing in. Public pages and honest empty catalogues work without a database; enquiry submission and administration are unavailable until configured.

## Configure the database and administration

1. Copy `.env.example` to `.env`. Never commit `.env`.
2. Create a PostgreSQL database and configure `DATABASE_URL`. Set `SITE_URL` to the exact browser origin.
3. Set a cryptographically random `SESSION_SECRET` of at least 32 characters.
4. Run `npm run db:migrate`, then `npm run db:seed`. Seeding creates proposed categories as drafts; it does not invent products, stock or news.
5. Set `ADMIN_PASSWORD` in your process environment to a unique password of at least 14 characters. Run `npm run admin:create`, enter the email and name, then remove `ADMIN_PASSWORD` from the environment. No default account or public registration exists.
6. Open `/admin`. Administrators can manage users, content, media, enquiries, exports and audit records. Editors can manage content and media but cannot view personal enquiry records, exports, audit logs or users.

For local PostgreSQL you can use `docker compose up -d db`; configure its secrets as described in [deployment](docs/DEPLOYMENT.md).

## Content workflow

- Products, articles, product categories, article categories, homepage content, company introductions and optional metrics share a versioned content model.
- New records default to draft. Publication requires explicit business verification and excludes demonstration records. Articles also require a body, author and publication time; published images require alternative text.
- Future publication times are filtered on every public query; no unreliable in-process scheduling timer is used. Unpublish by switching back to draft, or archive.
- Markdown supports headings, images, links and tables. Raw HTML is disabled. Draft previews render inside the authenticated content studio.
- Upload images, PDFs, MP4 videos or WebVTT captions in Media, then use the returned URL in a record. Images are decoded, resized, stripped of metadata and re-encoded as WebP. JPEG, PNG, WebP and PDF uploads are limited to 10 MB, MP4 to 50 MB, and WebVTT to 1 MB. Only upload vetted media; production malware scanning and video compatibility review are operator responsibilities.
- Product specifications are entered one `name: value` per line. Model, warranty, datasheet and availability remain empty/on enquiry until supplied and verified.
- Homepage content with slug `hero` overrides the hero heading/summary. Company content with slug `introduction` overrides the introduction heading/summary. Homepage featured products use published featured product records. Metrics are displayed only when published, verified and non-demonstration.
- Static approved address, registration and legal details are kept in `shared/content.ts`; update them through code review. The CMS is deliberately scoped rather than a general-purpose page builder.
- Proposed category tiles remain clearly labelled suggestions, even before administrators activate actual catalogue categories. Deactivated catalogue categories should have their products moved or unpublished by the editor.

## Enquiries and email

Contact, quote and partnership requests are validated by the same Zod schema in browser and API. Submission is **disabled by default**. Activate only after database, operational ownership and privacy review by setting `ENQUIRIES_ENABLED=true`.

Requests use origin checks, rate limits, a honeypot and a signed, expiring time challenge. Quote requests must refer to a verified public product. The response confirms durable storage, not delivery to a human. The API optionally sends a notification through Resend when `RESEND_API_KEY` and a verified `EMAIL_FROM` are set; `EMAIL_TO` defaults to the approved company address. Provider failure is recorded separately and never erases the stored enquiry. Administrators can see notification status and follow up from the dashboard. Automatic email retry is not implemented.

## Pages

Home, About, Products, product details, Services, Industries, Sustainability, Insights, article details, Partnerships, Contact, website search, Privacy, Cookies, custom 404 and `/admin`. The catalogue supports search, category and brand filters and pagination. Details include specifications, applications, optional verified warranty/datasheet, related products and quote enquiries. Editorial listings include categories, featured content, dates and reading time; articles include sharing, related content and structured metadata.

## Architecture choices

- **React/Vite + separate API:** honours the React-only request and allows a conventional Node/PostgreSQL host. No Cloudflare-specific runtime or external site publication is required.
- **Prisma 6:** compatible with the installed Node 22 baseline; migrations are tracked and production uses `migrate deploy`.
- **Focused React content studio:** avoids introducing a second Next.js application through Payload. It implements the required content workflows in this repository, but carries ongoing maintenance responsibility. For larger editorial teams, evaluate migrating to an established standalone CMS rather than expanding this into a general CMS framework.
- **Native scrolling + Motion:** small section entrances, a supply-chain sequence and reduced-motion support. GSAP, Lenis and Recharts are omitted because there is no complex pinned sequence or verified data series requiring them.
- **No invented content:** the public catalogue and article system start empty. Company news, products, affiliations, testimonials and impact figures are not fabricated.
- **Privacy-conscious defaults:** no analytics, public cookies or auto-loaded map. The map loads only on request. Legal notices are drafts for review, not a compliance certification.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Unit/API tests verify publication rules, input validation, origin/CSRF checks, private-record permissions and disabled integration behaviour. Browser tests cover public routes, responsive overflow, filters, navigation, reduced motion and disabled forms. Database-backed integration tests use a separate test database; see `docs/DEPLOYMENT.md`. Tests are never evidence of live email delivery or completed legal review.

`scripts/verify-database.ts` exercises real authentication, publication/unpublication, scheduling filters, uploads, all three enquiry types, permissions, exports, auditing and session revocation. Set both `DATABASE_URL` and `TEST_DATABASE_URL` to the **same disposable test database**, migrate it, then run `npx tsx scripts/verify-database.ts`. External email is explicitly disabled in that verification script. Never point it at a production database.

The supplied illustrative impact, named partner stories and external headlines are seeded as **unverified demonstration drafts**. They cannot publish without changing both flags and obtaining business approval. In particular, the supplied SKU ratio and fulfilment claims need reconciliation. The public footprint shows the company branch network supplied on 15 November 2026, connecting South Africa to Malawi, Zambia, Mozambique, Tanzania, Kenya and Nigeria. Public partner stories remain hidden until verified records exist.

See [deployment instructions](docs/DEPLOYMENT.md), [asset provenance](docs/ASSETS.md) and [verification record](docs/VERIFICATION.md).

Premium impact, footprint, story, ticker, video, FAQ, external-news and newsletter features are described in [enhancement operations](docs/ENHANCEMENTS.md). Apply the additive migration before running the enhanced server. All supplied illustrative organisations, market claims, video briefs and results stay private drafts. Newsletter signup requires explicit activation and double opt-in; campaign sending is outside this implementation.
