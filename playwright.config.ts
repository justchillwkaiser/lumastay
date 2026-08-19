import { defineConfig, devices } from "@playwright/test";

// Playwright E2E (plan 3 task 6): booking flow against `next start` on a
// dedicated port so it never collides with the dev server.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3200",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run start -- -p 3200",
    url: "http://localhost:3200",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
