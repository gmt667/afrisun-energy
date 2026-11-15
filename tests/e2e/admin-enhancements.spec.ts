import { test, expect } from "@playwright/test";
test("editor can enter partial source URLs, submit review and edit structured claims", async ({
  page,
}) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      json: {
        user: {
          id: "test-editor",
          name: "Test editor",
          email: "test@example.com",
          role: "editor",
        },
        csrf: "synthetic-ui-token",
      },
    }),
  );
  await page.route("**/api/admin/overview", (route) =>
    route.fulfill({
      json: { products: 0, articles: 0, enquiries: 0, drafts: 0 },
    }),
  );
  await page.route("**/api/admin/content**", (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      expect(body.kind).toBe("article");
      expect(body.status).toBe("review");
      expect(body.verified).toBe(false);
      expect(body.details.news.url).toBe("https://www.worldbank.org/");
      return route.fulfill({
        status: 201,
        json: { ...body, id: "synthetic-draft" },
      });
    }
    return route.fulfill({ json: [] });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "Articles", exact: true }).click();
  await page.getByRole("button", { name: "Create record" }).click();
  await page
    .getByLabel("Title *", { exact: true })
    .fill("Synthetic review article");
  await page.getByLabel("URL slug *", { exact: true }).fill("synthetic-review");
  await page
    .getByRole("checkbox", { name: /This is an attributed external news/ })
    .check();
  const source = page.getByLabel("Original source URL (HTTPS)", {
    exact: true,
  });
  await source.pressSequentially("https://www.worldbank.org/");
  await expect(source).toHaveValue("https://www.worldbank.org/");
  await expect(
    page.getByRole("checkbox", { name: /This is an attributed external news/ }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: /Administrator: evidence checked/ }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("combobox", { name: "Status", exact: true })
      .locator("option[value=published]"),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("review");
  await page.getByRole("button", { name: "Save content" }).click();
  await expect(page.getByText("Content saved.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Case studies", exact: true }).click();
  await page.getByRole("button", { name: "Create record" }).click();
  await page.getByRole("button", { name: "Add numerical claim" }).click();
  await page
    .getByLabel("Claim label", { exact: true })
    .fill("Test stock range");
  await page.getByLabel("Result value", { exact: true }).fill("14");
  await page.getByLabel("Baseline (optional)", { exact: true }).fill("4");
  await page.getByLabel("Multiplier (optional)", { exact: true }).fill("2.4");
  await expect(page.getByLabel("Claim label", { exact: true })).toHaveValue(
    "Test stock range",
  );
});
