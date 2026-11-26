# Static deployment

## Build

Use Node 22.12+ and npm:

```sh
npm ci
npm run build
```

Publish the contents of `dist/` to a static web host. No Node service, database, environment variables, container, or runtime process is required.

## Direct page links

The site uses React Router. The hosting provider must serve `index.html` for unknown page paths while serving existing files normally. Repository rules are included for Apache (`public/.htaccess`), Netlify (`public/_redirects`), and Vercel (`vercel.json`). Use the matching rule for the selected host.

## Contact behavior

Forms run validation in the browser, then prepare a `mailto:` message. Nothing is sent or stored by the site; visitors must review and send the email themselves. Newsletter requests do not subscribe visitors automatically.

## Release checklist

- Confirm all product, impact, partner and editorial content in `shared/public-content.ts` is approved and verified.
- Confirm every referenced image and document exists under `public/` and has appropriate usage rights.
- Build the site and check direct visits to `/contact`, `/products`, `/insights`, `/privacy` and `/cookies` on the target host.
- Check contact links, phone links, mailto forms, responsive layout and the optional OpenStreetMap area map.
- Review the privacy and cookie notices, company details and email recipients before publishing.
