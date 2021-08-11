import { PlaywrightTestConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default {
  timeout: 10_000,
  retries: isCI ? 2 : 0,
  forbidOnly: isCI,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000/demo/",
    headless: true, // Change to `false` for debugging
    viewport: { width: 1280, height: 720 },
    video: "retain-on-failure",
  },
} as PlaywrightTestConfig;
