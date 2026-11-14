import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { createApp } from "../server/app.js";
import { db } from "../server/db.js";
import { contentSchema } from "../shared/schemas.js";

if (
  !process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL
)
  throw new Error(
    "Use a dedicated TEST_DATABASE_URL and set DATABASE_URL to exactly the same value. Never run against a production database.",
  );
const origin = process.env.SITE_URL || "http://localhost:5173";
const tag = `verification-${randomUUID()}`;
const app = createApp();
const password = randomUUID() + "test";
let passed = 0;
delete process.env.RESEND_API_KEY; // Never send test enquiries to the company mailbox.
const check = (value: unknown, label: string) => {
  assert.ok(value, label);
  passed++;
  console.log(`PASS ${label}`);
};
const base = contentSchema.parse({
  kind: "product",
  slug: tag,
  title: "Verification-only product",
  description: "Temporary integration test record",
  verified: true,
  status: "published",
});
try {
  const admin = await db.user.create({
    data: {
      email: `${tag}@example.com`,
      name: tag,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    },
  });
  const editor = await db.user.create({
    data: {
      email: `editor-${tag}@example.com`,
      name: tag,
      passwordHash: await bcrypt.hash(password, 12),
      role: "editor",
    },
  });
  const agent = request.agent(app);
  let r = await agent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ email: admin.email, password });
  check(r.status === 200, "administrator authentication");
  const csrf = r.body.csrf;
  r = await agent
    .post("/api/admin/content")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .send({ ...base, demo: true });
  check(r.status === 400, "demonstration publication rejected");
  r = await agent
    .post("/api/admin/content")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .send(base);
  check(r.status === 201, "verified product creation");
  const product = r.body;
  r = await request(app).get(`/api/content/product/${tag}`);
  check(r.status === 200, "published product public route");
  r = await request(app).get("/api/content?kind=product&q=Verification-only");
  check(
    r.body.items.some((x: { id: string }) => x.id === product.id),
    "catalogue search",
  );
  r = await agent
    .post("/api/admin/content")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .send({
      ...base,
      kind: "article",
      slug: `article-${tag}`,
      author: "Test author",
      body: "Integration-test article body.",
      publishedAt: new Date(Date.now() + 86400000).toISOString(),
    });
  check(r.status === 201, "scheduled article creation");
  const article = r.body;
  r = await request(app).get(`/api/content/article/${article.slug}`);
  check(r.status === 404, "future article excluded");
  const articleValue = {
    ...article,
    publishedAt: new Date(Date.now() - 60000).toISOString(),
  };
  r = await agent
    .put(`/api/admin/content/${article.id}`)
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .send(articleValue);
  check(r.status === 200, "article publication");
  r = await request(app).get(`/api/content/article/${article.slug}`);
  check(r.status === 200, "published article visible");
  r = await agent
    .put(`/api/admin/content/${article.id}`)
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .send({ ...articleValue, status: "draft" });
  check(r.status === 200, "article unpublish");
  r = await request(app).get(`/api/content/article/${article.slug}`);
  check(r.status === 404, "unpublished article private");
  const editorAgent = request.agent(app);
  r = await editorAgent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ email: editor.email, password });
  check(r.status === 200, "editor authentication");
  r = await editorAgent.get("/api/admin/enquiries");
  check(r.status === 403, "editor personal-data restriction");
  r = await editorAgent.get("/api/admin/content");
  check(r.status === 200, "editor content access");
  r = await agent
    .post("/api/admin/media")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .field("alt", tag)
    .attach("file", Buffer.from('<svg onload="alert(1)"/>'), {
      filename: "test.svg",
      contentType: "image/svg+xml",
    });
  check(r.status === 400, "active SVG upload rejected");
  const sharp = (await import("sharp")).default;
  const png = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "#102b46" },
  })
    .png()
    .toBuffer();
  r = await agent
    .post("/api/admin/media")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .field("alt", tag)
    .attach("file", png, { filename: "test.png", contentType: "image/png" });
  check(
    r.status === 201 && r.body.mime === "image/webp",
    "image decoding and safe re-encoding",
  );
  const mediaId = r.body.id;
  const mediaUrl = r.body.url;
  r = await request(app).get(mediaUrl);
  check(r.status === 200, "uploaded image served");
  process.env.ENQUIRIES_ENABLED = "true";
  for (const kind of ["contact", "quote", "partnership"]) {
    const challenge = await request(app).get("/api/challenge");
    await new Promise((resolve) => setTimeout(resolve, 2100));
    r = await request(app)
      .post("/api/enquiries")
      .set("Origin", origin)
      .send({
        kind,
        name: tag,
        organisation: "Integration test",
        email: `${tag}@example.com`,
        phone: "+27123456789",
        country: "South Africa",
        category: "Retailer",
        interest: "Testing",
        productId: kind === "quote" ? product.id : "",
        quantity: kind === "quote" ? 2 : undefined,
        message: "Integration verification only. Please ignore.",
        consent: true,
        website: "",
        startedAt: Date.now() - 3000,
        challenge: challenge.body.challenge,
      });
    check(r.status === 201 && r.body.id, `${kind} enquiry durably recorded`);
  }
  check(
    (await db.enquiry.count({ where: { name: tag } })) === 3,
    "all three enquiry types stored",
  );
  r = await agent.get("/api/admin/export");
  check(r.status === 200 && r.text.includes(tag), "authorised CSV export");
  check(
    (await db.audit.count({ where: { userId: admin.id } })) > 0,
    "sensitive actions audited",
  );
  r = await agent
    .patch(`/api/admin/users/${editor.id}`)
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .send({ role: "editor", active: false });
  check(r.status === 200, "user access disabled");
  r = await editorAgent.get("/api/admin/content");
  check(r.status === 401, "disabled user session revoked");
  r = await agent
    .post("/api/auth/logout")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf);
  check(r.status === 200, "logout");
  r = await agent.get("/api/admin/content");
  check(r.status === 401, "logged-out session rejected");
  const { unlink } = await import("node:fs/promises");
  const path = await import("node:path");
  await unlink(
    path.resolve(
      process.env.UPLOAD_DIR || "uploads",
      mediaUrl.split("/").at(-1)!,
    ),
  );
  await db.media.delete({ where: { id: mediaId } });
  console.log(`${passed} database-backed checks passed.`);
} finally {
  const users = await db.user.findMany({
    where: { name: tag },
    select: { id: true },
  });
  await db.audit.deleteMany({
    where: { userId: { in: users.map((x) => x.id) } },
  });
  await db.enquiry.deleteMany({ where: { name: tag } });
  await db.content.deleteMany({ where: { slug: { contains: tag } } });
  await db.user.deleteMany({ where: { name: tag } });
  await db.$disconnect();
}
