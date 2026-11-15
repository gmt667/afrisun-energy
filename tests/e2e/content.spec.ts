import { test, expect } from "@playwright/test";
import { contentSchema } from "../../shared/schemas";
const product = {
  ...contentSchema.parse({
    kind: "product",
    slug: "test-module",
    title: "Test PV Module",
    brand: "Test Brand",
    description: "Synthetic browser fixture only.",
    verified: true,
    status: "published",
    specifications: [{ name: "Rated power", value: "Test value" }],
    applications: "Test household application",
    warranty: "Test warranty text; not a commercial claim.",
  }),
  id: "test-product",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
test("synthetic product detail and quote form UI", async ({ page }) => {
  await page.route("**/api/content/product/test-module", (route) =>
    route.fulfill({ json: product }),
  );
  await page.route("**/api/content?**", (route) =>
    route.fulfill({ json: { items: [], total: 0, page: 1 } }),
  );
  await page.route("**/api/config", (route) =>
    route.fulfill({ json: { enquiriesEnabled: true } }),
  );
  await page.route("**/api/challenge", (route) =>
    route.fulfill({ json: { challenge: "synthetic-ui-test" } }),
  );
  await page.route("**/api/enquiries", async (route) => {
    const data = route.request().postDataJSON();
    expect(data.productId).toBe("test-product");
    expect(data.quantity).toBe(3);
    expect(data.consent).toBe(true);
    await route.fulfill({
      status: 201,
      json: {
        id: "synthetic-enquiry",
        message: "Your enquiry has been securely recorded.",
        notification: "Synthetic UI response; no data or email sent.",
      },
    });
  });
  await page.goto("/products/test-module");
  await expect(
    page.getByRole("heading", { name: "Test PV Module", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: "Rated power Test value" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Request a Quote", exact: true })
    .click();
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await expect(page.getByText("This field is required").first()).toBeVisible();
  await page.getByLabel("Full name *").fill("Browser Test");
  await page.getByLabel("Organisation *").fill("Test Organisation");
  await page.getByLabel("Email address *").fill("test@example.com");
  await page.getByLabel("Phone number *").fill("+27123456789");
  await page.getByLabel("Delivery country / country *").fill("South Africa");
  await page.getByLabel("Quantity *").fill("3");
  await page
    .getByLabel("Message *")
    .fill("Synthetic product enquiry for UI verification only.");
  await page
    .getByRole("checkbox", { name: /I have read the privacy notice/ })
    .check();
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await expect(
    page.getByRole("heading", { name: "Thank you for connecting." }),
  ).toBeVisible();
});
test("synthetic article renders rich text, table and sharing links", async ({
  page,
}) => {
  const article = {
    ...product,
    kind: "article",
    slug: "test-perspective",
    title: "Test energy perspective",
    author: "Test editor",
    publishedAt: "2026-01-01T00:00:00.000Z",
    body: "## Understanding access\n\nA synthetic test article.\n\n| Topic | Note |\n| --- | --- |\n| Supply | Test only |",
  };
  await page.route("**/api/content/article/test-perspective", (route) =>
    route.fulfill({ json: article }),
  );
  await page.route("**/api/content?**", (route) =>
    route.fulfill({ json: { items: [], total: 0, page: 1 } }),
  );
  await page.goto("/insights/test-perspective");
  await expect(
    page.getByRole("heading", { name: "Understanding access" }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "LinkedIn", exact: true }),
  ).toHaveAttribute("href", /linkedin.com\/sharing/);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    /\/insights\/test-perspective$/,
  );
});
test("catalogue API errors remain honest and actionable", async ({ page }) => {
  await page.route("**/api/content?**", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Temporary verification outage" },
    }),
  );
  await page.goto("/products");
  await expect(
    page.getByRole("heading", { name: "Content is temporarily unavailable" }),
  ).toBeVisible();
  await expect(page.getByText("Temporary verification outage")).toBeVisible();
});
