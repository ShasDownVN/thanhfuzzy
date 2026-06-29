import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/mobile",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/mobile", open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "Chrome Android", use: { ...devices["Pixel 7"] } },
    { name: "Safari iPhone", use: { ...devices["iPhone 14"] } }
  ],
  webServer: [
    {
      command: "npm.cmd --prefix ../trungfuzzy-backend run dev",
      url: "http://localhost:3001",
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: "npm.cmd run dev:client",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 120_000
    }
  ]
});
