import { createApp } from "./app.js";
import { db } from "./db.js";
const server = createApp().listen(
  Number(process.env.PORT || 3001),
  "0.0.0.0",
  () =>
    console.log(`Afrisun API listening on port ${process.env.PORT || 3001}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    server.close(() => {
      void db.$disconnect().then(() => process.exit(0));
    });
  });
