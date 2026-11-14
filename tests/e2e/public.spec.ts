import { test, expect } from "@playwright/test";
test("public routes render without overflow or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
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
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (path === "/")
      await page.screenshot({
        path: `test-results/home-${page.viewportSize()?.width}.png`,
        fullPage: true,
      });
  }
  expect(errors).toEqual([]);
});
test("catalogue filters preserve URL and honest empty state", async ({
  page,
}) => {
  await page.goto("/products");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("solar-panels");
  await expect(page).toHaveURL(/category=solar-panels/);
  await expect(
    page.getByRole("heading", { name: "Let’s talk solar panels." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("unknown");
  await expect(
    page.getByRole("heading", { name: "No matching results." }),
  ).toBeVisible();
});
test("unconfigured enquiries are clearly disabled", async ({ page }) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("button", { name: "Online Submissions Not Yet Enabled" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Online submissions are awaiting activation."),
  ).toBeVisible();
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
test("reduced motion preserves content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "POWERING AFRICA’S FUTURE." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});
