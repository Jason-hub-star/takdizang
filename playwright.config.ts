import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e/.results",
  snapshotDir: "e2e/.snapshots",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet",
      use: { ...devices["iPad Mini"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], viewport: { width: 375, height: 812 } },
    },
  ],
});
