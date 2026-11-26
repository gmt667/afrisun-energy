import { test, expect } from "@playwright/test";

test("static routes render without runtime errors or API requests", async ({
  page,
}) => {
  const errors: string[] = [];
  const apiRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      apiRequests.push(request.url());
  });

  for (const path of [
    "/",
    "/about",
    "/products",
    "/services",
    "/industries",
    "/sustainability",
    "/insights",
    "/partners",
    "/contact",
    "/privacy",
    "/cookies",
    "/missing",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/.+ \| Afrisun Energy$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  expect(apiRequests).toEqual([]);
});

test("catalogue categories and local search work without a service", async ({
  page,
}) => {
  await page.goto("/products");
  await expect(page.locator(".category-gallery-card")).toHaveCount(6);
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("solar-panels");
  await expect(page).toHaveURL(/category=solar-panels/);
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("unknown");
  await expect(
    page.getByRole("heading", { name: "No matching results." }),
  ).toBeVisible();
});

test("contact and newsletter forms prepare email drafts", async ({ page }) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("button", { name: "Prepare Email" }).first(),
  ).toBeEnabled();
  await expect(
    page.locator('.contact-detail a[href^="mailto:"]'),
  ).toHaveCount(4);
  await expect(
    page.getByText("This static site prepares a message in your email app."),
  ).toBeVisible();
  await expect(
    page.locator(".newsletter-section button[type=submit]"),
  ).toHaveText(/Prepare Email/);
});

test("navigation responds to keyboard and mobile menu", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeFocused();
  } else {
    await page
      .getByRole("button", { name: "Product categories", exact: true })
      .click();
    await expect(page.locator("#product-menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#product-menu")).toHaveCount(0);
  }
});

test("narrow viewports do not overflow and reduced motion preserves content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero h1")).toContainText("POWERING");
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `overflow at ${width}px`,
    ).toBe(true);
  }
});
