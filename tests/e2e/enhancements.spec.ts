import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { contentSchema, type Content } from "../../shared/schemas";
const fixture = (values: Record<string, unknown>): Content => ({
  ...contentSchema.parse({
    slug: "test-record",
    title: "Synthetic test record",
    status: "published",
    verified: true,
    ...values,
  }),
  id: String(values.slug || "test"),
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});
async function mockContent(page: Page, records: Content[] = []) {
  await page.route("**/api/config", (route) =>
    route.fulfill({
      json: { enquiriesEnabled: false, newsletterEnabled: false },
    }),
  );
  await page.route("**/api/content?**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    const items = records.filter((x) => x.kind === params.get("kind"));
    return route.fulfill({ json: { items, total: items.length, page: 1 } });
  });
}
test("sourced Africa map supports filters, keyboard and approved plans", async ({
  page,
}) => {
  const planned = fixture({
    kind: "market",
    slug: "test-planned",
    details: {
      evidence: "Test only",
      market: {
        countryCode: "NGA",
        type: "planned",
        locations: "Synthetic approved plan",
      },
    },
  });
  await mockContent(page, [planned]);
  await page.goto("/");
  await expect(page.locator(".africa-country")).toHaveCount(56);
  await expect(
    page.getByRole("button", {
      name: "South Africa: Corporate headquarters",
      exact: true,
    }),
  ).toBeVisible();
  const nigeria = page.getByRole("button", {
    name: "Nigeria: Planned expansion, Branch",
    exact: true,
  });
  await nigeria.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText(
      "Approved expansion intention. This is not an active operating market.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "North Africa", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No approved presence to show." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All regions", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Nigeria", exact: true }),
  ).toBeVisible();
});
test("unverified sample markets, impact, partners and video stories never appear", async ({
  page,
}) => {
  await mockContent(page, [
    fixture({
      kind: "metric",
      slug: "draft-metric",
      title: "42,500+ households",
      status: "draft",
      demo: true,
      verified: false,
    }),
    fixture({
      kind: "network-partner",
      slug: "draft-network",
      title: "HelioGrid Solar",
      status: "draft",
      demo: true,
      verified: false,
    }),
    fixture({
      kind: "market",
      slug: "draft-market",
      title: "Unapproved Malawi market",
      status: "draft",
      demo: true,
      verified: false,
    }),
    fixture({
      kind: "video-story",
      slug: "draft-video",
      title: "Unapproved clinic story",
      status: "draft",
      demo: true,
      verified: false,
    }),
  ]);
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Access is the beginning. Opportunity is the impact.",
    }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("42,500");
  await expect(page.locator("body")).not.toContainText("HelioGrid Solar");
  await expect(page.locator("body")).not.toContainText(
    "Unapproved Malawi market",
  );
  await expect(page.locator("video")).toHaveCount(0);
});
test("verified impact counters expose stable accessible values and company target progress", async ({
  page,
}) => {
  await mockContent(page, [
    fixture({
      kind: "metric",
      slug: "test-households",
      description: "Synthetic verified measurement",
      details: {
        evidence: "Test source",
        metric: {
          key: "households",
          value: 12,
          target: 100,
          targetYear: 2030,
          asOf: "2026-01-01",
          methodology: "Test measurement method",
        },
      },
    }),
  ]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const bar = page.getByRole("progressbar", {
    name: "Households powered company target progress",
  });
  await bar.scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute("aria-valuenow", "12");
  await expect(page.locator(".impact-value .sr-only")).toContainText("12");
  await page.getByText("How this is measured", { exact: true }).click();
  await expect(page.getByText("Test measurement method")).toBeVisible();
});
test("partner strip moves right to left, can pause and respects reduced motion", async ({
  page,
}) => {
  await mockContent(page);
  await page.goto("/");
  const track = page.locator(".ticker-track");
  await expect(track).toHaveCSS("animation-name", "partner-crawl");
  await expect(page.locator(".ticker-group").first()).toContainText(
    "PV manufacturers",
  );
  await page.getByRole("button", { name: "Pause partner ticker" }).click();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(track).toHaveCSS("animation-name", "none");
  await expect(page.locator(".ticker-duplicate")).toBeHidden();
});
test("video stories use native controls, captions, transcripts and accessible selection", async ({
  page,
}) => {
  const video = (slug: string, title: string) =>
    fixture({
      kind: "video-story",
      slug,
      title,
      description: "Synthetic browser fixture only.",
      details: {
        evidence: "Test permission",
        video: {
          url: "/media/aaaa.mp4",
          captions: "/media/aaaa.vtt",
          transcript: "Synthetic accessible transcript.",
          location: "Test location",
          attribution: "Approved test speaker",
          mediaPermission: true,
        },
      },
    });
  await mockContent(page, [
    video("first-video", "First test video"),
    video("second-video", "Second test video"),
  ]);
  await page.goto("/");
  await expect(page.locator("video")).toHaveAttribute("controls", "");
  await expect(page.locator("video track")).toHaveAttribute("kind", "captions");
  await page.getByText("Read the video transcript", { exact: true }).click();
  await expect(
    page.getByText("Synthetic accessible transcript."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next video story" }).click();
  await expect(
    page.getByRole("heading", { name: "Second test video" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Auto-rotate off" }),
  ).toBeVisible();
});
test("FAQ filtering and keyboard expansion work without unconfirmed credit promises", async ({
  page,
}) => {
  await mockContent(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Payment Terms", exact: true })
    .click();
  const question = page.locator(".faq-list summary").first();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq-list details").first()).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".faq-list")).toContainText(
    "subject to agreement and eligibility",
  );
  await expect(page.locator(".faq-list")).not.toContainText(
    "structured trade credit",
  );
});
test("requested viewport widths have no horizontal overflow", async ({
  page,
}) => {
  await mockContent(page);
  await page.goto("/");
  await expect(page.locator(".africa-country")).toHaveCount(56);
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `overflow at ${width}px`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.locator(".premium-footprint").screenshot({
    path: `test-results/africa-map-${test.info().project.name}.png`,
  });
});
test("public enhancement sections pass automated WCAG A/AA checks", async ({
  page,
}) => {
  await mockContent(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".africa-country")).toHaveCount(56);
  const result = await new AxeBuilder({ page })
    .include(".impact-dashboard")
    .include(".premium-footprint")
    .include(".partner-network")
    .include(".faq-section")
    .include(".newsletter-section")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
