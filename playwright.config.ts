import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const localEnv = fileURLToPath(new URL("./.env.local", import.meta.url));
if (existsSync(localEnv)) process.loadEnvFile(localEnv);

const baseURL = `http://127.0.0.1:${process.env.WEB_PORT || "5173"}`;
export default defineConfig({
  timeout: 90000,
  expect: { timeout: 10000 },
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
      },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 90000,
  },
});
