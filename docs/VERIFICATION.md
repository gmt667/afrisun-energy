# Static site verification

Run the frontend checks with:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The E2E suite starts only Vite and uses local browser fixtures. It does not start or contact an application server, database, or mail provider. A successful build creates the deployable static site under `dist/`.
