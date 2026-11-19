import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  count: vi.fn(),
}));
vi.mock("../server/db.js", () => ({
  db: {
    session: { findUnique: mocks.session },
    content: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      count: mocks.count,
    },
  },
}));
import { createApp } from "../server/app";
beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.DATABASE_URL;
  process.env.ENQUIRIES_ENABLED = "false";
});
describe("API safety boundaries", () => {
  it.each(["confirm", "unsubscribe"])(
    "rejects a missing newsletter %s body as invalid input",
    async (action) => {
      const response = await request(createApp())
        .post(`/api/newsletter/${action}`)
        .set("Origin", "http://localhost:5173");
      expect(response.status).toBe(400);
    },
  );
  it("rejects a multibyte enquiry signature without a server error", async () => {
    process.env.DATABASE_URL = "postgresql://test";
    process.env.ENQUIRIES_ENABLED = "true";
    const response = await request(createApp())
      .post("/api/enquiries")
      .set("Origin", "http://localhost:5173")
      .send({
        kind: "contact",
        name: "Test Person",
        organisation: "Test Organisation",
        email: "test@example.com",
        phone: "+265123456789",
        category: "general",
        message: "Please provide more information.",
        consent: true,
        startedAt: Date.now() - 5000,
        challenge: `${Date.now() - 5000}.nonce.${"é".repeat(64)}`,
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("reload the form");
  });
  it("reports local unconfigured services accurately", async () => {
    const response = await request(createApp()).get("/api/config");
    expect(response.body.enquiriesEnabled).toBe(false);
  });
  it("returns an empty catalogue with no database", async () => {
    const response = await request(createApp()).get(
      "/api/content?kind=product",
    );
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });
  it("rejects cross-origin mutations before authentication", async () => {
    const response = await request(createApp())
      .post("/api/auth/login")
      .set("Origin", "https://attacker.example")
      .send({});
    expect(response.status).toBe(403);
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it("does not claim an unconfigured enquiry was sent", async () => {
    const response = await request(createApp())
      .post("/api/enquiries")
      .set("Origin", "http://localhost:5173")
      .send({});
    expect(response.status).toBe(503);
  });
  it("requires authentication for all admin records", async () => {
    for (const url of [
      "/api/admin/content",
      "/api/admin/enquiries",
      "/api/admin/users",
      "/api/admin/export",
      "/api/admin/newsletter",
    ])
      expect((await request(createApp()).get(url)).status).toBe(401);
  });
  it("blocks editors from private enquiries and user management", async () => {
    process.env.DATABASE_URL = "postgresql://test";
    mocks.session.mockResolvedValue({
      id: "session",
      expiresAt: new Date(Date.now() + 60000),
      csrf: "csrf",
      user: { id: "editor", role: "editor", active: true },
    });
    for (const url of [
      "/api/admin/enquiries",
      "/api/admin/users",
      "/api/admin/export",
      "/api/admin/audit",
    ])
      expect(
        (
          await request(createApp())
            .get(url)
            .set("Cookie", "afrisun_session=token")
        ).status,
      ).toBe(403);
  });
  it("checks CSRF on authenticated mutations", async () => {
    mocks.session.mockResolvedValue({
      id: "session",
      expiresAt: new Date(Date.now() + 60000),
      csrf: "right",
      user: { id: "admin", role: "admin", active: true },
    });
    const response = await request(createApp())
      .post("/api/admin/content")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", "afrisun_session=token")
      .send({});
    expect(response.status).toBe(403);
  });
  it("excludes drafts, demonstration records and future publications from public queries", async () => {
    process.env.DATABASE_URL = "postgresql://test";
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    await request(createApp()).get("/api/content?kind=product&q=panel");
    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({
      status: "published",
      demo: false,
      verified: true,
      kind: "product",
    });
    expect(where.OR[1].publishedAt.lte).toBeInstanceOf(Date);
  });
  it("provides sitemap and blocks admin indexing", async () => {
    expect((await request(createApp()).get("/sitemap.xml")).text).toContain(
      "/sustainability",
    );
    expect((await request(createApp()).get("/robots.txt")).text).toContain(
      "Disallow: /admin",
    );
  });
});
