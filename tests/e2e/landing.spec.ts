import { test, expect } from "@playwright/test";

test("public landing, national directory defaults, provider availability, and mobile navigation", async ({
  page,
  request,
}) => {
  const config = await (await request.get("/api/config")).json();
  expect(config.developmentMailbox).toBe(true);
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "The records are public. Make the process clearer.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Alabama first|Growing with purpose/i),
  ).toHaveCount(0);
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(page.locator(".landing-org-grid img").first()).toBeVisible();
  await page.screenshot({ path: 'test-results/landing-desktop.png', fullPage: true });
  await page
    .getByRole("navigation", { name: "Website navigation" })
    .getByRole("link", { name: "How it works" })
    .click();
  await expect(page.locator("#how-it-works")).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page.goto("/requests/new");
  await page
    .getByRole("link", { name: "Sign in or create an account" })
    .click();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  if (!config.authProviders.google)
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Continue with email" }),
  ).toBeEnabled();
  await page.screenshot({ path: 'test-results/sign-in-mobile.png', fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/directory");
  await expect(page.getByLabel("Jurisdiction", { exact: true })).toHaveValue(
    "",
  );
  await page.getByLabel("Search public offices").fill("NASA");
  await expect(
    page.getByRole("heading", { name: /National Aeronautics/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/directory-mobile.png",
    fullPage: true,
  });
});
