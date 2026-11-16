import { test, expect } from "@playwright/test";

test("company logo, connected branches and product photography load", async ({
  page,
}) => {
  await page.goto("/");
  const logo = page.locator(".site-header .logo img");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveJSProperty("naturalWidth", 1200);
  await expect(page.locator(".branch-route")).toHaveCount(7);
  await expect(page.locator(".branch-route").first()).toHaveAttribute(
    "marker-end",
    /branch-arrow/,
  );
  await expect(page.locator(".country-controls button")).toHaveCount(7);
  await expect(page.getByLabel("Filter map by country")).toHaveValue(
    "All countries",
  );
  await page.getByLabel("Filter map by country").selectOption("KEN");
  await expect(page.locator(".country-information")).toContainText("Kenya");
  await expect(page.locator(".branch-route")).toHaveCount(1);
  await page.getByRole("button", { name: "All regions", exact: true }).click();
  await expect(page.locator(".branch-route")).toHaveCount(7);
  await page.getByRole("button", { name: "Malawi", exact: true }).click();
  await expect(page.locator(".country-information")).toContainText(
    "Lilongwe · Blantyre",
  );
  await page.getByRole("button", { name: "Zambia", exact: true }).click();
  await expect(page.locator(".country-information")).toContainText("Lusaka");
  await page.getByRole("button", { name: "West Africa", exact: true }).click();
  await expect(page.locator(".branch-route")).toHaveCount(1);
  await expect(page.locator(".country-information")).toContainText("Nigeria");
  await page.getByRole("button", { name: "All regions", exact: true }).click();
  await page.locator(".premium-footprint").screenshot({
    path: `test-results/branch-network-${test.info().project.name}.png`,
    animations: "disabled",
  });
  await page.goto("/products");
  await expect(page.locator(".category-gallery-card")).toHaveCount(6);
  for (const image of await page.locator(".category-gallery-card img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.locator(".category-gallery").screenshot({
    path: `test-results/product-categories-${test.info().project.name}.png`,
    animations: "disabled",
  });
});
