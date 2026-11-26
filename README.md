# Afrisun Energy

Afrisun Energy’s public website is a React and Vite static site. It has no application server, database, admin console, or API.

## Run locally

Use Node 22.12+ and npm:

```sh
npm ci
npm run dev
```

Vite serves the website at `http://localhost:5173`.

## Build and publish

```sh
npm run build
```

Upload the generated `dist/` directory to any static host. The included hosting rules route page requests back to `index.html` so React Router paths such as `/contact` and `/products` work on direct visits.

## Public content

Company details, category descriptions and navigation are kept in `shared/content.ts`. Verified product, article, case study and impact records belong in `shared/public-content.ts`. Add only approved, publishable content and place referenced media in `public/`. Changes ship with the next static build; there is no content editor or remote content service.

The catalogue and insights pages show honest empty states until verified records are added. Proposed product categories are not a claim of inventory, and supplied draft metrics, named partners, testimonials and headlines are not published.

## Contact and updates

Contact, quote and partnership forms validate in the browser and prepare an email in the visitor’s email application. The site does not transmit or store form entries. The visitor must review and send the prepared message. Newsletter requests work the same way and do not automatically subscribe anyone.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The browser tests use local fixtures and the public static site only. They do not require a database or external email provider.
