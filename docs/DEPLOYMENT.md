# Deployment and operations

## Hosting

Use a Node 22 container/service and a managed PostgreSQL 15+ database. Serve the React build and API from the same HTTPS origin. This is a server-backed application; uploading only `dist/` to GitHub Pages will not provide enquiries or administration. The repository push does not deploy a website.

1. Provision PostgreSQL with a least-privilege application account and encrypted connections.
2. Configure production environment variables from `.env.example`: `NODE_ENV=production`, canonical HTTPS `SITE_URL`, `DATABASE_URL`, random `SESSION_SECRET`, and a persistent `UPLOAD_DIR`.
3. Install with `npm ci`, run `npm run db:generate`, `npm run db:migrate`, `npm run build` and `npm start`.
4. Configure a reverse proxy with HTTPS, a request-body limit of 51 MB (allowing multipart overhead for 50 MB video uploads) and the appropriate upstream port. The application retains separate limits of 10 MB for images/PDFs and 1 MB for captions. Set `TRUST_PROXY=true` only with exactly one known, trusted proxy and block direct public access to Node. Otherwise keep it false.
5. Mount a persistent writable volume at `UPLOAD_DIR`. Back up both PostgreSQL and media; test restoration. The application must not run as root. The Dockerfile creates a non-root user.
6. Create the first administrator via `npm run admin:create` in a secure maintenance environment. Clear `ADMIN_PASSWORD` afterwards.
7. Review image rights, approved product/article data, legal documents and company ownership before making the site public.
8. Configure verified Resend sending domain, `EMAIL_FROM`, `RESEND_API_KEY`, and `EMAIL_TO`. Test delivery to the company inbox. Set `ENQUIRIES_ENABLED=true` only when the team is ready to monitor stored enquiries and respond.
9. Run real database-backed acceptance checks before release: sign in as admin/editor, upload an image/PDF, publish/unpublish an article and a product, schedule a future article, submit each form type, confirm records, confirm notification status, verify role boundaries, CSV export, user disable and logout. Use isolated test records and delete personal test data under the approved retention process.

## Docker

Set `POSTGRES_PASSWORD`, `SESSION_SECRET` and `SITE_URL` as deployment environment variables, then:

```sh
docker compose up -d db
docker compose run --rm web npm run db:migrate
docker compose run --rm web npm run db:seed
docker compose up -d web
```

TLS termination is required in front of the web service. Local Docker runs in production mode, so use HTTPS for real sign-in or use local `npm run dev` for HTTP development. Do not weaken secure cookies in production.

## Security and operational boundaries

- Secure, HTTP-only, SameSite=Strict session cookies; database sessions expire after eight hours. Role checks are server-side. Access changes revoke existing sessions. CSRF tokens and strict origin checks protect authenticated writes.
- Bcrypt password hashing (cost 12); login throttling. MFA, password-reset email and SSO are not implemented. Restrict admin access at the proxy/VPN where appropriate; administrator account recovery uses a privileged maintenance process.
- Application rate limits are in-memory and intended for one Node instance. For multiple replicas, use a shared Redis rate-limit store or enforce a shared gateway limit before scaling.
- Contact challenges deter simple bots but are not a full CAPTCHA system. Add an accessible managed anti-bot integration if abuse warrants it.
- PDFs are signature/type/size checked, randomly named and served as downloads with nosniff; add a quarantine/malware scanner before accepting uploads from less trusted editors. Do not upload unreviewed active documents.
- Logging emits error categories rather than submitted personal data or passwords. Add structured, privacy-reviewed operational monitoring and alerts in the hosting environment.
- CSV export is admin-only, audited and protects against spreadsheet formula injection. It is capped at 10,000 rows; the administration list displays the latest 1,000 enquiries, latest 500 content/media items and latest 200 audit records.
- Enquiry notification failure is visible in the dashboard; no automatic retry worker exists. Monitor failed/unconfigured notifications and handle stored enquiries directly.
- Implement the company-approved retention/deletion process before enabling forms. The app does not automatically delete enquiry data; do not invent a retention period.
- Review CSP if adding external services. The public site loads no analytics. Fonts are self-hosted when prepared; map iframe is restricted to OpenStreetMap.

## SEO

The API serves `/robots.txt` and `/sitemap.xml`. The sitemap includes only verified, published product/article records and static public pages. React updates per-page metadata, canonical URLs, Open Graph and JSON-LD. The production server renders initial public-page HTML, route metadata, canonical URLs, Open Graph, JSON-LD and proper 404 responses. Product/article details include verified database content in initial HTML. Catalogue and homepage editorial lists fill on the client; indexable detail routes are included in the sitemap. Never index `/admin`, private previews or test/demo content.

## Release gate

Confirm the database migration and backup, all checks in `docs/VERIFICATION.md`, real browser/database acceptance, verified sending domain and mailbox receipt, image licensing, exact office map location, Information Officer/POPIA review, retention policy and public content approval. Terms are intentionally absent until approved. No payment or lending feature exists.
