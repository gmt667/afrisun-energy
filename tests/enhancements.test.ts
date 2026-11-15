import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { contentSchema } from "../shared/schemas";
import { safeExternalUrl } from "../shared/enhancements";
import { publicContent } from "../server/public-content";
const published = {
  slug: "verified-record",
  title: "Verified record",
  status: "published",
  verified: true,
};
describe("enhanced publication rules", () => {
  it("accepts incomplete structured content as a draft", () =>
    expect(
      contentSchema.safeParse({ kind: "metric", slug: "draft", title: "Draft" })
        .success,
    ).toBe(true));
  it("rejects metric publication without measured data", () =>
    expect(
      contentSchema.safeParse({ ...published, kind: "metric" }).success,
    ).toBe(false));
  it("requires coherent units, dates and company targets", () => {
    const metric = {
      key: "households",
      value: 12,
      asOf: "2026-01-01",
      methodology: "Count unique households",
    };
    const valid = {
      ...published,
      kind: "metric",
      details: { evidence: "Approved data source", metric },
    };
    expect(contentSchema.safeParse(valid).success).toBe(true);
    for (const patch of [
      { unit: "MW" },
      { value: 1.5 },
      { asOf: "2099-01-01" },
      { target: 100, targetYear: null },
    ])
      expect(
        contentSchema.safeParse({
          ...valid,
          details: { evidence: "Approved", metric: { ...metric, ...patch } },
        }).success,
      ).toBe(false);
  });
  it("requires a country from the real boundary data", () => {
    const market = {
      type: "planned",
      countryCode: "ZZZ",
      locations: "Proposed",
    };
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "market",
        details: { evidence: "Approval", market },
      }).success,
    ).toBe(false);
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "market",
        details: {
          evidence: "Approval",
          market: { ...market, countryCode: "ZAF" },
        },
      }).success,
    ).toBe(true);
  });
  it("rejects the supplied inconsistent SKU multiplier", () => {
    const story = {
      location: "Test location",
      challenge: "Test challenge",
      contribution: "Test contribution",
      results: "14 SKUs",
      claims: [{ label: "SKUs", value: 14, baseline: 4, multiplier: 2.4 }],
    };
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "case-study",
        details: { evidence: "Test", story },
      }).success,
    ).toBe(false);
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "case-study",
        details: {
          evidence: "Test",
          story: {
            ...story,
            claims: [
              { label: "SKUs", value: 14, baseline: 4, multiplier: 3.5 },
            ],
          },
        },
      }).success,
    ).toBe(true);
  });
  it("requires approved testimonial and named-partner permissions", () => {
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "network-partner",
        details: {
          evidence: "Test",
          network: { role: "Retailer", namePermission: false },
        },
      }).success,
    ).toBe(false);
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "case-study",
        details: {
          evidence: "Test",
          story: {
            location: "Test",
            challenge: "Test",
            contribution: "Test",
            results: "Test",
            testimonial: "Quote",
            attribution: "Name",
            quotePermission: false,
          },
        },
      }).success,
    ).toBe(false);
  });
  it("requires media permissions, captions and transcript for video stories", () => {
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "video-story",
        details: {
          evidence: "Test",
          video: {
            url: "/media/aaaa.mp4",
            location: "Test",
            attribution: "Test",
            mediaPermission: true,
          },
        },
      }).success,
    ).toBe(false);
    expect(
      contentSchema.safeParse({
        ...published,
        kind: "video-story",
        details: {
          evidence: "Test",
          video: {
            url: "/media/aaaa.mp4",
            captions: "/media/aaaa.vtt",
            transcript: "Approved transcript",
            location: "Test",
            attribution: "Test",
            mediaPermission: true,
          },
        },
      }).success,
    ).toBe(true);
  });
  it("requires checked attribution and original writing for external news", () => {
    const base = {
      ...published,
      kind: "article",
      body: "Original summary",
      author: "Editorial team",
      publishedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(
      contentSchema.safeParse({
        ...base,
        details: {
          news: {
            source: "World Bank",
            url: "https://www.worldbank.org/",
            sourcePublishedAt: "2026-01-01",
            linkChecked: true,
            originalSummary: true,
          },
        },
      }).success,
    ).toBe(true);
    expect(
      contentSchema.safeParse({
        ...base,
        details: {
          news: {
            source: "World Bank",
            url: "https://www.worldbank.org/",
            sourcePublishedAt: "2026-01-01",
          },
        },
      }).success,
    ).toBe(false);
  });
  it.each([
    "http://www.worldbank.org/",
    "https://user:pass@www.worldbank.org/",
    "https://localhost/",
    "https://127.0.0.1/",
    "https://[::1]/",
    "javascript:alert(1)",
  ])("rejects unsafe source URL %s", (url) =>
    expect(safeExternalUrl(url)).toBe(false),
  );
  it("redacts private approval evidence from public responses", () => {
    const record = publicContent({
      approvedBy: "private-user",
      approvedAt: new Date(),
      details: {
        evidence: "Private permission documents",
        market: { countryCode: "ZAF", type: "planned", locations: "Test" },
      },
    });
    expect(JSON.stringify(record)).not.toContain("private-user");
    expect(record.details.evidence).toBe("");
    expect(record.details.market?.type).toBe("planned");
  });
  it("uses a complete, sourced local map including African island states", () => {
    const map = JSON.parse(readFileSync("public/maps/africa.json", "utf8"));
    expect(map.source).toBe("Natural Earth 1:50m admin 0");
    expect(map.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(map.countries.length).toBe(56);
    for (const code of [
      "ZAF",
      "ZMB",
      "MWI",
      "TZA",
      "MOZ",
      "ZWE",
      "BWA",
      "NAM",
      "KEN",
      "NGA",
      "MUS",
      "SYC",
    ])
      expect(
        map.countries.find((x: { code: string }) => x.code === code)?.path,
      ).toMatch(/^M/);
  });
});
