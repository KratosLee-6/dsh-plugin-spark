import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/ui",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4318",
    browserName: "chromium",
    channel: process.env.SPARK_BROWSER_CHANNEL || undefined,
    viewport: { width: 1440, height: 1100 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node dist/cli.js studio --port 4318 --data-dir .test-data/ui-${Date.now()}`,
    url: "http://127.0.0.1:4318",
    reuseExistingServer: false,
  },
});
