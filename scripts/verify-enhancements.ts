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
    "DATABASE_URL must equal the explicitly supplied disposable TEST_DATABASE_URL.",
  );
const tag = `enhancement-${randomUUID()}`;
const origin = process.env.SITE_URL || "http://localhost:5173";
const app = createApp();
const password = randomUUID() + randomUUID();
let count = 0;
const check = (value: unknown, label: string) => {
  assert.ok(value, label);
  count++;
  console.log(`PASS ${label}`);
};
const originalFetch = globalThis.fetch;
const priorKey = process.env.RESEND_API_KEY;
let emailText = "";
try {
  const admin = await db.user.create({
    data: {
      email: `admin-${tag}@example.com`,
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
  const adminAgent = request.agent(app),
    editorAgent = request.agent(app);
  const a = await adminAgent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ email: admin.email, password });
  const e = await editorAgent
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ email: editor.email, password });
  check(
    a.status === 200 && e.status === 200,
    "admin and editor authentication retained",
  );
  const editorWrite = (id: string, data: unknown) =>
    editorAgent
      .put(`/api/admin/content/${id}`)
      .set("Origin", origin)
      .set("X-CSRF-Token", e.body.csrf)
      .send(data);
  const adminWrite = (id: string, data: unknown) =>
    adminAgent
      .put(`/api/admin/content/${id}`)
      .set("Origin", origin)
      .set("X-CSRF-Token", a.body.csrf)
      .send(data);
  const create = (data: unknown) =>
    adminAgent
      .post("/api/admin/content")
      .set("Origin", origin)
      .set("X-CSRF-Token", a.body.csrf)
      .send(data);
  const metric = contentSchema.parse({
    kind: "metric",
    slug: tag,
    title: "Test household impact",
    details: {
      evidence: "Private test measurement source",
      metric: {
        key: "households",
        value: 12,
        target: 100,
        targetYear: 2030,
        asOf: "2026-01-01",
        methodology: "Count unique test households",
      },
    },
  });
  let r = await editorAgent
    .post("/api/admin/content")
    .set("Origin", origin)
    .set("X-CSRF-Token", e.body.csrf)
    .send(metric);
  check(r.status === 201, "editor saves incomplete/unapproved draft");
  const id = r.body.id;
  r = await request(app).get(`/api/content/metric/${tag}`);
  check(r.status === 404, "draft metric private");
  r = await editorWrite(id, { ...metric, status: "review" });
  check(r.status === 200, "editor submits for review");
  r = await editorWrite(id, { ...metric, status: "published", verified: true });
  check(r.status === 403, "editor cannot self-approve");
  r = await adminWrite(id, { ...metric, status: "published", verified: true });
  check(
    r.status === 200 && r.body.approvedBy === admin.id && r.body.approvedAt,
    "administrator approval recorded",
  );
  r = await request(app).get(`/api/content/metric/${tag}`);
  check(
    r.status === 200 &&
      r.body.details.metric.value === 12 &&
      !r.body.approvedBy &&
      !r.body.details.evidence,
    "public metric exposes value but redacts private evidence",
  );
  r = await editorWrite(id, { ...metric, title: "Unauthorised replacement" });
  check(r.status === 403, "editor cannot overwrite approved content");
  r = await request(app).get(`/api/content/metric/${tag}`);
  check(
    r.body.title === "Test household impact",
    "published content preserved after rejected edit",
  );
  r = await adminWrite(id, { ...metric, status: "draft", verified: false });
  check(
    r.status === 200 && !r.body.approvedBy,
    "unpublication revokes approval",
  );
  r = await request(app).get(`/api/content/metric/${tag}`);
  check(r.status === 404, "unpublished metric inaccessible");
  const market = contentSchema.parse({
    kind: "market",
    slug: `market-${tag}`,
    title: "Test expansion plan",
    status: "published",
    verified: true,
    details: {
      evidence: "Test approval",
      market: {
        countryCode: "TZA",
        type: "planned",
        locations: "Test location",
      },
    },
  });
  r = await create(market);
  check(
    r.status === 201,
    "approved expansion plan stored separately from active markets",
  );
  r = await request(app).get(`/api/content/market/${market.slug}`);
  check(
    r.body.details.market.type === "planned",
    "public category retains planned status",
  );
  const story = contentSchema.parse({
    kind: "case-study",
    slug: `story-${tag}`,
    title: "Test partner story",
    details: {
      evidence: "Private permission reference",
      story: {
        location: "Test location",
        challenge: "Test challenge",
        contribution: "Test contribution",
        results: "14 test SKUs",
        claims: [{ label: "SKUs", value: 14, baseline: 4, multiplier: 3.5 }],
        testimonial: "Test quote",
        attribution: "Test spokesperson",
        quotePermission: true,
      },
    },
  });
  r = await create({
    ...story,
    status: "published",
    verified: true,
    details: {
      ...story.details,
      story: {
        ...story.details.story,
        claims: [{ label: "SKUs", value: 14, baseline: 4, multiplier: 2.4 }],
      },
    },
  });
  check(r.status === 400, "inconsistent numeric case claim rejected");
  r = await create({ ...story, status: "published", verified: true });
  check(r.status === 201, "approved coherent case study published");
  r = await create({
    ...story,
    slug: `no-permission-${tag}`,
    status: "published",
    verified: true,
    details: {
      ...story.details,
      story: { ...story.details.story, quotePermission: false },
    },
  });
  check(r.status === 400, "unapproved testimonial rejected");
  const video = contentSchema.parse({
    kind: "video-story",
    slug: `video-${tag}`,
    title: "Test video",
    status: "published",
    verified: true,
    details: {
      evidence: "Test permission",
      video: {
        url: "/media/aaaa.mp4",
        captions: "/media/aaaa.vtt",
        transcript: "Approved transcript",
        attribution: "Test author",
        location: "Test location",
        mediaPermission: true,
      },
    },
  });
  r = await create(video);
  check(r.status === 400, "nonexistent video media cannot be published");
  r = await adminAgent
    .post("/api/admin/media")
    .set("Origin", origin)
    .set("X-CSRF-Token", a.body.csrf)
    .field("alt", tag)
    .attach(
      "file",
      Buffer.from("WEBVTT\n\n00:00.000 --> 00:01.000\nTest caption\n"),
      { filename: "test.vtt", contentType: "text/vtt" },
    );
  check(
    r.status === 201 && r.body.mime === "text/vtt",
    "caption upload safely stored",
  );
  r = await editorAgent.get("/api/admin/newsletter");
  check(r.status === 403, "subscriber list restricted to administrators");
  process.env.NEWSLETTER_ENABLED = "true";
  process.env.RESEND_API_KEY = "test-only-no-live-provider";
  process.env.EMAIL_FROM = "test@example.com";
  globalThis.fetch = async (input, options) => {
    assert.equal(String(input), "https://api.resend.com/emails");
    emailText = JSON.parse(String(options?.body)).text;
    return new Response(JSON.stringify({ id: "synthetic-provider-response" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const email = `newsletter-${tag}@example.com`;
  r = await request(app)
    .post("/api/newsletter/subscribe")
    .set("Origin", origin)
    .send({ email, topics: ["industry"], consent: true, website: "" });
  check(
    r.status === 202,
    "newsletter confirmation requested through mocked provider",
  );
  let subscriber = await db.newsletterSubscriber.findUniqueOrThrow({
    where: { email },
  });
  check(
    subscriber.status === "pending" && subscriber.confirmedAt === null,
    "newsletter address inactive before double opt-in",
  );
  const confirmation = /\/newsletter\/confirm\?token=([a-f0-9]{64})/.exec(
    emailText,
  )![1];
  const unsubscribe = /\/newsletter\/unsubscribe\?token=([a-f0-9]{64})/.exec(
    emailText,
  )![1];
  check(
    subscriber.confirmationHash !== confirmation &&
      subscriber.unsubscribeHash !== unsubscribe,
    "only token hashes stored",
  );
  r = await request(app)
    .post("/api/newsletter/confirm")
    .set("Origin", origin)
    .send({ token: "f".repeat(64) });
  check(r.status === 400, "invalid confirmation rejected");
  r = await request(app)
    .post("/api/newsletter/confirm")
    .set("Origin", origin)
    .send({ token: confirmation });
  check(r.status === 200, "single-use confirmation accepted");
  subscriber = await db.newsletterSubscriber.findUniqueOrThrow({
    where: { email },
  });
  check(
    subscriber.status === "confirmed" && !!subscriber.confirmedAt,
    "confirmed consent stored",
  );
  r = await request(app)
    .post("/api/newsletter/confirm")
    .set("Origin", origin)
    .send({ token: confirmation });
  check(r.status === 400, "confirmation token cannot replay");
  r = await request(app)
    .post("/api/newsletter/unsubscribe")
    .set("Origin", origin)
    .send({ token: unsubscribe });
  check(r.status === 200, "unsubscribe accepted");
  subscriber = await db.newsletterSubscriber.findUniqueOrThrow({
    where: { email },
  });
  check(
    subscriber.status === "unsubscribed",
    "unsubscribed address excluded from active audience",
  );
  check(
    (await db.audit.count({
      where: { userId: admin.id, action: { contains: "approve" } },
    })) > 0,
    "approval audit trail retained",
  );
  console.log(
    `${count} enhancement database checks passed. Email provider was mocked; no messages sent.`,
  );
} finally {
  globalThis.fetch = originalFetch;
  if (priorKey) process.env.RESEND_API_KEY = priorKey;
  else delete process.env.RESEND_API_KEY;
  const users = await db.user.findMany({
    where: { name: tag },
    select: { id: true },
  });
  await db.audit.deleteMany({
    where: { userId: { in: users.map((x) => x.id) } },
  });
  await db.content.deleteMany({ where: { slug: { contains: tag } } });
  await db.newsletterSubscriber.deleteMany({
    where: { email: { contains: tag } },
  });
  const media = await db.media.findMany({ where: { alt: tag } });
  const { unlink } = await import("node:fs/promises");
  const path = await import("node:path");
  for (const item of media)
    await unlink(
      path.resolve(
        process.env.UPLOAD_DIR || "uploads",
        item.url.split("/").at(-1)!,
      ),
    );
  await db.media.deleteMany({ where: { alt: tag } });
  await db.user.deleteMany({ where: { name: tag } });
  await db.$disconnect();
}
