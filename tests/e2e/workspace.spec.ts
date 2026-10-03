import { test, expect } from "@playwright/test";

test("directory, email-link sign-in, saved draft, manual filing, sign-out, and mobile layout", async ({
  page,
  request,
}) => {
  // These tests must only run against the local development email adapter.
  expect(
    (await (await request.get("/api/config")).json()).developmentMailbox,
  ).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "The records are public. Make the process clearer.",
    }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Website navigation" })
    .getByRole("link", { name: "Directory", exact: true })
    .click();
  await expect(page.getByLabel("Jurisdiction", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.locator(".entity-card img").first()).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".entity-card img")
        .first()
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByLabel("Search public offices").fill("Huntsville");
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "City of Huntsville" }) })
    .click();
  await expect(page.getByText("Source status")).toBeVisible();
  await page.getByRole("link", { name: "Prepare a request" }).click();
  await page
    .getByRole("link", { name: "Sign in or create an account" })
    .click();
  await page.getByLabel("Your name").fill("Browser Tester");
  await page
    .getByLabel("Email address")
    .fill(`browser-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Continue with email" }).click();
  await page.getByRole("link", { name: "Open sign-in link" }).click();
  await expect(
    page.getByRole("heading", { name: "Build a clear request" }),
  ).toBeVisible();
  await page.getByLabel("Request title").fill("Road project contracts");
  await page
    .getByLabel("Records description")
    .fill(
      "The awarded road maintenance contract and approved amendments for 2025.",
    );
  await page.getByLabel("From optional", { exact: true }).fill("2025-01-01");
  await page.getByLabel("Through optional", { exact: true }).fill("2025-12-31");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Road project contracts" }),
  ).toBeVisible();
  const saved = page.url();
  await page.reload();
  await expect(page.getByLabel("Records description")).toHaveValue(
    "The awarded road maintenance contract and approved amendments for 2025.",
  );
  await page
    .getByLabel("Request title")
    .fill("Road project contracts — revised");
  await page.route('**/api/requests/*', (route) => route.fulfill({ status: 502, contentType: 'text/plain', body: 'Temporary gateway failure' }), { times: 1 });
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('The server connection was interrupted. Please try again.');
  await expect(page.getByLabel('Request title')).toHaveValue('Road project contracts — revised');
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Road project contracts — revised" }),
  ).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .txt" }).click();
  expect((await downloaded).suggestedFilename()).toContain("Road project");
  await page.getByRole("button", { name: "Record manual filing" }).click();
  await page.getByLabel("Agency reference").fill("BROWSER-123");
  await page.getByRole("button", { name: "Save update" }).click();
  await expect(page.getByText("Filed manually", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Records description")).toBeDisabled();
  await expect(
    page.getByText(
      "User recorded manual filing; GovPeep did not submit this request.",
    ),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/request-mobile.png",
    fullPage: true,
  });
  await page.goto("/requests/new");
  await expect(page.getByRole("combobox", { name: "Jurisdiction", exact: true })).toHaveValue(
    "",
  );
  await page.goto(saved);
  const signedOut = page.waitForResponse((response) => response.url().endsWith('/api/auth/sign-out') && response.request().method() === 'POST');
  await page.getByRole("button", { name: "Sign out" }).click();
  expect((await signedOut).ok()).toBe(true);
  await page.waitForURL((url) => url.pathname === '/');
  await page.goto(saved);
  await expect(
    page.getByRole("heading", { name: "A workspace of your own" }),
  ).toBeVisible();
  await page.goto("/directory?jurisdiction=US-CA");
  await expect(
    page.getByRole("heading", { name: "More coverage is on the way" }),
  ).toBeVisible();
  await page.goto("/");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
