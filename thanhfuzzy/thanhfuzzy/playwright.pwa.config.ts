import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pwa",
  reporter: [["list"], ["html", { outputFolder: "playwright-report/pwa", open: "never" }]],
  use: {
    ...devices["Pixel 7"],
    baseURL: "http://localhost:4173",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [{ name: "PWA Chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm.cmd run preview -- --host 127.0.0.1 --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000
  }
});
