// Browser CI uses a Playwright-supported Ubuntu runner.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./packages/css-color-parser/browser-tests",
  workers: 1,
  use: { browserName: "chromium" },
});
