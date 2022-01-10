import { PlaywrightTestConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default {
  timeout: isCI ? 10_000 : Math.pow(2, 30),
  retries: isCI ? 2 : 0,
  forbidOnly: isCI,
  reporter: "list",
  workers: isCI ? undefined : 4, // Limit parallelism locally to avoid fan noise
  use: {
    baseURL: "http://localhost:3000",
    headless: isCI || true, // Change to `false` for debugging
    viewport: { width: 1280, height: 720 },
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "yarn zx ./scripts/start-test-server.mjs",
    port: 3000,
    timeout: 100_000, // This is a long timeout because the command will also build all packages if needed
    reuseExistingServer: true,
  },
} as PlaywrightTestConfig;
