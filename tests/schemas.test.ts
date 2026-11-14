import { describe, it, expect } from "vitest";
import { contentSchema, enquirySchema } from "../shared/schemas";
describe("publication safeguards", () => {
  const article = {
    kind: "article",
    slug: "energy-access",
    title: "Energy access",
    body: "Verified editorial content",
    author: "Approved author",
    publishedAt: "2026-01-01T00:00:00.000Z",
    verified: true,
    status: "published",
  };
  it("allows a verified article with required editorial fields", () =>
    expect(contentSchema.safeParse(article).success).toBe(true));
  it("rejects unverified publication", () =>
    expect(
      contentSchema.safeParse({ ...article, verified: false }).success,
    ).toBe(false));
  it("rejects demonstration publication", () =>
    expect(contentSchema.safeParse({ ...article, demo: true }).success).toBe(
      false,
    ));
  it.each(["body", "author", "publishedAt"])(
    "requires %s on an article",
    (field) =>
      expect(
        contentSchema.safeParse({
          ...article,
          [field]: field === "publishedAt" ? null : "",
        }).success,
      ).toBe(false),
  );
  it("permits demonstration drafts", () =>
    expect(
      contentSchema.safeParse({
        ...article,
        demo: true,
        verified: false,
        status: "draft",
      }).success,
    ).toBe(true));
  it("rejects external media and unsafe slugs", () => {
    expect(
      contentSchema.safeParse({
        ...article,
        image: "https://example.com/tracker.jpg",
      }).success,
    ).toBe(false);
    expect(
      contentSchema.safeParse({ ...article, slug: "../private" }).success,
    ).toBe(false);
  });
  it("requires alt text for published images", () =>
    expect(
      contentSchema.safeParse({ ...article, image: "/media/aaaa.webp" })
        .success,
    ).toBe(false));
});
describe("enquiry validation", () => {
  const valid = {
    kind: "contact",
    name: "Test Person",
    organisation: "Test organisation",
    email: "test@example.com",
    phone: "+27 63 548 3486",
    category: "Retailer",
    message: "Please discuss sourcing requirements.",
    consent: true,
    startedAt: Date.now() - 10000,
  };
  it("accepts a valid contact enquiry", () =>
    expect(enquirySchema.safeParse(valid).success).toBe(true));
  it("requires privacy acknowledgement", () =>
    expect(enquirySchema.safeParse({ ...valid, consent: false }).success).toBe(
      false,
    ));
  it("rejects spam honeypot", () =>
    expect(
      enquirySchema.safeParse({ ...valid, website: "spam.example" }).success,
    ).toBe(false));
  it("requires quote product, quantity and country", () =>
    expect(enquirySchema.safeParse({ ...valid, kind: "quote" }).success).toBe(
      false,
    ));
  it("rejects oversized messages and invalid emails", () => {
    expect(
      enquirySchema.safeParse({ ...valid, message: "x".repeat(5001) }).success,
    ).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, email: "bad" }).success).toBe(
      false,
    );
  });
});
